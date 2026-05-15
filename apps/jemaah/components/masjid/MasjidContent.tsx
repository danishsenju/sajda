'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Landmark } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { Sidebar } from '@/components/ui/Sidebar'
import { BottomNav } from '@/components/ui/BottomNav'
import { LogoTopBar } from '@/components/ui/LogoTopBar'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Mosque = {
  id: string
  name: string
  slug: string
  zone_code?: string | null
  jemaah_count?: number
}

type Props = {
  mosques: Mosque[]
  followedIds: string[]
}

const TABS = ['Berdekatan', 'Diikuti', 'Semua'] as const
type Tab = (typeof TABS)[number]

/* ─── Animation variants ─────────────────────────────────────────────────── */

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 500, damping: 35 } },
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatCount(n?: number): string {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function MosqueCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4 animate-pulse"
      style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
    >
      <div className="w-10 h-10 rounded-full shrink-0" style={{ background: 'var(--surface-overlay)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded-full w-3/5" style={{ background: 'var(--surface-overlay)' }} />
        <div className="h-2.5 rounded-full w-2/5" style={{ background: 'var(--surface-overlay)' }} />
      </div>
      <div className="h-7 w-14 rounded-full" style={{ background: 'var(--surface-overlay)' }} />
    </div>
  )
}

/* ─── MasjidContent ──────────────────────────────────────────────────────── */

export function MasjidContent({ mosques, followedIds }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Semua')
  const [search, setSearch] = useState('')
  const [followed, setFollowed] = useState<Set<string>>(new Set(followedIds))
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Mosque | null>(null)

  /* ── Follow / unfollow ── */
  async function toggleFollow(e: React.MouseEvent, mosque: Mosque) {
    e.stopPropagation()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoadingId(mosque.id)
    if (followed.has(mosque.id)) {
      await (supabase as any)
        .from('jemaah_follows')
        .delete()
        .eq('user_id', user.id)
        .eq('masjid_id', mosque.id)
      setFollowed(prev => {
        const next = new Set(prev)
        next.delete(mosque.id)
        return next
      })
    } else {
      await (supabase as any)
        .from('jemaah_follows')
        .insert({ user_id: user.id, masjid_id: mosque.id })
      setFollowed(prev => new Set([...prev, mosque.id]))
    }
    setLoadingId(null)
  }

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let list = mosques
    if (activeTab === 'Diikuti') list = list.filter(m => followed.has(m.id))
    // Berdekatan: fallback to all until geolocation is implemented
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q))
    }
    return list
  }, [mosques, activeTab, search, followed])

  /* ── Empty state ── */
  const emptyMessage = activeTab === 'Diikuti'
    ? { title: 'Belum Ikuti Masjid', sub: 'Ikuti masjid untuk melihatnya di sini' }
    : { title: 'Tiada Hasil Carian', sub: 'Cuba cari dengan nama yang lain' }

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--surface)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <LogoTopBar />

        <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden pt-14 md:pt-0">

          {/* ══════════════════════════════════════════
              LEFT PANEL — search + tabs + list
          ══════════════════════════════════════════ */}
          <div
            className="md:w-[360px] md:shrink-0 md:flex md:flex-col md:overflow-hidden"
            style={{ borderRight: '1px solid var(--border)' }}
          >
            {/* Search + tabs */}
            <div className="px-4 pt-4 pb-3 space-y-3 md:px-5 md:pt-5 md:shrink-0">

              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
              >
                <Search size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari masjid..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-jakarta)' }}
                />
              </div>

              <div className="flex gap-2">
                {TABS.map(tab => (
                  <motion.button
                    key={tab}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2 rounded-full text-xs font-semibold transition-colors"
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      background: activeTab === tab ? 'var(--primary)' : 'transparent',
                      color: activeTab === tab ? '#ffffff' : 'var(--text-secondary)',
                      border: `1px solid ${activeTab === tab ? 'transparent' : 'var(--border)'}`,
                    }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mosque list */}
            <div className="px-4 pb-28 md:px-5 md:pb-6 md:overflow-y-auto md:flex-1">
              <AnimatePresence mode="wait">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-16 gap-3"
                  >
                    <Landmark size={32} strokeWidth={1.2} style={{ color: 'var(--text-disabled)' }} />
                    <p
                      className="text-[20px] font-semibold"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                    >
                      {emptyMessage.title}
                    </p>
                    <p className="text-[13px] text-center" style={{ color: 'var(--text-secondary)' }}>
                      {emptyMessage.sub}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeTab + search}
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {filtered.map(mosque => {
                      const isFollowed = followed.has(mosque.id)
                      const isSelected = selected?.id === mosque.id
                      const isLoading = loadingId === mosque.id

                      return (
                        <motion.div
                          key={mosque.id}
                          variants={cardVariants}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelected(mosque)}
                          className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer transition-colors"
                          style={{
                            background: 'var(--surface-raised)',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          }}
                        >
                          {/* Initial circle */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[15px] font-semibold"
                            style={{
                              background: 'var(--primary-muted)',
                              color: 'var(--primary)',
                              fontFamily: 'var(--font-cormorant)',
                            }}
                          >
                            {mosque.name.slice(0, 2).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[15px] font-semibold truncate"
                              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-jakarta)' }}
                            >
                              {mosque.name}
                            </p>
                            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                              {mosque.zone_code ?? 'Malaysia'}
                              {mosque.jemaah_count ? ` · ${formatCount(mosque.jemaah_count)} ahli` : ''}
                            </p>
                          </div>

                          {/* Follow pill */}
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={e => toggleFollow(e, mosque)}
                            disabled={isLoading}
                            className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors"
                            style={{
                              fontFamily: 'var(--font-jakarta)',
                              ...(isFollowed
                                ? {
                                    background: 'var(--primary-muted)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary-muted)',
                                  }
                                : {
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)',
                                  }),
                            }}
                          >
                            {isLoading ? '···' : isFollowed ? 'Diikuti ✓' : 'Ikut'}
                          </motion.button>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT PANEL — mosque detail (desktop only)
          ══════════════════════════════════════════ */}
          <div className="hidden md:flex flex-1 items-center justify-center p-8">
            {selected ? (
              <div className="w-full max-w-md">
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                >
                  {/* Mini banner */}
                  <div
                    className="h-28 flex items-end p-5"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0F3D26 100%)' }}
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {selected.zone_code ?? 'Malaysia'}
                      </p>
                      <h2
                        className="text-white text-[26px] font-bold leading-tight"
                        style={{ fontFamily: 'var(--font-cormorant)' }}
                      >
                        {selected.name}
                      </h2>
                    </div>
                  </div>

                  {/* Detail body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                        {formatCount(selected.jemaah_count)} ahli jemaah
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={e => toggleFollow(e, selected)}
                        disabled={loadingId === selected.id}
                        className="px-4 py-2 rounded-full text-[13px] font-semibold"
                        style={{
                          fontFamily: 'var(--font-jakarta)',
                          ...(followed.has(selected.id)
                            ? { background: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--primary-muted)' }
                            : { background: 'var(--primary)', color: '#ffffff' }),
                        }}
                      >
                        {loadingId === selected.id ? '···' : followed.has(selected.id) ? 'Diikuti ✓' : '+ Ikut'}
                      </motion.button>
                    </div>

                    <Link
                      href={`/masjid/${selected.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[14px] font-semibold transition-colors"
                      style={{
                        background: 'var(--surface-overlay)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-jakarta)',
                      }}
                    >
                      Lihat Profil Penuh →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                >
                  <Landmark size={28} strokeWidth={1.2} style={{ color: 'var(--text-disabled)' }} />
                </div>
                <p
                  className="text-[24px] font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                >
                  Pilih Masjid
                </p>
                <p className="text-[13px] max-w-[180px]" style={{ color: 'var(--text-secondary)' }}>
                  Pilih masjid dari senarai untuk melihat profil
                </p>
              </div>
            )}
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  )
}
