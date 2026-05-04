'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { TasbihIcon } from '@/components/icons/tasbih-icon'
import { QiblaIcon } from '@/components/icons/qibla-icon'
import { QuranIcon } from '@/components/icons/quran-icon'
import { SolatStreakIcon } from '@/components/icons/solat-streak-icon'
import { HadisIcon } from '@/components/icons/hadis-icon'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
import Image from 'next/image'
import { Bell } from 'lucide-react'
import { getSolatStreak } from '@/app/actions/solat'
import { getQuranBookmark } from '@/app/actions/quran'

/* ─── Tool card data ─────────────────────────────────────────────────────── */

const TOOLS = [
  {
    href: '/ibadah/tasbih',
    label: 'Tasbih',
    sub: '99 zikir',
    badge: '99',
    resumeLabel: 'SAMBUNG',
    color: '#EAF4EE',
    iconColor: '#2D6A4F',
    icon: () => <TasbihIcon size={24} className="text-[#2D6A4F]" />,
    badgeColor: '#2D6A4F',
  },
  {
    href: '/ibadah/qibla',
    label: 'Qiblat',
    sub: '292°',
    badge: null,
    resumeLabel: null,
    color: '#F0F4FF',
    iconColor: '#4B6CB7',
    icon: () => <QiblaIcon size={24} className="text-[#4B6CB7]" />,
    badgeColor: '#4B6CB7',
  },
  {
    href: '/ibadah/quran',
    label: 'Al-Quran',
    sub: 'Surah 2:183',
    badge: 'ق',
    resumeLabel: 'SAMBUNG',
    color: '#FFF8EE',
    iconColor: '#C9A84C',
    icon: () => <QuranIcon size={24} className="text-[#C9A84C]" />,
    badgeColor: '#C9A84C',
  },
  {
    href: '/ibadah/solat',
    label: 'Streak Solat',
    sub: '14 hari',
    badge: '14',
    resumeLabel: null,
    color: '#FFF3F5',
    iconColor: '#C0392B',
    icon: () => <SolatStreakIcon size={24} className="text-[#C0392B]" />,
    badgeColor: '#C0392B',
  },
  {
    href: '/ibadah/hadis',
    label: 'Hadis Pilihan',
    sub: 'Sahih Bukhari',
    badge: 'ح',
    resumeLabel: null,
    color: '#F5F0FF',
    iconColor: '#7B5EA7',
    icon: () => <HadisIcon size={24} className="text-[#7B5EA7]" />,
    badgeColor: '#7B5EA7',
  },
  {
    href: '/ibadah/mathurat',
    label: 'Mathurat',
    sub: 'Pagi & Petang',
    badge: 'م',
    resumeLabel: null,
    color: '#F0FAF5',
    iconColor: '#2D9C6A',
    icon: () => <Clock size={24} strokeWidth={1.5} color="#2D9C6A" />,
    badgeColor: '#2D9C6A',
  },
]

/* ─── Circular progress ring ─────────────────────────────────────────────── */

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const pct = total > 0 ? done / total : 0
  const offset = circ * (1 - pct)

  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#E8E5DF" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke="#2D6A4F" strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute text-[14px] font-bold"
        style={{ color: '#1A1916' }}
      >
        {done}/{total}
      </span>
    </div>
  )
}

/* ─── IbadahHub ──────────────────────────────────────────────────────────── */

type Props = {
  nextPrayer?: { label: string; time: string }
  ibadahDone?: number
  ibadahTotal?: number
}

export function IbadahHub({ nextPrayer, ibadahDone = 6, ibadahTotal = 8 }: Props) {
  const [prayer, setPrayer] = useState(nextPrayer ?? { label: 'Asar', time: '16:32' })
  const [solatStreak, setSolatStreak] = useState(0)
  const [showTasbihResume, setShowTasbihResume] = useState(false)
  const [showQuranResume, setShowQuranResume] = useState(false)
  const remaining = ibadahTotal - ibadahDone

  useEffect(() => {
    if (!nextPrayer) {
      try {
        const cached = JSON.parse(localStorage.getItem('sajda_prayer_times_banner') ?? '{}')
        if (Array.isArray(cached.prayers)) {
          const now = new Date()
          const cur = now.getHours() * 60 + now.getMinutes()
          for (const p of cached.prayers) {
            const [h, m] = p.time.split(':').map(Number)
            if (h! * 60 + m! > cur) {
              setPrayer({ label: p.label, time: p.time })
              break
            }
          }
        }
      } catch {}
    }

    try {
      const tasbih = JSON.parse(localStorage.getItem('sajda_tasbih') ?? 'null')
      setShowTasbihResume((tasbih?.sessions ?? 0) > 0)
    } catch {}

    getSolatStreak().then(({ currentStreak }) => setSolatStreak(currentStreak)).catch(() => {})
    getQuranBookmark().then((bm) => setShowQuranResume(bm !== null)).catch(() => {})
  }, [nextPrayer])

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F6F3' }}>
      <Sidebar mosques={[]} selectedId={null} onMosqueSelect={() => {}} />

      <div className="flex-1 flex flex-col md:ml-[240px]">
        {/* Mobile header */}
        <header
          className="md:hidden sticky top-0 z-30 safe-top"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E5DF' }}
        >
          <div className="flex items-center justify-between px-5 h-14">
            <Image src="/sajda-logo.png" alt="SAJDA" width={80} height={32} className="object-contain" priority />
            <span className="text-[13px] font-semibold" style={{ color: '#1A1916' }}>Ibadah</span>
            <button className="w-11 h-11 flex items-center justify-center" aria-label="Pemberitahuan">
              <Bell size={20} strokeWidth={1.5} color="#1A1916" />
            </button>
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-10">
          <div className="px-5 pt-6 md:max-w-[900px] md:mx-auto md:px-8 md:py-6">

            {/* Page heading */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: '#C9A84C' }}>
              Ibadah
            </p>
            <h1
              className="text-[26px] font-bold leading-tight mb-5"
              style={{ color: '#1A1916', fontFamily: 'var(--font-playfair)' }}
            >
              Alat-alat<br />untuk hari ini
            </h1>

            {/* Today's progress card */}
            <div
              className="flex items-center gap-4 p-4 rounded-2xl mb-6"
              style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
            >
              <ProgressRing done={ibadahDone} total={ibadahTotal} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#A8A49E' }}>
                  Hari Ini
                </p>
                <p className="text-[15px] font-semibold leading-snug" style={{ color: '#1A1916' }}>
                  Solat {prayer.label} · {prayer.time}
                </p>
                {remaining > 0 && (
                  <p className="text-[13px] mt-0.5" style={{ color: '#6B6860' }}>
                    {remaining} ibadah lagi tunggu
                  </p>
                )}
              </div>
            </div>

            {/* Tool cards grid */}
            <div className="grid grid-cols-2 gap-3">
              {TOOLS.map((tool, i) => {
                let sub = tool.sub
                let badge = tool.badge
                let resumeLabel = tool.resumeLabel
                if (tool.href === '/ibadah/solat') {
                  sub = `${solatStreak} hari`
                  badge = String(solatStreak)
                } else if (tool.href === '/ibadah/tasbih') {
                  resumeLabel = showTasbihResume ? 'SAMBUNG' : null
                } else if (tool.href === '/ibadah/quran') {
                  resumeLabel = showQuranResume ? 'SAMBUNG' : null
                }
                return (
                <motion.a
                  key={tool.href}
                  href={tool.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  className="relative flex flex-col p-4 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
                  style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', minHeight: '110px' }}
                >
                  {/* Icon top-left */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: tool.color }}
                  >
                    <tool.icon />
                  </div>

                  {/* Badge top-right */}
                  {badge && (
                    <span
                      className="absolute top-4 right-4 text-[13px] font-bold"
                      style={{ color: tool.badgeColor, fontFamily: badge.match(/[؀-ۿ]/) ? 'var(--font-amiri)' : undefined }}
                    >
                      {badge}
                    </span>
                  )}

                  {/* Label + sub */}
                  <p className="text-[13px] font-semibold" style={{ color: '#1A1916' }}>{tool.label}</p>
                  <p className="text-[12px]" style={{ color: '#A8A49E' }}>{sub}</p>

                  {/* Resume link */}
                  {resumeLabel && (
                    <p className="text-[11px] font-semibold mt-1" style={{ color: '#2D6A4F' }}>
                      ▶ {resumeLabel}
                    </p>
                  )}
                </motion.a>
                )
              })}
            </div>

          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
