'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckSquare, Heart, Zap } from 'lucide-react'
import { QuranIcon }       from '@/components/icons/quran-icon'
import { SolatStreakIcon } from '@/components/icons/solat-streak-icon'
import { TasbihIcon }      from '@/components/icons/tasbih-icon'
import { QiblaIcon }       from '@/components/icons/qibla-icon'
import { TazkirahIcon }    from '@/components/icons/tazkirah-icon'
import { HadisIcon }       from '@/components/icons/hadis-icon'
import { createClient } from '@/lib/supabase/browser'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
import { LogoTopBar } from '@/components/ui/LogoTopBar'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Prayer           = { name: string; label: string; labelAr: string; time: string }
type ChecklistProgress = { done: number; total: number }

type SolatStreak = {
  current_streak: number
  longest_streak: number
}

type QuranBookmark = {
  page_number: number
  verse_key:   string | null
}

type PahalaChecklist = {
  subuh_done:   boolean
  zohor_done:   boolean
  asar_done:    boolean
  maghrib_done: boolean
  isyak_done:   boolean
  quran_done:   boolean
  zikir_done:   boolean
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const ARABIC_NAMES: Record<string, string> = {
  subuh:   'الفجر',
  zohor:   'الظهر',
  asar:    'العصر',
  maghrib: 'المغرب',
  isyak:   'العشاء',
}

const FALLBACK_PRAYERS: Prayer[] = [
  { name: 'subuh',   label: 'Subuh',   labelAr: 'الفجر',  time: '05:50' },
  { name: 'zohor',   label: 'Zohor',   labelAr: 'الظهر',  time: '13:10' },
  { name: 'asar',    label: 'Asar',    labelAr: 'العصر',  time: '16:35' },
  { name: 'maghrib', label: 'Maghrib', labelAr: 'المغرب', time: '19:22' },
  { name: 'isyak',   label: 'Isyak',   labelAr: 'العشاء', time: '20:35' },
]

const LS_KEY_PRAYERS = 'sajda_prayer_times_banner'

const MALAY_DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

const TOOLS: {
  label:     string
  sub:       string
  href:      string
  icon:      React.FC<{ size?: number; className?: string }>
  iconBg:    string
  iconColor: string
}[] = [
  {
    label:     'Al-Quran',
    sub:       'Teruskan bacaan',
    href:      '/ibadah/quran',
    icon:      QuranIcon,
    iconBg:    'rgba(201,168,76,0.15)',
    iconColor: '#C9A84C',
  },
  {
    label:     'Waktu Solat',
    sub:       'Jadual & streak',
    href:      '/ibadah/solat',
    icon:      SolatStreakIcon,
    iconBg:    'rgba(30,107,69,0.15)',
    iconColor: '#1E6B45',
  },
  {
    label:     'Tasbih',
    sub:       'Zikir digital',
    href:      '/ibadah/tasbih',
    icon:      TasbihIcon,
    iconBg:    'rgba(82,196,138,0.15)',
    iconColor: '#52C48A',
  },
  {
    label:     'Kiblat',
    sub:       'Cari arah kiblat',
    href:      '/ibadah/qibla',
    icon:      QiblaIcon,
    iconBg:    'rgba(107,143,212,0.15)',
    iconColor: '#6B8FD4',
  },
  {
    label:     'Senarai Semak',
    sub:       'Amalan harian',
    href:      '/ibadah/checklist',
    icon:      CheckSquare,
    iconBg:    'rgba(30,107,69,0.15)',
    iconColor: '#1E6B45',
  },
  {
    label:     'Tazkirah',
    sub:       'Renungan hari ini',
    href:      '/ibadah/tazkirah',
    icon:      TazkirahIcon,
    iconBg:    'rgba(245,158,11,0.15)',
    iconColor: '#F59E0B',
  },
  {
    label:     'Hadis Harian',
    sub:       'Hadis pilihan',
    href:      '/ibadah/hadis',
    icon:      HadisIcon,
    iconBg:    'rgba(166,124,197,0.15)',
    iconColor: '#A67CC5',
  },
  {
    label:     'Doa Bersama',
    sub:       'Doa komuniti',
    href:      '/doa',
    icon:      Heart,
    iconBg:    'rgba(239,68,68,0.15)',
    iconColor: '#EF4444',
  },
]

/* ─── Date helpers ───────────────────────────────────────────────────────── */

function getDateLabel(date: Date): string {
  const dayName = MALAY_DAYS[date.getDay()] ?? ''
  try {
    const hijri = new Intl.DateTimeFormat('ms-MY-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
    return `${dayName} · ${hijri}`
  } catch {
    return dayName
  }
}

/* ─── Prayer helpers ─────────────────────────────────────────────────────── */

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h! * 60 + m!
}

function getNextPrayer(prayers: Prayer[]): { prayer: Prayer; minutesLeft: number } {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  for (let i = 0; i < prayers.length; i++) {
    if (toMinutes(prayers[i]!.time) > cur) {
      return { prayer: prayers[i]!, minutesLeft: toMinutes(prayers[i]!.time) - cur }
    }
  }
  const fajr = prayers[0]!
  return { prayer: fajr, minutesLeft: 1440 - cur + toMinutes(fajr.time) }
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `dalam ${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `dalam ${h}j` : `dalam ${h}j ${m}m`
}

/* ─── Data fetchers ──────────────────────────────────────────────────────── */

async function getSolatStreak(): Promise<number> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0
    const { data } = await supabase
      .from('solat_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single()
    const row = data as SolatStreak | null
    return row?.current_streak ?? 0
  } catch {
    return 0
  }
}

async function getQuranBookmark(): Promise<number | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('quran_bookmarks')
      .select('page_number')
      .eq('user_id', user.id)
      .single()
    const row = data as QuranBookmark | null
    return row?.page_number ?? null
  } catch {
    return null
  }
}

async function getChecklistProgress(): Promise<ChecklistProgress> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { done: 0, total: 7 }
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('pahala_checklist')
      .select('subuh_done, zohor_done, asar_done, maghrib_done, isyak_done, quran_done, zikir_done')
      .eq('user_id', user.id)
      .eq('checklist_date', today)
      .single()
    const row = data as PahalaChecklist | null
    if (!row) return { done: 0, total: 7 }
    const done = [
      row.subuh_done,
      row.zohor_done,
      row.asar_done,
      row.maghrib_done,
      row.isyak_done,
      row.quran_done,
      row.zikir_done,
    ].filter(Boolean).length
    return { done, total: 7 }
  } catch {
    return { done: 0, total: 7 }
  }
}

/* ─── Animation variants ─────────────────────────────────────────────────── */

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const sectionVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 35 } },
}

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
}

const gridItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 35 } },
}

/* ─── Progress Ring ──────────────────────────────────────────────────────── */

const RING_R      = 62
const RING_CIRCUM = 2 * Math.PI * RING_R

function ProgressRing({ done, total }: ChecklistProgress) {
  const progress     = total > 0 ? done / total : 0
  const targetOffset = RING_CIRCUM * (1 - progress)

  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track — visible on dark green */}
        <circle
          cx="70"
          cy="70"
          r={RING_R}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="8"
        />
        {/* Gold progress arc */}
        <motion.circle
          cx="70"
          cy="70"
          r={RING_R}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUM}
          initial={{ strokeDashoffset: RING_CIRCUM, stroke: '#C9A84C' }}
          animate={{ strokeDashoffset: targetOffset, stroke: '#C9A84C' }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          style={{ stroke: '#C9A84C' }}
        />
      </svg>

      {/* Center count */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '48px',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1,
          }}
        >
          {done}/{total}
        </span>
      </div>
    </div>
  )
}

/* ─── Streak Pill ────────────────────────────────────────────────────────── */

function StreakPill({ streak }: { streak: number }) {
  if (streak === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28, delay: 1.0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.12)',
        border:     '1px solid rgba(255,255,255,0.20)',
      }}
    >
      <Zap size={12} color="rgba(255,255,255,0.80)" strokeWidth={2} />
      <span
        style={{
          fontFamily: 'var(--font-jakarta)',
          fontSize:   '12px',
          fontWeight: 600,
          color:      'rgba(255,255,255,0.80)',
        }}
      >
        {streak} hari berturut-turut
      </span>
    </motion.div>
  )
}

/* ─── Next Prayer Card ───────────────────────────────────────────────────── */

function NextPrayerCard({ prayers }: { prayers: Prayer[] }) {
  const [state, setState] = useState(() => getNextPrayer(prayers))

  useEffect(() => {
    setState(getNextPrayer(prayers))
    const id = setInterval(() => setState(getNextPrayer(prayers)), 60_000)
    return () => clearInterval(id)
  }, [prayers])

  const { prayer, minutesLeft } = state

  return (
    <div
      className="flex items-center justify-between rounded-2xl px-4 py-4"
      style={{
        background:   'var(--surface-raised)',
        borderTop:    '1px solid var(--border)',
        borderRight:  '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft:   '3px solid #C9A84C',
      }}
    >
      {/* Prayer name + Arabic */}
      <div className="flex flex-col gap-0.5">
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize:   '20px',
            fontWeight: 600,
            color:      'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {prayer.label}
        </span>
        <span
          dir="rtl"
          style={{
            fontFamily: 'var(--font-amiri)',
            fontSize:   '14px',
            color:      'var(--text-arabic)',
            lineHeight: 1.4,
          }}
        >
          {prayer.labelAr}
        </span>
      </div>

      {/* Time + countdown */}
      <div className="flex flex-col items-end gap-0.5">
        <span
          className="tabular-nums"
          style={{
            fontFamily:        'var(--font-jakarta), monospace',
            fontSize:          '24px',
            fontWeight:        700,
            color:             'var(--primary)',
            fontVariantNumeric:'tabular-nums',
            lineHeight:        1.1,
          }}
        >
          {prayer.time}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize:   '11px',
            color:      'var(--text-secondary)',
          }}
        >
          {formatCountdown(minutesLeft)}
        </span>
      </div>
    </div>
  )
}

/* ─── Tool Grid ──────────────────────────────────────────────────────────── */

function ToolGrid({ quranPage }: { quranPage: number | null }) {
  return (
    <motion.div
      variants={gridContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3"
    >
      {TOOLS.map((tool) => {
        const Icon    = tool.icon
        const isQuran = tool.href === '/ibadah/quran'
        const subText = isQuran && quranPage !== null ? `ms. ${quranPage}` : tool.sub

        return (
          <motion.div key={tool.href} variants={gridItem}>
            <Link href={tool.href}>
              <motion.div
                whileTap={{ scale: 0.94 }}
                className="flex flex-col items-start gap-3 rounded-2xl p-4 cursor-pointer"
                style={{
                  background: 'var(--surface-raised)',
                  border:     '1px solid var(--border)',
                  minHeight:  '100px',
                  boxShadow:  'var(--shadow-sm)',
                }}
              >
                {/* Icon circle */}
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width:      40,
                    height:     40,
                    background: tool.iconBg,
                    flexShrink: 0,
                    color:      tool.iconColor,
                  }}
                >
                  <Icon size={18} />
                </div>

                {/* Label + sub */}
                <div className="flex flex-col gap-0.5">
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize:   '15px',
                      fontWeight: 600,
                      color:      'var(--text-primary)',
                      lineHeight: 1.2,
                    }}
                  >
                    {tool.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      fontSize:   '11px',
                      color:      'var(--text-secondary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {subText}
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── IbadahHub ──────────────────────────────────────────────────────────── */

export function IbadahHub() {
  const [progress, setProgress]           = useState<ChecklistProgress>({ done: 0, total: 7 })
  const [prayers, setPrayers]             = useState<Prayer[]>(FALLBACK_PRAYERS)
  const [solatStreak, setSolatStreak]     = useState(0)
  const [quranPage, setQuranPage]         = useState<number | null>(null)

  const dateLabel = useMemo(() => getDateLabel(new Date()), [])

  // Read prayer times from the shared localStorage cache (written by PrayerBanner)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const cached = JSON.parse(localStorage.getItem(LS_KEY_PRAYERS) ?? '{}') as {
        date?:    string
        prayers?: { name: string; label: string; time: string }[]
      }
      if (cached.date === today && Array.isArray(cached.prayers)) {
        setPrayers(
          cached.prayers.map((p) => ({ ...p, labelAr: ARABIC_NAMES[p.name] ?? '' }))
        )
      }
    } catch {}
  }, [])

  // Fetch Supabase user data
  useEffect(() => {
    void getChecklistProgress().then(setProgress)
    void getSolatStreak().then(setSolatStreak)
    void getQuranBookmark().then(setQuranPage)
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface)' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset on desktop to clear 240px sidebar */}
      <div className="flex-1 flex flex-col md:ml-[240px] pt-14 md:pt-0">
        <LogoTopBar />
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6 px-4 pt-6 pb-28 md:grid md:grid-cols-3 md:gap-8 md:px-8 md:pt-8 md:pb-8"
        >
          {/* ── Page header ──────────────────────────────────────────── */}
          <motion.div variants={sectionVariant} className="md:col-span-3">
            <h1
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize:   '32px',
                fontWeight: 600,
                color:      'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              Hub Ibadah
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-jakarta)',
                fontSize:   '13px',
                color:      'var(--text-secondary)',
                marginTop:  '4px',
              }}
            >
              Hari ini, {dateLabel}
            </p>
          </motion.div>

          {/* ── Left col: progress ring + next prayer ────────────────── */}
          <div className="flex flex-col gap-4 md:col-span-1">

            {/* Dark green ring card */}
            <motion.section variants={sectionVariant}>
              <div
                className="flex flex-col items-center gap-4 rounded-3xl p-8"
                style={{ background: 'linear-gradient(135deg, #1E6B45 0%, #0F3D26 100%)' }}
              >
                <ProgressRing done={progress.done} total={progress.total} />

                <p
                  style={{
                    fontFamily:    'var(--font-jakarta)',
                    fontSize:      '13px',
                    color:         'rgba(255,255,255,0.65)',
                    letterSpacing: '0.02em',
                  }}
                >
                  ibadah selesai
                </p>

                <StreakPill streak={solatStreak} />
              </div>
            </motion.section>

            {/* Next prayer card */}
            <motion.section variants={sectionVariant} className="flex flex-col gap-2">
              <h2
                className="px-1"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize:   '20px',
                  fontWeight: 500,
                  color:      'var(--text-primary)',
                }}
              >
                Solat Seterusnya
              </h2>
              <NextPrayerCard prayers={prayers} />
            </motion.section>
          </div>

          {/* ── Right col: tool grid ─────────────────────────────────── */}
          <motion.section variants={sectionVariant} className="flex flex-col gap-2 md:col-span-2">
            <h2
              className="px-1"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize:   '20px',
                fontWeight: 500,
                color:      'var(--text-primary)',
              }}
            >
              Alat Ibadah
            </h2>
            <ToolGrid quranPage={quranPage} />
          </motion.section>
        </motion.div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </div>
  )
}
