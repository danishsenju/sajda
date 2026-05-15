'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { CheckSquare, Heart, Users, ChevronRight, Landmark } from 'lucide-react'
import { QuranIcon }       from '@/components/icons/quran-icon'
import { SolatStreakIcon } from '@/components/icons/solat-streak-icon'
import { TasbihIcon }      from '@/components/icons/tasbih-icon'
import { QiblaIcon }       from '@/components/icons/qibla-icon'
import { TazkirahIcon }    from '@/components/icons/tazkirah-icon'
import { PrayerBanner } from './PrayerBanner'
import { FeedCard } from './FeedCard'
import { EmptyState } from './EmptyState'
import { MosqueSwitcher } from './MosqueSwitcher'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
import { LogoTopBar } from '@/components/ui/LogoTopBar'
import type { FeedItem } from './FeedCard'
import type { FollowedMosque } from './MosqueSwitcher'
import type { TazkirahItem } from '@/app/actions/tazkirah'
import type { QuranBookmark } from '@/app/actions/quran'

/* ─── Animation ──────────────────────────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 35 } },
}

/* ─── Quick Actions (per pages-spec.md) ──────────────────────────────────── */

const QUICK_ACTIONS = [
  { href: '/ibadah/quran',     label: 'Al-Quran',      Icon: QuranIcon },
  { href: '/ibadah/solat',     label: 'Waktu Solat',   Icon: SolatStreakIcon },
  { href: '/ibadah/tasbih',    label: 'Tasbih',        Icon: TasbihIcon },
  { href: '/ibadah/qibla',     label: 'Kiblat',        Icon: QiblaIcon },
  { href: '/ibadah/checklist', label: 'Senarai Semak', Icon: CheckSquare },
  { href: '/ibadah/tazkirah',  label: 'Tazkirah',      Icon: TazkirahIcon },
  { href: '/doa',              label: 'Doa Bersama',   Icon: Heart },
  { href: '/komuniti',         label: 'Komuniti',      Icon: Users },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

const LS_KEY = 'sajda_active_mosque_id'

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  userProfile: { display_name: string | null; avatar_url: string | null }
  mosques: FollowedMosque[]
  feed: FeedItem[]
  tazkirah: TazkirahItem | null
  quranBookmark: QuranBookmark | null
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function QuickActionsGrid() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[20px] font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
        >
          Ibadah Hari Ini
        </h2>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(({ href, label, Icon }) => (
          <motion.a
            key={href}
            href={href}
            whileTap={{ scale: 0.94 }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-2"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              minHeight: '72px',
            }}
          >
            <div style={{ color: 'var(--primary)' }}><Icon size={22} /></div>
            <span
              className="text-[11px] font-semibold text-center leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {label}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

function TazkirahCard({ tazkirah }: { tazkirah: TazkirahItem }) {
  return (
    <motion.a
      href="/ibadah/tazkirah"
      whileTap={{ scale: 0.98 }}
      className="block rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface-raised)',
        borderTop: '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        borderLeft: '4px solid var(--gold)',
        boxShadow: 'var(--shadow-gold)',
      }}
    >
      <div className="p-5">
        {tazkirah.category && (
          <p
            className="text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--gold)' }}
          >
            {tazkirah.category}
          </p>
        )}
        <p
          className="text-[18px] font-semibold italic leading-snug mb-3"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
        >
          &ldquo;{tazkirah.title}&rdquo;
        </p>
        <p
          className="text-[13px] leading-relaxed line-clamp-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {tazkirah.content_malay}
        </p>
        {tazkirah.hadis_ref && (
          <p
            className="mt-3 text-[11px]"
            style={{ color: 'var(--text-disabled)' }}
          >
            — {tazkirah.hadis_ref}
          </p>
        )}
      </div>
    </motion.a>
  )
}

function QuranContinueCard({ quranBookmark }: { quranBookmark: QuranBookmark }) {
  return (
    <motion.a
      href={`/ibadah/quran?page=${quranBookmark.page_number}`}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 rounded-xl p-4"
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--primary-muted)' }}
      >
        <div style={{ color: 'var(--primary)' }}><QuranIcon size={18} /></div>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Sambung Membaca
        </p>
        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          Al-Quran · Halaman {quranBookmark.page_number}
        </p>
      </div>
      <ChevronRight size={16} strokeWidth={1.5} color="var(--text-disabled)" />
    </motion.a>
  )
}

/* ─── HomeShell ──────────────────────────────────────────────────────────── */

export function HomeShell({ userProfile, mosques, feed, tazkirah, quranBookmark }: Props) {
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem(LS_KEY)
    return saved && mosques.some((m) => m.id === saved) ? saved : null
  })

  function handleMosqueSelect(id: string | null) {
    setSelectedMosqueId(id)
    if (id === null) localStorage.removeItem(LS_KEY)
    else localStorage.setItem(LS_KEY, id)
  }

  const hasFollowed = mosques.length > 0
  const firstName = userProfile.display_name?.split(' ')[0] ?? null

  const [timeGreeting] = useState(() => {
    const h = new Date().getHours()
    if (h < 5)  return 'Selamat Malam'
    if (h < 12) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Tengah Hari'
    if (h < 19) return 'Selamat Petang'
    return 'Selamat Malam'
  })

  const [dateStr] = useState(() => {
    const now = new Date()
    const masihi = now.toLocaleDateString('ms-MY', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    let hijri = ''
    try {
      hijri = now.toLocaleDateString('ms-MY-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    } catch { /* browser may not support Islamic calendar */ }
    return hijri ? `${masihi} · ${hijri}H` : masihi
  })

  const visibleFeed = selectedMosqueId
    ? feed.filter((f) => f.kind === 'announcement' && f.mosqueId === selectedMosqueId)
    : feed.filter((f) => f.kind === 'announcement')

  const selectedMosque = mosques.find((m) => m.id === selectedMosqueId)

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--surface)' }}>
      <Sidebar />

      <div className="flex-1 min-w-0 md:ml-60">
        <LogoTopBar />
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="pt-14 pb-28 md:pt-0 md:pb-12"
        >
          <div className="md:max-w-5xl md:mx-auto md:px-8 md:pt-8">

            {/* ── Mobile greeting ────────────────────────────────────── */}
            <motion.div
              variants={item}
              className="md:hidden relative px-4 pt-6 pb-4 overflow-hidden"
            >
              {/* Ambient green radial glow */}
              <div
                className="absolute -top-6 -right-6 w-56 h-48 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 80% 20%, rgba(30,107,69,0.10) 0%, transparent 65%)',
                }}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">

                  {/* Time-of-day pill */}
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                    >
                      {timeGreeting}
                    </span>
                  </div>

                  {/* Assalamualaikum */}
                  <p
                    className="text-[17px] italic leading-snug"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-cormorant)' }}
                  >
                    Assalamualaikum,
                  </p>

                  {/* Name — the hero */}
                  <h1
                    className="text-[32px] font-bold leading-tight"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                  >
                    {firstName ?? 'Sahabat'}
                  </h1>

                  {/* Date row */}
                  <p
                    className="text-[11px] mt-1.5 tabular-nums"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    {dateStr}
                  </p>
                </div>

                {/* Avatar — larger, with green glow ring */}
                <Link href="/profil">
                  <motion.div
                    whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 380, damping: 28 } }}
                    className="relative mt-2 flex-shrink-0"
                  >
                    <div
                      className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                      style={{
                        background: 'var(--primary-muted)',
                        border: '2px solid var(--primary)',
                        boxShadow: '0 0 20px rgba(30,107,69,0.20)',
                      }}
                    >
                      {userProfile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.display_name ?? ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-[17px] font-bold"
                          style={{ color: 'var(--primary)' }}
                        >
                          {getInitials(userProfile.display_name)}
                        </span>
                      )}
                    </div>
                    {/* Online dot */}
                    <div
                      className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2"
                      style={{ background: 'var(--primary)', borderColor: 'var(--surface)' }}
                    />
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* ── Two-column desktop / single-column mobile ──────────── */}
            <div className="md:grid md:grid-cols-3 md:gap-6 md:items-start">

              {/* ═══ LEFT COLUMN (col-span-2) ═══════════════════════════ */}
              <div className="md:col-span-2 md:space-y-6">

                {/* Prayer Banner — the hero */}
                <motion.div variants={item} className="px-4 md:px-0">
                  <PrayerBanner />
                </motion.div>

                {/* Mosque Feed section */}
                <motion.div variants={item} className="mt-8 md:mt-0">
                  {!hasFollowed ? (
                    <>
                      {/* Mobile — full centred empty state */}
                      <div className="md:hidden">
                        <EmptyState />
                      </div>

                      {/* Desktop — compact, left-aligned inside col-span-2 */}
                      <div className="hidden md:flex items-center gap-5 px-0 py-8">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                        >
                          <svg width="28" height="28" viewBox="0 0 120 120" fill="none">
                            <path d="M12 96H108" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M60 14C60 14 33 38 33 58C33 73.46 45.54 86 61 86C76.46 86 88 73.46 88 58C88 38 60 14 60 14Z"
                              fill="var(--primary)" opacity="0.20"/>
                            <path d="M52 70V62C52 59.24 54.24 57 57 57H64C66.76 57 69 59.24 69 62V70" stroke="var(--primary)" strokeWidth="1.5" opacity="0.40"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-[18px] font-semibold mb-1"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                          >
                            Sambungkan Diri Anda
                          </h3>
                          <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Ikuti masjid berdekatan untuk menerima pengumuman dan aktiviti komuniti anda.
                          </p>
                          <Link
                            href="/masjid"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold"
                            style={{ background: 'var(--primary)', color: '#ffffff' }}
                          >
                            Cari Masjid Berdekatan
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Section header */}
                      <div className="flex items-center justify-between px-4 md:px-0 mb-4">
                        <div>
                          <h2
                            className="text-[20px] font-semibold"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                          >
                            {selectedMosque?.name ?? 'Daripada Masjid Anda'}
                          </h2>
                          {selectedMosque && (
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                              {visibleFeed.length} siaran
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {mosques.length > 1 && (
                            <MosqueSwitcher
                              mosques={mosques}
                              selectedId={selectedMosqueId}
                              onSelect={handleMosqueSelect}
                              variant="header"
                            />
                          )}
                          <Link
                            href="/masjid"
                            className="text-[13px] font-medium"
                            style={{ color: 'var(--primary)' }}
                          >
                            Lihat Semua
                          </Link>
                        </div>
                      </div>

                      {/* Feed content */}
                      <AnimatePresence mode="wait">
                        {visibleFeed.length === 0 ? (
                          <motion.div
                            key="empty-feed"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-10 px-6 text-center"
                          >
                            <Landmark
                              size={28} strokeWidth={1.2}
                              color="var(--text-disabled)"
                              className="mb-3"
                            />
                            <p
                              className="text-[16px] font-semibold"
                              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                            >
                              Belum ada pengumuman
                            </p>
                            <p className="mt-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                              Masjid anda belum ada kemas kini baru
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={selectedMosqueId ?? 'all'}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Mobile: horizontal scroll */}
                            <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 snap-x snap-mandatory md:hidden">
                              {visibleFeed.map((feedItem, i) => (
                                <div
                                  key={feedItem.id}
                                  className="snap-start shrink-0 w-[75vw] max-w-[280px]"
                                >
                                  <FeedCard item={feedItem} index={i} />
                                </div>
                              ))}
                              <div className="shrink-0 w-4" />
                            </div>

                            {/* Desktop: 2-col grid */}
                            <div className="hidden md:grid md:grid-cols-2 md:gap-4">
                              {visibleFeed.map((feedItem, i) => (
                                <FeedCard key={feedItem.id} item={feedItem} index={i} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {visibleFeed.length > 0 && (
                        <div className="flex items-center justify-center gap-3 py-8 px-4 md:px-0">
                          <div className="h-px flex-1 max-w-[40px]" style={{ background: 'var(--border-strong)' }} />
                          <span className="text-[12px]" style={{ color: 'var(--text-disabled)' }}>
                            Itu sahaja buat masa ini
                          </span>
                          <div className="h-px flex-1 max-w-[40px]" style={{ background: 'var(--border-strong)' }} />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>

              </div>{/* end left column */}

              {/* ═══ RIGHT COLUMN — desktop only ════════════════════════ */}
              <div className="hidden md:flex md:flex-col md:gap-4">
                <QuickActionsGrid />
                {quranBookmark && <QuranContinueCard quranBookmark={quranBookmark} />}
                {tazkirah && <TazkirahCard tazkirah={tazkirah} />}
              </div>

            </div>{/* end grid */}

            {/* ── Mobile-only sections (after feed) ─────────────────── */}

            {/* Quick Actions */}
            <motion.div variants={item} className="mt-8 px-4 md:hidden">
              <QuickActionsGrid />
            </motion.div>

            {/* Tazkirah — the ONE gold element on this screen */}
            {tazkirah && (
              <motion.div variants={item} className="mt-8 px-4 md:hidden">
                <TazkirahCard tazkirah={tazkirah} />
              </motion.div>
            )}

            {/* Quran Continue */}
            {quranBookmark && (
              <motion.div variants={item} className="mt-3 px-4 md:hidden">
                <QuranContinueCard quranBookmark={quranBookmark} />
              </motion.div>
            )}

          </div>
        </motion.div>

        <BottomNav />
      </div>
    </div>
  )
}
