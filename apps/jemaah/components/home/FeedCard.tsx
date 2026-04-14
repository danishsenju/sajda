'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { toggleAamiin } from '@/app/actions/doa'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type FeedItem =
  | {
      kind: 'announcement'
      id: string
      mosqueId: string
      mosqueName: string
      mosqueColor: string
      title: string
      body: string
      isPinned: boolean
      publishedAt: string
    }
  | {
      kind: 'doa'
      id: string
      mosqueId: string | null
      mosqueName: string | null
      mosqueColor: string
      doaText: string
      isAnonymous: boolean
      aaminCount: number
      userHasAamined: boolean
      publishedAt: string
    }

/* ─── Announcement Card ─────────────────────────────────────────────────── */

function AnnouncementCard({ item }: { item: Extract<FeedItem, { kind: 'announcement' }> }) {
  const timeAgo = formatTimeAgo(item.publishedAt)

  return (
    <div
      className="rounded-2xl overflow-hidden card-shadow"
      style={{ background: 'var(--surface-2)' }}
    >
      {/* Mosque color top strip */}
      <div className="h-[3px]" style={{ background: item.mosqueColor || 'var(--primary)' }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Mosque color dot */}
          <span
            className="w-5 h-5 rounded-full flex-shrink-0"
            style={{ background: item.mosqueColor || 'var(--primary)' }}
          />
          <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--text-muted)' }}>
            {item.mosqueName}
          </span>

          {item.isPinned && (
            <span
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: 'rgba(249,116,75,0.10)', color: 'var(--accent)' }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
              </svg>
              Dikemukakan
            </span>
          )}

          <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-dim)' }}>
            {timeAgo}
          </span>
        </div>

        {/* Content */}
        <h3
          className="text-[15px] font-semibold mb-2 leading-snug"
          style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}
        >
          {item.title}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
          {item.body}
        </p>

        {/* Footer tag */}
        <div className="mt-3 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M3 5h18M3 10h18M3 15h12" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>Pengumuman</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Doa Card ──────────────────────────────────────────────────────────── */

function DoaCard({ item }: { item: Extract<FeedItem, { kind: 'doa' }> }) {
  const [aaminCount, setAaminCount] = useState(item.aaminCount)
  const [hasAamined, setHasAamined] = useState(item.userHasAamined)
  const [isPending, startTransition] = useTransition()
  const timeAgo = formatTimeAgo(item.publishedAt)

  function handleAamiin() {
    if (isPending) return
    const optimistic = !hasAamined
    setHasAamined(optimistic)
    setAaminCount((c) => c + (optimistic ? 1 : -1))

    startTransition(async () => {
      const result = await toggleAamiin(item.id)
      if ('error' in result) {
        setHasAamined(!optimistic)
        setAaminCount((c) => c + (optimistic ? -1 : 1))
      }
    })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden card-shadow"
      style={{ background: 'var(--surface-2)' }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: item.isAnonymous ? 'var(--surface-3)' : (item.mosqueColor || 'var(--primary)') }}
          >
            {item.isAnonymous ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="var(--text-dim)"/>
                <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <span className="text-[10px] font-bold" style={{ color: '#fff' }}>
                {item.mosqueName?.slice(0, 2).toUpperCase() ?? 'DO'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text)' }}>
              {item.isAnonymous ? 'Hamba Allah' : (item.mosqueName ?? 'Komuniti')}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{timeAgo}</p>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{ background: 'rgba(16,41,55,0.06)', color: 'var(--text-muted)' }}
          >
            Doa
          </span>
        </div>

        {/* Doa quote block */}
        <div
          className="px-4 py-3 rounded-xl mb-3"
          style={{
            background: 'var(--surface-3)',
            borderLeft: '3px solid var(--primary-soft)',
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              color: 'var(--text)',
              fontFamily: 'var(--font-playfair)',
              fontStyle: 'italic',
            }}
          >
            &ldquo;{item.doaText}&rdquo;
          </p>
        </div>

        {/* Aamiin button */}
        <motion.button
          onClick={handleAamiin}
          disabled={isPending}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          style={{
            background: hasAamined ? 'var(--accent)' : 'var(--surface-3)',
            color: hasAamined ? '#ffffff' : 'var(--text-muted)',
            boxShadow: hasAamined ? '0 4px 12px rgba(249,116,75,0.30)' : 'none',
          }}
          aria-label="Aamiin"
          aria-pressed={hasAamined}
        >
          {/* Raised hands */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 11V6a1 1 0 012 0v5M9 11V9a1 1 0 012 0v2M11 11V8a1 1 0 012 0v3M13 11V9a1 1 0 012 0v6c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3a1 1 0 012 0"
              stroke={hasAamined ? '#ffffff' : 'var(--text-muted)'}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Aamiin
          {aaminCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                background: hasAamined ? 'rgba(255,255,255,0.25)' : 'rgba(16,41,55,0.08)',
                color: hasAamined ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              {aaminCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Main export ───────────────────────────────────────────────────────── */

export function FeedCard({ item, index }: { item: FeedItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.055, ease: 'easeOut' }}
    >
      {item.kind === 'announcement' ? (
        <AnnouncementCard item={item} />
      ) : (
        <DoaCard item={item} />
      )}
    </motion.div>
  )
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'baru sahaja'
  if (minutes < 60) return `${minutes} min lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
}
