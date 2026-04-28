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
import {
  Bell,
  Landmark,
  Compass,
  BookOpen,
  Zap,
  AlignLeft,
  Clock,
  ListChecks,
  MessageSquare,
  ChevronRight,
} from 'lucide-react'

/* ─── Quick actions ──────────────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  {
    href: '/ibadah/tasbih',
    label: 'Tasbih',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" strokeDasharray="3 2.5" />
        <circle cx="12" cy="4" r="1" fill="#2D6A4F" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/ibadah/qibla',
    label: 'Kiblat',
    icon: <Compass size={22} strokeWidth={1.5} color="#2D6A4F" />,
  },
  {
    href: '/ibadah/quran',
    label: 'Al-Quran',
    icon: <BookOpen size={22} strokeWidth={1.5} color="#2D6A4F" />,
  },
  {
    href: '/ibadah/solat',
    label: 'Streak',
    icon: <Zap size={22} strokeWidth={1.5} color="#2D6A4F" />,
  },
  {
    href: '/ibadah/hadis',
    label: 'Hadis',
    icon: <AlignLeft size={22} strokeWidth={1.5} color="#2D6A4F" />,
  },
  {
    href: '/ibadah/mathurat',
    label: 'Mathurat',
    icon: <Clock size={22} strokeWidth={1.5} color="#2D6A4F" />,
  },
  {
    href: '/ibadah/checklist',
    label: 'Checklist',
    icon: <ListChecks size={22} strokeWidth={1.5} color="#2D6A4F" />,
  },
  {
    href: '/ibadah/tazkirah',
    label: 'Tazkirah',
    icon: <MessageSquare size={22} strokeWidth={1.5} color="#2D6A4F" />,
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
const DEFAULT_ACCENT = '#2D6A4F'

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
    <div className="flex min-h-screen" style={{ background: '#F7F6F3' }}>

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
          style={{ background: '#FFFFFF', borderBottom: 'none' }}
        >
          <div className="flex items-center justify-between px-5 h-14">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Landmark size={16} strokeWidth={1.5} color="#2D6A4F" />
              <span
                className="text-[17px] font-semibold tracking-tight"
                style={{ color: '#1A1916' }}
              >
                SAJDA
              </span>
            </div>

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
              <Bell size={20} strokeWidth={1.5} color="#1A1916" />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: '#C0392B', border: '1.5px solid #FFFFFF' }}
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
              <p
                className="text-[12px] font-medium uppercase tracking-[0.05em] mb-3"
                style={{ color: '#A8A49E' }}
              >
                Akses Pantas
              </p>
              <div className="grid grid-cols-4 gap-2.5 md:gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-[14px] transition-colors active:scale-[0.97]"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8E5DF',
                      minHeight: '44px',
                    }}
                  >
                    {action.icon}
                    <span
                      className="text-[12px] font-medium text-center leading-tight"
                      style={{ color: '#6B6860' }}
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
                  background: '#FFFFFF',
                  border: '1px solid #E8E5DF',
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid #E8E5DF' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2D6A4F' }} />
                    <span
                      className="text-[12px] font-medium uppercase tracking-[0.05em]"
                      style={{ color: '#A8A49E' }}
                    >
                      Tazkirah Hari Ini
                    </span>
                  </div>
                  {tazkirah.category && (
                    <span
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: '#EAF4EE', color: '#2D6A4F' }}
                    >
                      {tazkirah.category}
                    </span>
                  )}
                </div>
                <div className="px-4 py-4">
                  <p
                    className="text-[16px] font-semibold mb-1.5 leading-snug"
                    style={{ color: '#1A1916' }}
                  >
                    {tazkirah.title}
                  </p>
                  <p
                    className="text-[14px] leading-relaxed line-clamp-2"
                    style={{ color: '#6B6860' }}
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
                style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#EAF4EE' }}
                >
                  <BookOpen size={16} strokeWidth={1.5} color="#2D6A4F" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: '#1A1916' }}>
                    Teruskan Membaca
                  </p>
                  <p className="text-[12px]" style={{ color: '#A8A49E' }}>
                    Al-Quran · Halaman {quranBookmark.page_number}
                  </p>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} color="#A8A49E" />
              </a>
            )}

            {/* ── Siaran Masjid / CTA ───────────────────────────────── */}
            {!hasFollowed ? (
              <div
                className="mx-5 mt-5 md:mx-0 rounded-2xl p-6 text-center"
                style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: '#EAF4EE' }}
                >
                  <Landmark size={22} strokeWidth={1.5} color="#2D6A4F" />
                </div>
                <p
                  className="text-[16px] font-semibold mb-2"
                  style={{ color: '#1A1916' }}
                >
                  Ikuti masjid anda
                </p>
                <p
                  className="text-[14px] mb-5 leading-relaxed"
                  style={{ color: '#6B6860' }}
                >
                  Dapatkan siaran, program dan jadual masjid terus di sini.
                </p>
                <a
                  href="/masjid"
                  className="flex items-center justify-center w-full h-12 rounded-xl text-[15px] font-semibold transition-all active:scale-95"
                  style={{ background: '#2D6A4F', color: '#FFFFFF' }}
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
                      style={{ color: '#A8A49E' }}
                    >
                      Siaran Masjid
                    </p>
                    <h2 className="text-[15px] font-semibold" style={{ color: '#1A1916' }}>
                      {selectedMosque?.name ?? 'Semua Masjid'}
                    </h2>
                  </div>
                  {visibleFeed.length > 0 && (
                    <span
                      className="text-[12px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: '#F0EEE9', color: '#6B6860' }}
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
                        style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
                      >
                        <MessageSquare size={20} strokeWidth={1.5} color="#A8A49E" />
                      </div>
                      <p className="text-[14px] font-medium" style={{ color: '#6B6860' }}>
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
                    <div className="h-px w-10" style={{ background: '#E8E5DF' }} />
                    <span className="text-[12px]" style={{ color: '#A8A49E' }}>
                      Itu sahaja buat masa ini
                    </span>
                    <div className="h-px w-10" style={{ background: '#E8E5DF' }} />
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
