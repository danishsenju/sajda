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

/* ─── Quick actions ──────────────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  {
    href: '/ibadah/tasbih',
    label: 'Tasbih',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="var(--primary)" />
        <circle cx="12" cy="12" r="9" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="12" cy="3" r="1.5" fill="var(--accent)" />
      </svg>
    ),
  },
  {
    href: '/ibadah/qibla',
    label: 'Kiblat',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12L15 7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.5" fill="var(--primary)" />
      </svg>
    ),
  },
  {
    href: '/ibadah/quran',
    label: 'Al-Quran',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="var(--primary)" strokeWidth="1.8" />
        <path d="M9 7h6M9 11h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/ibadah/solat',
    label: 'Streak',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 2L4.09 12.11a1 1 0 00.77 1.63L11 14l-1 8 8.92-10.11a1 1 0 00-.77-1.63L13 10l1-8z"
          fill="rgba(249,116,75,0.15)" stroke="var(--accent)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/ibadah/hadis',
    label: 'Hadis',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/ibadah/mathurat',
    label: 'Mathurat',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="var(--primary)" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/ibadah/checklist',
    label: 'Checklist',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 11L12 14L22 4" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/ibadah/tazkirah',
    label: 'Tazkirah',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10h8M8 13h5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
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
const DEFAULT_ACCENT = '#f9744b'

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  mosques: FollowedMosque[]
  feed: FeedItem[]
}

/* ─── HomeShell ──────────────────────────────────────────────────────────── */

export function HomeShell({ mosques, feed }: Props) {
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

  // Home only shows announcements — doa has its own tab
  const announcements = feed.filter((item) => item.kind === 'announcement')
  const visibleFeed = selectedMosqueId
    ? announcements.filter((item) => item.mosqueId === selectedMosqueId)
    : announcements

  const hasFollowed = mosques.length > 0
  const selectedMosque = mosques.find((m) => m.id === selectedMosqueId)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface)' }}>

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
          style={{ background: 'var(--primary)' }}
        >
          <div className="flex items-center justify-between px-4 h-14">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 2 6 7 6 12.5C6 15.81 8.69 18.5 12 18.5C15.31 18.5 18 15.81 18 12.5C18 7 12 2 12 2Z"
                  fill="rgba(255,255,255,0.20)" stroke="rgba(255,255,255,0.60)" strokeWidth="1.2"
                />
                <path d="M4 23V20H20V23M1 20H23" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="5" r="1.2" fill="var(--accent)" />
              </svg>
              <span
                className="text-base font-bold"
                style={{ color: '#fff', fontFamily: 'var(--font-playfair)', letterSpacing: '0.12em' }}
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
              className="w-9 h-9 flex items-center justify-center rounded-full relative"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-label="Pemberitahuan"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke="rgba(255,255,255,0.70)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)', border: '1.5px solid var(--primary)' }}
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
            <div className="px-4 mt-5 md:px-0 md:mt-6">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-dim)' }}
              >
                Akses Pantas
              </p>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all active:scale-95 hover:scale-[1.02]"
                    style={{
                      background: 'var(--surface-2)',
                      boxShadow: '0 1px 8px rgba(16,41,55,0.06)',
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--surface-3)' }}
                    >
                      {action.icon}
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                      {action.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Siaran Masjid */}
            {!hasFollowed ? (
              /* No mosques followed yet */
              <div className="mx-4 mt-5 md:mx-0 rounded-2xl p-5 text-center" style={{ background: 'var(--surface-2)', boxShadow: '0 1px 8px rgba(16,41,55,0.06)' }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--surface-3)' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z" fill="none" stroke="var(--text-dim)" strokeWidth="1.8" />
                    <path d="M5 22V18H19V22M2 18H22M8 18V16M16 18V16" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
                  Ikuti masjid anda
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
                  Dapatkan siaran, program dan jadual masjid terus di sini.
                </p>
                <a
                  href="/masjid"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Cari Masjid
                </a>
              </div>
            ) : (
              <>
                {/* Section header */}
                <div className="flex items-center justify-between px-4 mt-6 mb-3 md:px-0">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-dim)' }}>
                      Siaran Masjid
                    </p>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {selectedMosque?.name ?? 'Semua Masjid'}
                    </h2>
                  </div>
                  {visibleFeed.length > 0 && (
                    <span
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-dim)', boxShadow: '0 1px 4px rgba(16,41,55,0.06)' }}
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
                        style={{ background: 'var(--surface-2)', boxShadow: '0 2px 8px rgba(16,41,55,0.06)' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        Tiada siaran dari masjid ini lagi.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedMosqueId ?? 'all'}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col gap-3 px-4 md:px-0 md:grid md:grid-cols-2 md:items-start md:gap-4"
                    >
                      {visibleFeed.map((item, i) => (
                        <FeedCard key={item.id} item={item} index={i} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {visibleFeed.length > 0 && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <div className="h-px w-12" style={{ background: 'var(--border-strong)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Itu sahaja buat masa ini</span>
                    <div className="h-px w-12" style={{ background: 'var(--border-strong)' }} />
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
