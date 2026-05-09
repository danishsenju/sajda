'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MosqueSwitcher } from './MosqueSwitcher'
import { PrayerBanner } from './PrayerBanner'
import { FeedCard } from './FeedCard'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
import type { FollowedMosque } from './MosqueSwitcher'
import type { FeedItem } from './FeedCard'
import type { TazkirahItem } from '@/app/actions/tazkirah'
import type { QuranBookmark } from '@/app/actions/quran'
import { SajdaLogo } from '@/components/icons/sajda-logo'
import {
  Bell,
  Landmark,
  Clock,
  ListChecks,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { TasbihIcon } from '@/components/icons/tasbih-icon'
import { QiblaIcon } from '@/components/icons/qibla-icon'
import { QuranIcon } from '@/components/icons/quran-icon'
import { SolatStreakIcon } from '@/components/icons/solat-streak-icon'
import { HadisIcon } from '@/components/icons/hadis-icon'
import { TazkirahIcon } from '@/components/icons/tazkirah-icon'

/* ─── Quick actions ──────────────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  {
    href: '/ibadah/tasbih',
    label: 'Tasbih',
    icon: <TasbihIcon size={22} className="text-[var(--accent-2)]" />,
  },
  {
    href: '/ibadah/qibla',
    label: 'Qiblat',
    icon: <QiblaIcon size={22} className="text-[var(--accent-2)]" />,
  },
  {
    href: '/ibadah/quran',
    label: 'Al-Quran',
    icon: <QuranIcon size={22} className="text-[var(--accent-2)]" />,
  },
  {
    href: '/ibadah/solat',
    label: 'Streak',
    icon: <SolatStreakIcon size={22} className="text-[var(--accent-2)]" />,
  },
  {
    href: '/ibadah/hadis',
    label: 'Hadis',
    icon: <HadisIcon size={22} className="text-[var(--accent-2)]" />,
  },
  {
    href: '/ibadah/mathurat',
    label: 'Mathurat',
    icon: <Clock size={22} strokeWidth={1.5} color="var(--accent-2)" />,
  },
  {
    href: '/ibadah/checklist',
    label: 'Senarai',
    icon: <ListChecks size={22} strokeWidth={1.5} color="var(--accent-2)" />,
  },
  {
    href: '/ibadah/tazkirah',
    label: 'Tazkirah',
    icon: <TazkirahIcon size={22} className="text-[var(--accent-2)]" />,
  },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex
  if (clean.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const LS_KEY = 'sajda_active_mosque_id'
const DEFAULT_ACCENT = '#1E3828'

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  mosques: FollowedMosque[]
  feed: FeedItem[]
  tazkirah?: TazkirahItem | null
  quranBookmark?: QuranBookmark | null
}

/* ─── HomeShell ──────────────────────────────────────────────────────────── */

export function HomeShell({ mosques, feed, tazkirah, quranBookmark }: Props) {
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved && mosques.some((m) => m.id === saved)) {
      setSelectedMosqueId(saved)
      const mosque = mosques.find((m) => m.id === saved)
      if (mosque?.theme.primary) applyTheme(mosque.theme.primary)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyTheme(color: string) {
    const root = document.documentElement
    root.style.setProperty('--accent', color)
    root.style.setProperty('--accent-soft', hexToRgba(color, 0.12))
    root.style.setProperty('--border-accent', hexToRgba(color, 0.25))
  }

  function resetTheme() {
    const root = document.documentElement
    root.style.setProperty('--accent', DEFAULT_ACCENT)
    root.style.setProperty('--accent-soft', hexToRgba(DEFAULT_ACCENT, 0.12))
    root.style.setProperty('--border-accent', hexToRgba(DEFAULT_ACCENT, 0.25))
  }

  function handleMosqueSelect(id: string | null) {
    setSelectedMosqueId(id)
    if (id === null) {
      localStorage.removeItem(LS_KEY)
      resetTheme()
    } else {
      localStorage.setItem(LS_KEY, id)
      const mosque = mosques.find((m) => m.id === id)
      if (mosque?.theme.primary) applyTheme(mosque.theme.primary)
    }
  }

  const announcements = feed.filter((item) => item.kind === 'announcement')
  const visibleFeed = selectedMosqueId
    ? announcements.filter((item) => item.mosqueId === selectedMosqueId)
    : announcements

  const hasFollowed = mosques.length > 0
  const selectedMosque = mosques.find((m) => m.id === selectedMosqueId)

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--surface)' }}>

      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <Sidebar
        mosques={mosques}
        selectedId={selectedMosqueId}
        onMosqueSelect={handleMosqueSelect}
      />

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-[240px]">

        {/* ── Mobile header ─────────────────────────────────────────── */}
        <header
          className="md:hidden sticky top-0 z-30 safe-top"
          style={{ background: 'var(--surface-2)', borderBottom: 'none' }}
        >
          <div className="flex items-center justify-between px-5 h-14">

            {/* Logo */}
            <SajdaLogo width={80} height={34} className="text-[var(--text)]" />

            {/* Mosque switcher pill */}
            {hasFollowed && (
              <MosqueSwitcher
                mosques={mosques}
                selectedId={selectedMosqueId}
                onSelect={handleMosqueSelect}
                variant="header"
              />
            )}

            {/* Notification bell */}
            <button
              className="w-11 h-11 flex items-center justify-center rounded-full relative"
              aria-label="Pemberitahuan"
            >
              <Bell size={20} strokeWidth={1.5} color="var(--text)" />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: 'var(--error)', border: '1.5px solid var(--surface-2)' }}
              />
            </button>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────────── */}
        <main className="flex-1 pb-24 md:pb-10">
          <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-6">

            {/* Prayer times — always visible */}
            <PrayerBanner />

            {/* Akses Pantas */}
            <div className="px-5 mt-6 md:px-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #C9A84C, rgba(201,168,76,0.3))' }} />
                  <p
                    className="text-[12px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Akses Pantas
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
                  style={{
                    color: 'rgba(201,168,76,0.8)',
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.15)',
                  }}
                >
                  8 Alat
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className="relative flex flex-col items-center gap-2.5 py-4 px-2 rounded-[18px] transition-all duration-200 active:scale-[0.94] overflow-hidden"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* Gold shimmer top line */}
                    <div
                      className="absolute inset-x-0 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(201,168,76,0.55) 50%, transparent 95%)' }}
                    />

                    {/* Icon glow container */}
                    <div
                      className="w-11 h-11 rounded-[13px] flex items-center justify-center"
                      style={{
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {action.icon}
                    </div>

                    <span
                      className="text-[11px] font-semibold text-center leading-tight tracking-[0.02em]"
                      style={{ color: 'var(--text)' }}
                    >
                      {action.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Tazkirah Harian card ─────────────────────────────── */}
            {tazkirah && (
              <a
                href="/ibadah/tazkirah"
                className="block mx-5 mt-5 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform md:mx-0"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-strong)',
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
                    <span
                      className="text-[12px] font-medium uppercase tracking-[0.05em]"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      Tazkirah Hari Ini
                    </span>
                  </div>
                  {tazkirah.category && (
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
                    >
                      {tazkirah.category}
                    </span>
                  )}
                </div>
                <div className="px-4 py-4">
                  <p
                    className="text-[16px] font-semibold mb-1.5 leading-snug"
                    style={{ color: 'var(--text)' }}
                  >
                    {tazkirah.title}
                  </p>
                  <p
                    className="text-[14px] leading-relaxed line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {tazkirah.content_malay}
                  </p>
                </div>
              </a>
            )}

            {/* ── Teruskan Membaca ─────────────────────────────────── */}
            {quranBookmark && (
              <a
                href={`/ibadah/quran?page=${quranBookmark.page_number}`}
                className="mx-5 mt-3 flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform md:mx-0"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-3)' }}
                >
                  <QuranIcon size={16} className="text-[var(--accent-2)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                    Teruskan Membaca
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                    Al-Quran · Halaman {quranBookmark.page_number}
                  </p>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} color="var(--text-dim)" />
              </a>
            )}

            {/* ── Siaran Masjid / CTA ───────────────────────────────── */}
            {!hasFollowed ? (
              <div
                className="mx-5 mt-5 md:mx-0 rounded-2xl p-6 text-center"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--surface-3)' }}
                >
                  <Landmark size={22} strokeWidth={1.5} color="var(--accent-2)" />
                </div>
                <p
                  className="text-[16px] font-semibold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  Ikuti masjid anda
                </p>
                <p
                  className="text-[14px] mb-5 leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Dapatkan siaran, program dan jadual masjid terus di sini.
                </p>
                <a
                  href="/masjid"
                  className="flex items-center justify-center w-full h-12 rounded-xl text-[15px] font-semibold transition-all active:scale-95"
                  style={{ background: 'var(--primary)', color: 'var(--surface)' }}
                >
                  Cari Masjid
                </a>
              </div>
            ) : (
              <>
                {/* Section header */}
                <div className="flex items-center justify-between px-5 mt-6 mb-3 md:px-0">
                  <div>
                    <p
                      className="text-[12px] font-medium uppercase tracking-[0.05em] mb-0.5"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      Siaran Masjid
                    </p>
                    <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>
                      {selectedMosque?.name ?? 'Semua Masjid'}
                    </h2>
                  </div>
                  {visibleFeed.length > 0 && (
                    <span
                      className="text-[12px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-dim)' }}
                    >
                      {visibleFeed.length} siaran
                    </span>
                  )}
                </div>

                {/* Feed */}
                <AnimatePresence mode="wait">
                  {visibleFeed.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 px-8 text-center"
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)' }}
                      >
                        <MessageSquare size={20} strokeWidth={1.5} color="var(--text-dim)" />
                      </div>
                      <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        Tiada siaran dari masjid ini lagi.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedMosqueId ?? 'all'}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col gap-3 px-5 md:px-0 md:grid md:grid-cols-2 md:items-start md:gap-4"
                    >
                      {visibleFeed.map((item, i) => (
                        <FeedCard key={item.id} item={item} index={i} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {visibleFeed.length > 0 && (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="h-px w-10" style={{ background: 'var(--border-strong)' }} />
                    <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                      Itu sahaja buat masa ini
                    </span>
                    <div className="h-px w-10" style={{ background: 'var(--border-strong)' }} />
                  </div>
                )}
              </>
            )}

          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
