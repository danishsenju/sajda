'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { Sidebar } from '@/components/ui/Sidebar'
import { BottomNav } from '@/components/ui/BottomNav'

/* ─── Exported types (used by page.tsx) ──────────────────────────────────── */

export type MosqueProfile = {
  id: string
  name: string
  address: string
  phone: string | null
  website: string | null
  zone_code: string | null
  jemaah_count: number
  announcements_this_month: number
  is_following: boolean
  theme: {
    primary: string
    accent: string
    logo_url: string | null
    banner_url: string | null
  }
}

export type Announcement = {
  id: string
  title: string
  body: string
  published_at: string
  category: string | null
}

export type DoaWish = {
  id: string
  doa_text: string
  is_anonymous: boolean
  display_name: string | null
  aamiin_count: number
  user_has_aamined: boolean
  created_at: string
}

export type JanaizEntry = {
  id: string
  arwah_name: string
  age: number
  date_passed: string
  solat_jenazah_time: string
  jenazah_location: string
  notes: string | null
}

export type Program = {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  image_url: string | null
  category: string
}

export type JadualEntry = {
  id: string
  date: string
  prayer: string
  role: string
  officer_name: string
  notes: string | null
}

/* ─── Internal types ─────────────────────────────────────────────────────── */

type Tab = 'Pengumuman' | 'Doa' | 'Janaiz' | 'Program' | 'Jadual'
const TABS: Tab[] = ['Pengumuman', 'Doa', 'Janaiz', 'Program', 'Jadual']

type Props = {
  mosque: MosqueProfile
  announcements: Announcement[]
  doaWishes: DoaWish[]
  janaizList: JanaizEntry[]
  programs: Program[]
  jadualList: JadualEntry[]
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ms-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} hari lalu`
  if (hours > 0) return `${hours} jam lalu`
  if (mins > 0) return `${mins} minit lalu`
  return 'Baru sahaja'
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

function getCategoryStyle(category: string | null): { bg: string; color: string } {
  switch (category) {
    case 'Penting':   return { bg: 'var(--surface-overlay)', color: 'var(--error)' }
    case 'Kewangan':  return { bg: 'var(--gold-muted)',       color: 'var(--gold)' }
    case 'Ceramah':
    case 'Kursus':
    case 'Aktiviti':  return { bg: 'var(--primary-muted)',    color: 'var(--primary)' }
    case 'Majlis':    return { bg: 'var(--gold-muted)',       color: 'var(--gold)' }
    default:          return { bg: 'var(--surface-overlay)',  color: 'var(--text-secondary)' }
  }
}

const PRAYER_LABELS: Record<string, string> = {
  subuh: 'Subuh', zohor: 'Zohor', asar: 'Asar', maghrib: 'Maghrib', isyak: 'Isyak',
}
const PRAYER_ARABIC: Record<string, string> = {
  subuh: 'الفجر', zohor: 'الظهر', asar: 'العصر', maghrib: 'المغرب', isyak: 'العشاء',
}
const PRAYER_ORDER = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak']

/* ─── Shared animation variants ─────────────────────────────────────────── */

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}
const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 35 } },
}

/* ─── Empty state ────────────────────────────────────────────────────────── */

function TabEmpty({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <p
        className="text-[22px] font-semibold"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
      >
        {title}
      </p>
      <p className="text-[13px] text-center" style={{ color: 'var(--text-secondary)' }}>
        {sub}
      </p>
    </div>
  )
}

/* ─── Tab: Pengumuman ────────────────────────────────────────────────────── */

function AnnouncementsTab({ items }: { items: Announcement[] }) {
  if (!items.length) return <TabEmpty title="Tiada Pengumuman" sub="Masjid belum ada pengumuman baru" />

  return (
    <motion.div
      variants={listVariants} initial="hidden" animate="show"
      className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0"
    >
      {items.map(ann => {
        const isPinned = ann.category === 'Penting'
        const catStyle = getCategoryStyle(ann.category)
        return (
          <motion.div
            key={ann.id}
            variants={rowVariants}
            className="rounded-2xl p-4"
            style={{
              background: 'var(--surface-raised)',
              borderTop: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              borderLeft: isPinned ? '4px solid var(--gold)' : '1px solid var(--border)',
            }}
          >
            <div className="flex items-start gap-2 mb-2">
              <h3
                className="text-[15px] font-semibold leading-snug flex-1"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-jakarta)' }}
              >
                {ann.title}
              </h3>
              {ann.category && (
                <span
                  className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                  style={{ background: catStyle.bg, color: catStyle.color }}
                >
                  {ann.category}
                </span>
              )}
            </div>
            <p
              className="text-[13px] leading-relaxed line-clamp-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              {ann.body}
            </p>
            <p className="mt-2.5 text-[11px]" style={{ color: 'var(--text-disabled)' }}>
              {formatDate(ann.published_at)}
            </p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── Tab: Doa ───────────────────────────────────────────────────────────── */

function DoaTab({ items }: { items: DoaWish[] }) {
  const [aamined, setAamined] = useState<Set<string>>(
    new Set(items.filter(d => d.user_has_aamined).map(d => d.id))
  )
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(items.map(d => [d.id, d.aamiin_count]))
  )

  async function handleAamiin(id: string) {
    if (aamined.has(id)) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setAamined(prev => new Set([...prev, id]))
    setCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
    await (supabase as any).from('doa_aamiin').insert({ doa_id: id, user_id: user.id })
  }

  if (!items.length) return <TabEmpty title="Tiada Doa" sub="Belum ada doa dari jemaah masjid ini" />

  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
      {items.map(doa => {
        const isAamined = aamined.has(doa.id)
        const name = doa.is_anonymous ? 'Hamba Allah' : (doa.display_name ?? 'Hamba Allah')
        const initials = name === 'Hamba Allah'
          ? '☽'
          : name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

        return (
          <motion.div
            key={doa.id}
            variants={rowVariants}
            className="rounded-2xl p-4"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                style={{ background: 'var(--primary)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>
                  {timeAgo(doa.created_at)}
                </p>
              </div>
            </div>

            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {doa.doa_text}
            </p>

            <div className="mt-3 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleAamiin(doa.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  ...(isAamined
                    ? { background: 'var(--gold-muted)', color: 'var(--gold)' }
                    : { background: 'var(--surface-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }),
                }}
              >
                🤲 Aamiin · {counts[doa.id] ?? 0}
              </motion.button>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── Tab: Janaiz ────────────────────────────────────────────────────────── */

function JanaizTab({ items }: { items: JanaizEntry[] }) {
  if (!items.length) return <TabEmpty title="Tiada Rekod Janaiz" sub="Tiada rekod janaiz masa kini" />

  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-3">
      {items.map(j => (
        <motion.div
          key={j.id}
          variants={rowVariants}
          className="rounded-2xl p-4"
          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
              style={{
                background: 'var(--surface-overlay)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-amiri)',
              }}
            >
              إنا
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[16px] font-semibold leading-snug"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
              >
                {j.arwah_name}
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Usia {j.age} tahun · {formatDate(j.date_passed)}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  Solat Jenazah: {formatDateTime(j.solat_jenazah_time)}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {j.jenazah_location}
                </p>
                {j.notes && (
                  <p className="text-[12px] mt-1" style={{ color: 'var(--text-disabled)' }}>
                    {j.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ─── Tab: Program ───────────────────────────────────────────────────────── */

function ProgramTab({ items }: { items: Program[] }) {
  if (!items.length) return <TabEmpty title="Tiada Program" sub="Belum ada program dijadualkan" />

  return (
    <motion.div
      variants={listVariants} initial="hidden" animate="show"
      className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0"
    >
      {items.map(prog => {
        const date = new Date(prog.event_date)
        const day = date.getDate()
        const month = date.toLocaleDateString('ms-MY', { month: 'short' })
        const catStyle = getCategoryStyle(prog.category)

        return (
          <motion.div
            key={prog.id}
            variants={rowVariants}
            className="flex rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
          >
            {/* Date badge */}
            <div
              className="w-16 flex flex-col items-center justify-center py-4 shrink-0"
              style={{ background: 'var(--primary-muted)' }}
            >
              <span
                className="text-[28px] font-bold leading-none"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-cormorant)' }}
              >
                {day}
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wide mt-1"
                style={{ color: 'var(--primary)' }}
              >
                {month}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 py-3 px-4 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3
                  className="text-[14px] font-semibold flex-1 leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {prog.title}
                </h3>
                <span
                  className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                  style={{ background: catStyle.bg, color: catStyle.color }}
                >
                  {prog.category}
                </span>
              </div>
              <p
                className="text-[12px] leading-relaxed line-clamp-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {prog.description}
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-disabled)' }}>
                {prog.event_time} · {prog.location}
              </p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── Tab: Jadual ────────────────────────────────────────────────────────── */

function JadualTab({ items }: { items: JadualEntry[] }) {
  if (!items.length) return <TabEmpty title="Tiada Jadual" sub="Jadual imam dan bilal belum tersedia" />

  const today = new Date().toISOString().slice(0, 10)

  const grouped = items.reduce<Record<string, JadualEntry[]>>((acc, j) => {
    ;(acc[j.date] ??= []).push(j)
    return acc
  }, {})

  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-6">
      {Object.entries(grouped).map(([date, entries]) => {
        const dateLabel = date === today
          ? 'Hari Ini'
          : new Date(date).toLocaleDateString('ms-MY', {
              weekday: 'long', day: 'numeric', month: 'long',
            })

        const byPrayer = entries.reduce<Record<string, JadualEntry[]>>((acc, e) => {
          ;(acc[e.prayer] ??= []).push(e)
          return acc
        }, {})

        const presentPrayers = PRAYER_ORDER.filter(p => byPrayer[p]?.length)

        return (
          <motion.div key={date} variants={rowVariants}>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {dateLabel}
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
            >
              {presentPrayers.map((prayer, idx) => {
                const pEntries = byPrayer[prayer]!
                const imam = pEntries.find(e => e.role === 'imam')
                const bilal = pEntries.find(e => e.role === 'bilal')
                const isLast = idx === presentPrayers.length - 1

                return (
                  <div
                    key={prayer}
                    className="flex items-center gap-4 px-4 py-3.5"
                    style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
                  >
                    <div className="w-20 shrink-0">
                      <p
                        className="text-[14px] font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {PRAYER_LABELS[prayer]}
                      </p>
                      <p
                        className="text-[13px] leading-tight"
                        style={{ color: 'var(--text-arabic)', fontFamily: 'var(--font-amiri)' }}
                        dir="rtl"
                      >
                        {PRAYER_ARABIC[prayer]}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      {imam && (
                        <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                          <span style={{ color: 'var(--text-disabled)' }}>Imam  </span>
                          {imam.officer_name}
                        </p>
                      )}
                      {bilal && (
                        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--text-disabled)' }}>Bilal  </span>
                          {bilal.officer_name}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── MosqueProfileShell ─────────────────────────────────────────────────── */

export function MosqueProfileShell({
  mosque,
  announcements,
  doaWishes,
  janaizList,
  programs,
  jadualList,
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('Pengumuman')
  const [isFollowing, setIsFollowing] = useState(mosque.is_following)
  const [followLoading, setFollowLoading] = useState(false)

  async function handleFollow() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setFollowLoading(true)
    if (isFollowing) {
      await (supabase as any)
        .from('jemaah_follows').delete()
        .eq('user_id', user.id).eq('masjid_id', mosque.id)
      setIsFollowing(false)
    } else {
      await (supabase as any)
        .from('jemaah_follows').insert({ user_id: user.id, masjid_id: mosque.id })
      setIsFollowing(true)
    }
    setFollowLoading(false)
  }

  const tabContent: Record<Tab, React.ReactNode> = {
    Pengumuman: <AnnouncementsTab items={announcements} />,
    Doa:        <DoaTab items={doaWishes} />,
    Janaiz:     <JanaizTab items={janaizList} />,
    Program:    <ProgramTab items={programs} />,
    Jadual:     <JadualTab items={jadualList} />,
  }

  const bannerBg = mosque.theme.banner_url
    ? `url(${mosque.theme.banner_url}) center/cover no-repeat`
    : `linear-gradient(135deg, ${mosque.theme.primary} 0%, #0F3D26 100%)`

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--surface)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 md:ml-60">

        {/* ── Banner ── */}
        <div
          className="relative shrink-0 h-40 md:h-32"
          style={{ background: bannerBg }}
        >
          {/* Gradient overlay for text legibility */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.10) 60%, transparent 100%)' }}
          />

          {/* Back — mobile only */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => router.back()}
            className="md:hidden absolute top-4 left-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.28)' }}
            aria-label="Kembali"
          >
            <ChevronLeft size={20} color="white" strokeWidth={2.2} />
          </motion.button>

          {/* Follow button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleFollow}
            disabled={followLoading}
            className="absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full text-[12px] font-semibold"
            style={{
              fontFamily: 'var(--font-jakarta)',
              ...(isFollowing
                ? {
                    background: 'rgba(255,255,255,0.18)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.38)',
                  }
                : {
                    background: '#ffffff',
                    color: mosque.theme.primary,
                  }),
            }}
          >
            {followLoading ? '···' : isFollowing ? 'Diikuti ✓' : '+ Ikut'}
          </motion.button>

          {/* Mosque name overlay — bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-4 md:px-6">
            <h1
              className="text-white text-[28px] md:text-[24px] font-bold leading-tight"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {mosque.name}
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {mosque.zone_code ?? 'Malaysia'} · {formatCount(mosque.jemaah_count)} ahli
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="sticky top-0 z-20 shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex overflow-x-auto scrollbar-none px-4 md:px-6">
            {TABS.map(tab => (
              <motion.button
                key={tab}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab)}
                className="relative shrink-0 px-4 py-3.5 text-[13px] font-semibold"
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="mosque-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--primary)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <main className="flex-1 pb-28 md:pb-10">
          <div className="px-4 pt-4 md:px-6 md:pt-6 md:max-w-4xl md:mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
