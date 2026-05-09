'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleAamiin, postDoa } from '@/app/actions/doa'
import { getComments, postComment, deleteComment } from '@/app/actions/doa-comments'
import type { DoaComment } from '@/app/actions/doa-comments'
import { containsProfanity, PROFANITY_ERROR_MSG } from '@/lib/utils/profanity'
import type { FollowedMosque } from '@/components/home/MosqueSwitcher'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type DoaWishItem = {
  id: string
  doaText: string
  isAnonymous: boolean
  authorName: string | null
  mosqueId: string | null
  mosqueName: string | null
  mosqueColor: string
  aaminCount: number
  userHasAamined: boolean
  commentCount: number
  createdAt: string
  category: string
}

type Props = {
  mosques: FollowedMosque[]
  wishes: DoaWishItem[]
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const MAX_CHARS = 300

const DOA_CATEGORIES = [
  { value: 'kesihatan', label: 'Kesihatan', icon: '🤲' },
  { value: 'keluarga', label: 'Keluarga', icon: '👨‍👩‍👧' },
  { value: 'pekerjaan', label: 'Pekerjaan', icon: '💼' },
  { value: 'pelajaran', label: 'Pelajaran', icon: '📖' },
  { value: 'kekuatan_iman', label: 'Kekuatan Iman', icon: '☪️' },
  { value: 'jodoh', label: 'Jodoh', icon: '💚' },
  { value: 'keselamatan', label: 'Keselamatan', icon: '🛡️' },
  { value: 'ummah', label: 'Ummah', icon: '🕌' },
  { value: 'umum', label: 'Umum', icon: '🤍' },
] as const

type DoaCategory = typeof DOA_CATEGORIES[number]['value']

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  kesihatan:     { bg: 'rgba(82,196,138,0.12)',  text: '#52C48A', border: 'rgba(82,196,138,0.22)' },
  keluarga:      { bg: 'rgba(201,168,76,0.12)',  text: '#C9A84C', border: 'rgba(201,168,76,0.22)' },
  pekerjaan:     { bg: 'rgba(107,143,212,0.12)', text: '#6B8FD4', border: 'rgba(107,143,212,0.22)' },
  pelajaran:     { bg: 'rgba(166,124,197,0.12)', text: '#A67CC5', border: 'rgba(166,124,197,0.22)' },
  kekuatan_iman: { bg: 'rgba(201,168,76,0.15)',  text: '#C9A84C', border: 'rgba(201,168,76,0.25)' },
  jodoh:         { bg: 'rgba(82,196,138,0.12)',  text: '#52C48A', border: 'rgba(82,196,138,0.22)' },
  keselamatan:   { bg: 'rgba(224,92,75,0.12)',   text: '#E05C4B', border: 'rgba(224,92,75,0.22)' },
  ummah:         { bg: 'rgba(107,143,212,0.12)', text: '#6B8FD4', border: 'rgba(107,143,212,0.22)' },
  umum:          { bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.12)' },
}

const ARABIC_WATERMARKS = ['بِسْمِ اللَّهِ', 'اللَّهُمَّ', 'آمِين', 'يَا رَبِّ']

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'baru sahaja'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}j`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'semalam'
  if (days < 7) return `${days}h`
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

/* ─── AuroraBackground ───────────────────────────────────────────────────── */

function AuroraBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="aurora-orb-1 absolute rounded-full"
        style={{ width: 520, height: 520, top: -140, right: -80, background: 'radial-gradient(circle, rgba(166,124,197,0.22) 0%, transparent 65%)', filter: 'blur(52px)' }}
      />
      <div
        className="aurora-orb-2 absolute rounded-full"
        style={{ width: 420, height: 420, bottom: 60, left: -100, background: 'radial-gradient(circle, rgba(201,168,76,0.16) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />
      <div
        className="aurora-orb-3 absolute rounded-full"
        style={{ width: 320, height: 320, top: '38%', left: '32%', background: 'radial-gradient(circle, rgba(107,143,212,0.13) 0%, transparent 65%)', filter: 'blur(44px)' }}
      />
      <div
        className="aurora-orb-4 absolute rounded-full"
        style={{ width: 280, height: 280, bottom: 180, right: '8%', background: 'radial-gradient(circle, rgba(82,196,138,0.10) 0%, transparent 65%)', filter: 'blur(48px)' }}
      />
    </div>
  )
}

/* ─── ParticleBurst ──────────────────────────────────────────────────────── */

const PARTICLE_COLORS = ['#C9A84C', '#A67CC5', '#6B8FD4', '#52C48A']

function ParticleBurst({ active }: { active: boolean }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180
    return {
      dx: Math.cos(angle) * 30,
      dy: Math.sin(angle) * 30,
      color: PARTICLE_COLORS[i % 4]!,
    }
  })

  return (
    <div className="particle-burst" aria-hidden="true">
      <AnimatePresence>
        {active && particles.map(({ dx, dy, color }, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: dx, y: dy, scale: 0, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.55, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: color,
              marginTop: -2.5,
              marginLeft: -2.5,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─── IslamicPattern SVG ─────────────────────────────────────────────────── */

function IslamicPattern({ id = 'geo-doa' }: { id?: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={id} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Outer 8-point star: two overlapping squares */}
          <rect x="20" y="20" width="40" height="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" transform="rotate(0 40 40)" />
          <rect x="20" y="20" width="40" height="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" transform="rotate(45 40 40)" />
          {/* Inner concentric ring */}
          <circle cx="40" cy="40" r="20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx="40" cy="40" r="10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.4" />
          {/* Corner dots */}
          <circle cx="0"  cy="0"  r="1.2" fill="rgba(255,255,255,0.07)" />
          <circle cx="80" cy="0"  r="1.2" fill="rgba(255,255,255,0.07)" />
          <circle cx="0"  cy="80" r="1.2" fill="rgba(255,255,255,0.07)" />
          <circle cx="80" cy="80" r="1.2" fill="rgba(255,255,255,0.07)" />
          {/* Edge midpoints */}
          <circle cx="40" cy="0"  r="0.8" fill="rgba(255,255,255,0.05)" />
          <circle cx="40" cy="80" r="0.8" fill="rgba(255,255,255,0.05)" />
          <circle cx="0"  cy="40" r="0.8" fill="rgba(255,255,255,0.05)" />
          <circle cx="80" cy="40" r="0.8" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/* ─── CommentItem ────────────────────────────────────────────────────────── */

function CommentItem({ comment, onDelete }: { comment: DoaComment; onDelete: (id: string) => void }) {
  const [deleting, startDelete] = useTransition()
  const displayName = comment.isAnonymous ? 'Hamba Allah' : (comment.authorName ?? 'Jemaah')
  const initials = displayName === 'Hamba Allah' ? '☽' : getInitials(displayName)

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteComment(comment.id)
      if (!('error' in result)) onDelete(comment.id)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 group"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '0.5px solid rgba(255,255,255,0.14)',
          color: 'var(--text-dim)',
          fontSize: comment.isAnonymous ? 12 : 10,
          fontWeight: 700,
        }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="inline-block px-3 py-2 max-w-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.10)',
            borderRadius: '18px 18px 18px 4px',
          }}
        >
          <span className="text-[12px] font-semibold mr-1.5" style={{ color: 'var(--text)', fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.1px' }}>
            {displayName}
          </span>
          <span className="text-[12px] leading-snug break-words" style={{ color: 'var(--text-muted)' }}>
            {comment.commentText}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 pl-1">
          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{formatTimeAgo(comment.createdAt)}</span>
          {comment.isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--error)' }}
            >
              {deleting ? 'Memadamkan...' : 'Padam'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── CommentsSection ────────────────────────────────────────────────────── */

const PREVIEW_COUNT = 3
const MAX_COMMENT_CHARS = 200

function CommentsSection({ doaWishId, onCountChange }: { doaWishId: string; onCountChange: (delta: number) => void }) {
  const [comments, setComments] = useState<DoaComment[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [isAnonymous] = useState(false)
  const [submitting, startSubmit] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getComments(doaWishId).then((result) => {
      if (!('error' in result)) setComments(result)
      setLoading(false)
    })
  }, [doaWishId])

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleTextChange(value: string) {
    setCommentText(value.slice(0, MAX_COMMENT_CHARS))
    if (inputError) setInputError(null)
  }

  function handleSubmit() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    if (containsProfanity(trimmed)) { setInputError(PROFANITY_ERROR_MSG); return }
    startSubmit(async () => {
      const result = await postComment({ doaWishId, commentText: trimmed, isAnonymous })
      if ('error' in result) { setInputError(result.error); return }
      const newComment: DoaComment = {
        id: result.id, doaWishId, authorName: result.authorName, isAnonymous,
        commentText: trimmed, createdAt: result.createdAt, isOwn: true,
      }
      setComments((prev) => [...(prev ?? []), newComment])
      setCommentText('')
      setShowAll(true)
      onCountChange(1)
    })
  }

  function handleDelete(id: string) {
    setComments((prev) => (prev ?? []).filter((c) => c.id !== id))
    onCountChange(-1)
  }

  const visibleComments = showAll ? (comments ?? []) : (comments ?? []).slice(-PREVIEW_COUNT)
  const hiddenCount = (comments?.length ?? 0) - PREVIEW_COUNT

  return (
    <div className="pt-3 px-4 pb-4" style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
      {loading ? (
        <div className="flex gap-2 py-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-3 rounded-full shimmer-bg" style={{ width: i === 1 ? 80 : 120 }} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {!showAll && hiddenCount > 0 && (
            <button key="load-more" onClick={() => setShowAll(true)} className="text-[11px] font-semibold mb-3 block" style={{ color: 'var(--accent-2)' }}>
              Lihat {hiddenCount} lagi komen
            </button>
          )}
          <div className="flex flex-col gap-3 mb-3">
            {visibleComments.map((c) => (
              <CommentItem key={c.id} comment={c} onDelete={handleDelete} />
            ))}
          </div>
        </AnimatePresence>
      )}

      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: 'var(--text-dim)', border: '0.5px solid rgba(255,255,255,0.14)' }}
        >
          &bull;
        </div>
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.10)' }}
        >
          <input
            ref={inputRef}
            value={commentText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) { e.preventDefault(); handleSubmit() } }}
            placeholder="Tulis komen..."
            className="flex-1 bg-transparent outline-none text-[13px] min-w-0"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-jakarta)' }}
          />
          <AnimatePresence>
            {commentText.trim().length > 0 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--primary)' }}
                aria-label="Hantar komen"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {inputError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] mt-1.5 pl-9" style={{ color: 'var(--error)' }}>
            {inputError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── DoaWishCard ────────────────────────────────────────────────────────── */

function DoaWishCard({ wish, index, onAaminUpdate }: { wish: DoaWishItem; index: number; onAaminUpdate: (id: string, delta: number, newState: boolean) => void }) {
  const [hasAamined, setHasAamined] = useState(wish.userHasAamined)
  const [aaminCount, setAaminCount] = useState(wish.aaminCount)
  const [burst, setBurst] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showComments, setShowComments] = useState(false)
  const [localCommentCount, setLocalCommentCount] = useState(wish.commentCount)

  const displayName = wish.isAnonymous ? 'Hamba Allah' : (wish.authorName ?? 'Jemaah')
  const initials = displayName === 'Hamba Allah' ? '☽' : getInitials(displayName)
  const isLong = wish.doaText.length > 180
  const cat = DOA_CATEGORIES.find((c) => c.value === wish.category)
  const catColors = CATEGORY_COLORS[wish.category]
  const arabicWatermark = ARABIC_WATERMARKS[parseInt(wish.id.slice(-1), 16) % ARABIC_WATERMARKS.length]

  function handleAamiin() {
    if (isPending) return
    const nextState = !hasAamined
    const delta = nextState ? 1 : -1
    setHasAamined(nextState)
    setAaminCount((c) => c + delta)
    onAaminUpdate(wish.id, delta, nextState)
    if (nextState) { setBurst(true); setTimeout(() => setBurst(false), 600) }
    startTransition(async () => {
      const result = await toggleAamiin(wish.id)
      if ('error' in result) {
        setHasAamined(!nextState)
        setAaminCount((c) => c - delta)
        onAaminUpdate(wish.id, -delta, !nextState)
      }
    })
  }

  const ambientColor = catColors?.text ?? 'rgba(166,124,197,0.6)'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: Math.min(index * 0.04, 0.25) }}
      className="glass-surface rounded-3xl overflow-hidden relative"
      style={{
        boxShadow: `0 4px 16px rgba(0,0,0,0.28), 0 16px 48px rgba(0,0,0,0.22), 0 0 56px -16px ${ambientColor}44, 0 0 0 0.5px rgba(255,255,255,0.10)`,
      }}
    >
      {/* Arabic watermark */}
      <div
        className="absolute top-3 right-3 select-none pointer-events-none leading-none"
        style={{ fontFamily: 'var(--font-amiri)', fontSize: '64px', color: 'rgba(166,124,197,0.065)', lineHeight: 1, direction: 'rtl', filter: 'blur(0.3px)' }}
      >
        {arabicWatermark}
      </div>

      <IslamicPattern id={`geo-card-${wish.id.slice(0, 6)}`} />

      {/* Category badge + timestamp */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0 relative z-10">
        {cat && catColors ? (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: catColors.bg, color: catColors.text, border: `1px solid ${catColors.border}`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            <span style={{ fontSize: 11 }}>{cat.icon}</span> {cat.label}
          </span>
        ) : <span />}
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jakarta)' }}>
          {formatTimeAgo(wish.createdAt)}
        </span>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-0 relative z-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
          style={
            wish.isAnonymous
              ? { background: 'rgba(107,143,212,0.15)', color: 'var(--accent-2)', fontSize: 18, border: '1.5px solid rgba(107,143,212,0.25)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }
              : { background: `linear-gradient(135deg, ${wish.mosqueColor} 0%, ${wish.mosqueColor}99 100%)`, color: '#fff', fontSize: 12, boxShadow: `0 0 0 2px rgba(0,0,0,0.5), 0 0 0 3.5px ${wish.mosqueColor}40, inset 0 0 0 1px rgba(255,255,255,0.18)` }
          }
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--text)', fontFamily: 'var(--font-jakarta)' }}>
            {displayName}
          </p>
          {wish.mosqueName && (
            <span className="inline-flex items-center gap-1 text-[10px] mt-0.5" style={{ color: wish.mosqueColor, opacity: 0.85 }}>
              <svg width="6" height="6" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4" /></svg>
              {wish.mosqueName.split(' ').slice(0, 2).join(' ')}
            </span>
          )}
        </div>
      </div>

      {/* Doa text */}
      <div className="px-4 pt-3 pb-0 relative z-10">
        <button onClick={() => isLong && setExpanded((v) => !v)} className="w-full text-left relative" aria-expanded={expanded}>
          <span
            className="absolute top-0 left-0 leading-none select-none pointer-events-none"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: 56, color: 'rgba(166,124,197,0.12)', lineHeight: 1 }}
          >
            &ldquo;
          </span>
          <p
            className={`text-[15px] leading-[1.75] pl-3 pt-1 relative z-10 ${!expanded && isLong ? 'line-clamp-3' : ''}`}
            style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-jakarta)' }}
          >
            {wish.doaText}
          </p>
          {isLong && (
            <p className="text-[11px] font-semibold mt-2 pl-3 relative z-10" style={{ color: '#C9A84C' }}>
              {expanded ? 'Tutup ▲' : 'Baca selengkapnya ▼'}
            </p>
          )}
        </button>
      </div>

      {/* Action bar */}
      <div className="flex items-center px-3 py-1.5 mt-2 gap-1 relative z-10" style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="relative flex-1">
          <ParticleBurst active={burst} />
          <motion.button
            onClick={handleAamiin}
            disabled={isPending}
            whileTap={{ scale: 0.88 }}
            animate={burst ? { scale: [1, 1.10, 1] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl w-full justify-center relative z-[1]"
            style={
              hasAamined
                ? { background: 'rgba(201,168,76,0.14)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.30)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', boxShadow: '0 0 16px -4px rgba(201,168,76,0.40)' }
                : { background: 'rgba(201,168,76,0.04)', color: 'rgba(201,168,76,0.60)', border: '1px solid rgba(201,168,76,0.14)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }
            }
            aria-pressed={hasAamined}
          >
            <motion.span
              style={{ fontSize: 16 }}
              animate={burst ? { rotate: [-10, 10, 0], y: [-2, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              🤲
            </motion.span>
            <span className="text-[12px] font-semibold">
              {aaminCount > 0 ? `${formatCount(aaminCount)} ` : ''}Aamiin
            </span>
          </motion.button>
        </div>

        <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl flex-1 justify-center transition-all"
          style={{
            background: showComments ? 'rgba(107,143,212,0.12)' : 'rgba(107,143,212,0.06)',
            color: showComments ? 'var(--accent-2)' : 'rgba(107,143,212,0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px] font-semibold">
            {localCommentCount > 0 ? `${formatCount(localCommentCount)} ` : ''}Komen
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <CommentsSection doaWishId={wish.id} onCountChange={(delta) => setLocalCommentCount((c) => c + delta)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── MobileCategoryModal ────────────────────────────────────────────────── */

function MobileCategoryModal({ open, selected, wishes, onSelect, onClose }: { open: boolean; selected: string; wishes: DoaWishItem[]; onSelect: (val: string) => void; onClose: () => void }) {
  const ALL_CATS = [{ value: 'semua', label: 'Semua', icon: '🤍' }, ...DOA_CATEGORIES] as const
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(6,6,12,0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="glass-sheet fixed bottom-0 left-0 right-0 z-[65] safe-bottom overflow-hidden"
            style={{ borderRadius: '28px 28px 0 0', boxShadow: '0 -20px 60px rgba(0,0,0,0.65), 0 -1px 0 rgba(255,255,255,0.08)', maxHeight: '80dvh', overflowY: 'auto' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          >
            <div className="flex justify-center pt-3">
              <div className="w-10 rounded-full" style={{ height: 3, background: 'rgba(255,255,255,0.20)', borderRadius: '9999px' }} />
            </div>
            <div className="px-5 pt-4 pb-3" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 700, color: '#fff' }}>Pilih Kategori</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-3 gap-3">
              {ALL_CATS.map((cat) => {
                const isActive = selected === cat.value
                const colors = CATEGORY_COLORS[cat.value] ?? { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: 'rgba(201,168,76,0.25)' }
                const count = cat.value === 'semua' ? wishes.length : wishes.filter((w) => w.category === cat.value).length
                return (
                  <motion.button
                    key={cat.value}
                    onClick={() => { onSelect(cat.value); onClose() }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="flex flex-col items-center gap-2 py-4 rounded-3xl relative overflow-hidden"
                    style={{
                      background: isActive ? colors.bg : 'rgba(255,255,255,0.04)',
                      border: isActive ? `1.5px solid ${colors.border}` : '1px solid rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: isActive ? `0 0 24px -4px ${colors.text}55` : 'none',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ background: `radial-gradient(circle at 50% 30%, ${colors.border} 0%, transparent 70%)` }}
                      />
                    )}
                    <span className="relative z-10" style={{ fontSize: 26 }}>{cat.icon}</span>
                    <span className="text-[11px] font-semibold text-center leading-tight px-1 relative z-10" style={{ color: isActive ? colors.text : 'rgba(255,255,255,0.55)' }}>
                      {cat.label}
                    </span>
                    {count > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full relative z-10" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                        {count}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── PostDoaSheet ───────────────────────────────────────────────────────── */

function PostDoaSheet({ open, onClose, mosques, onSubmitted }: { open: boolean; onClose: () => void; mosques: FollowedMosque[]; onSubmitted: (wish: DoaWishItem) => void }) {
  const primaryMosque = mosques.find((m) => m.is_primary) ?? mosques[0] ?? null
  const [step, setStep] = useState<'category' | 'write'>('category')
  const [selectedCategory, setSelectedCategory] = useState<DoaCategory>('umum')
  const [text, setText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(primaryMosque?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const MIN_CHARS = 10
  const charsLeft = MAX_CHARS - text.length
  const trimmedLength = text.trim().length
  const hasProfanity = trimmedLength > 0 && containsProfanity(text)
  const canSubmit = trimmedLength >= MIN_CHARS && !isPending && !hasProfanity
  const selectedCategoryObj = DOA_CATEGORIES.find((c) => c.value === selectedCategory)

  function handleClose() { if (isPending) return; setStep('category'); onClose() }
  function handleSelectCategory(cat: DoaCategory) { setSelectedCategory(cat); setStep('write') }

  function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    startTransition(async () => {
      const result = await postDoa({ doaText: text, isAnonymous, mosqueId: selectedMosqueId, category: selectedCategory })
      if ('error' in result) { setError(result.error); return }
      const mosque = mosques.find((m) => m.id === selectedMosqueId) ?? null
      onSubmitted({
        id: result.id, doaText: text, isAnonymous, authorName: result.authorName,
        mosqueId: selectedMosqueId, mosqueName: mosque?.name ?? null,
        mosqueColor: mosque?.theme.primary ?? '#102937',
        aaminCount: 0, userHasAamined: false, commentCount: 0,
        createdAt: new Date().toISOString(), category: selectedCategory,
      })
      setText('')
      setIsAnonymous(true)
      setSelectedMosqueId(primaryMosque?.id ?? null)
      setStep('category')
    })
  }

  const circumference = 2 * Math.PI * 9
  const catColors = CATEGORY_COLORS[selectedCategory]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[50]"
            style={{ background: 'rgba(6,6,12,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="glass-sheet fixed bottom-0 left-0 right-0 z-[55] safe-bottom overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px]"
            style={{
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.70), 0 0 0 0.5px rgba(255,255,255,0.08)',
              maxHeight: '92dvh',
              overflowY: 'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="flex justify-center pt-3 pb-0 md:hidden">
              <div className="w-10 rounded-full" style={{ height: 3, background: 'rgba(255,255,255,0.20)', borderRadius: '9999px' }} />
            </div>

            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-2">
                {step === 'write' && (
                  <button
                    onClick={() => setStep('category')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.12)' }}
                    aria-label="Kembali"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M19 12H5M11 6l-6 6 6 6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <h3 style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '26px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.3px',
                    background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.75) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    {step === 'category' ? 'Pilih Kategori' : 'Tulis Doa'}
                  </h3>
                  <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-jakarta)' }}>
                    {step === 'category' ? 'Doa anda akan dikongsi dengan jemaah SAJDA' : 'Tuliskan dengan penuh ikhlas'}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.12)' }}
                  aria-label="Tutup"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.50)" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 'category' ? (
                <motion.div
                  key="category"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="px-5 py-5"
                >
                  <div className="grid grid-cols-3 gap-2.5">
                    {DOA_CATEGORIES.map((cat) => {
                      const colors = CATEGORY_COLORS[cat.value]
                      const isSelected = selectedCategory === cat.value
                      return (
                        <motion.button
                          key={cat.value}
                          onClick={() => handleSelectCategory(cat.value)}
                          whileTap={{ scale: 0.94 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          className="flex flex-col items-center gap-2.5 py-4 rounded-3xl relative overflow-hidden"
                          style={{
                            background: isSelected ? (colors?.bg ?? 'rgba(166,124,197,0.15)') : 'rgba(255,255,255,0.04)',
                            border: isSelected ? `1.5px solid ${colors?.border ?? 'rgba(166,124,197,0.35)'}` : '1px solid rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            boxShadow: isSelected ? `0 0 24px -4px ${colors?.text ?? 'rgba(166,124,197,0.5)'}55` : 'none',
                          }}
                        >
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 rounded-3xl pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{ background: `radial-gradient(circle at 50% 30%, ${colors?.border ?? 'rgba(166,124,197,0.3)'} 0%, transparent 70%)` }}
                            />
                          )}
                          <span className="relative z-10" style={{ fontSize: 30 }}>{cat.icon}</span>
                          <span className="text-[11px] font-semibold text-center leading-tight px-1 relative z-10" style={{ color: isSelected ? (colors?.text ?? 'var(--primary)') : 'rgba(255,255,255,0.55)' }}>
                            {cat.label}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="write"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="px-5 py-5 flex flex-col gap-4"
                >
                  {selectedCategoryObj && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: catColors?.bg ?? 'rgba(166,124,197,0.12)', color: catColors?.text ?? 'var(--primary)', border: `1px solid ${catColors?.border ?? 'rgba(166,124,197,0.25)'}` }}
                      >
                        <span style={{ fontSize: 14 }}>{selectedCategoryObj.icon}</span>
                        {selectedCategoryObj.label}
                      </span>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>— kategori dipilih</span>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jakarta)' }}>
                      Doa anda
                    </label>
                    <div
                      className="relative rounded-2xl p-[1.5px] glass-surface-2"
                      style={{
                        boxShadow: hasProfanity
                          ? `0 0 0 1.5px rgba(192,57,43,0.66)`
                          : `0 0 0 1.5px ${catColors?.text ?? 'rgba(166,124,197,0.5)'}55`,
                      }}
                    >
                      <textarea
                        value={text}
                        onChange={(e) => { setText(e.target.value.slice(0, MAX_CHARS)); setError(null) }}
                        placeholder="Tuliskan doa anda dengan penuh ikhlas..."
                        rows={5}
                        className="w-full resize-none rounded-[10px] px-4 py-3.5 text-sm outline-none"
                        style={{ background: 'transparent', color: 'rgba(255,255,255,0.88)', fontFamily: 'var(--font-jakarta)', lineHeight: '1.8' }}
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                      {hasProfanity ? (
                        <p className="text-[11px]" style={{ color: 'var(--error)' }}>{PROFANITY_ERROR_MSG}</p>
                      ) : error ? (
                        <p className="text-[11px]" style={{ color: 'var(--error)' }}>{error}</p>
                      ) : trimmedLength > 0 && trimmedLength < MIN_CHARS ? (
                        <p className="text-[11px]" style={{ color: '#C9A84C' }}>Min {MIN_CHARS} huruf ({MIN_CHARS - trimmedLength} lagi)</p>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                          <circle cx="12" cy="12" r="9" fill="none" stroke={charsLeft < 30 ? '#C9A84C' : 'var(--primary)'} strokeWidth="2.5" strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference * (1 - text.length / MAX_CHARS)}`} strokeLinecap="round" transform="rotate(-90 12 12)" style={{ transition: 'stroke-dashoffset 0.2s ease, stroke 0.3s ease' }} />
                        </svg>
                        <span className="text-[11px] tabular-nums" style={{ color: charsLeft < 30 ? '#C9A84C' : 'rgba(255,255,255,0.35)' }}>{charsLeft}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[13px] font-semibold" style={{ color: '#FFFFFF', fontFamily: 'var(--font-jakarta)' }}>
                        {isAnonymous ? '🌙 Hamba Allah' : '👤 Papar Nama Saya'}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {isAnonymous ? 'Nama anda tidak akan dipapar' : 'Nama anda akan kelihatan kepada semua'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAnonymous((v) => !v)}
                      className="relative flex-shrink-0 rounded-full"
                      style={{
                        width: 52,
                        height: 30,
                        background: !isAnonymous ? 'linear-gradient(90deg, var(--primary) 0%, #C9A84C 100%)' : 'rgba(255,255,255,0.10)',
                        border: '0.5px solid rgba(255,255,255,0.14)',
                        boxShadow: !isAnonymous ? '0 0 12px rgba(166,124,197,0.35)' : 'none',
                        transition: 'background 0.3s, box-shadow 0.3s',
                      }}
                      aria-checked={!isAnonymous}
                      role="switch"
                    >
                      <motion.div
                        animate={{ x: !isAnonymous ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute rounded-full"
                        style={{ width: 22, height: 22, top: 4, background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.20)' }}
                      />
                    </button>
                  </div>

                  {mosques.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2.5 px-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jakarta)' }}>Masjid</p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedMosqueId(null)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                          style={selectedMosqueId === null ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(166,124,197,0.30)' } : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '0.5px solid rgba(255,255,255,0.09)' }}
                        >
                          Tiada
                        </button>
                        {mosques.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMosqueId(m.id)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={selectedMosqueId === m.id ? { background: m.theme.primary, color: '#fff', boxShadow: `0 2px 8px ${m.theme.primary}40` } : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '0.5px solid rgba(255,255,255,0.09)' }}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    whileTap={canSubmit ? { scale: 0.97 } : {}}
                    className="w-full py-4 text-sm font-bold relative overflow-hidden"
                    style={{
                      borderRadius: '16px',
                      ...(canSubmit
                        ? { background: 'linear-gradient(135deg, #C9A84C 0%, #B8943C 40%, #C9A84C 100%)', color: '#1A1200', boxShadow: '0 4px 24px rgba(201,168,76,0.40), 0 1px 2px rgba(0,0,0,0.20)', fontFamily: 'var(--font-jakarta)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }
                        : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }),
                    }}
                  >
                    {canSubmit && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                      />
                    )}
                    <span className="relative z-10">
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="inline-block rounded-full border-2" style={{ width: 16, height: 16, borderColor: 'rgba(26,18,0,0.3)', borderTopColor: '#1A1200' }} />
                          Menghantar...
                        </span>
                      ) : (
                        '✶ Hantar Doa'
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── DoaContent ─────────────────────────────────────────────────────────── */

export function DoaContent({ mosques, wishes: initialWishes }: Props) {
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('semua')
  const [wishes, setWishes] = useState<DoaWishItem[]>(initialWishes)
  const [showPostSheet, setShowPostSheet] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const topWishes = [...wishes].sort((a, b) => b.aaminCount - a.aaminCount).slice(0, 3)
  const featuredWish = topWishes[0] ?? null

  const visibleWishes = wishes
    .filter((w) => !selectedMosqueId || w.mosqueId === selectedMosqueId)
    .filter((w) => selectedCategoryFilter === 'semua' || w.category === selectedCategoryFilter)

  const totalAamiin = wishes.reduce((acc, w) => acc + w.aaminCount, 0)

  function handleAaminUpdate(id: string, delta: number, newState: boolean) {
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, aaminCount: w.aaminCount + delta, userHasAamined: newState } : w))
  }

  function handleNewWish(wish: DoaWishItem) {
    setWishes((prev) => [wish, ...prev])
    setShowPostSheet(false)
  }

  const ALL_CATS_FILTER = [{ value: 'semua', label: 'Semua', icon: '🤍' }, ...DOA_CATEGORIES] as const

  return (
    <div className="relative overflow-x-hidden">
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .shimmer-bg { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.8s infinite; }
      `}</style>

      {/* Global aurora background */}
      <AuroraBackground />

      {/* Three-zone flex: stacks on mobile, flex-row on md+ */}
      <div className="md:flex md:gap-5 md:items-start relative z-10">

        {/* ZONE 1: Desktop Left Sidebar */}
        <aside className="hidden md:flex flex-col flex-shrink-0 sticky top-6 gap-4" style={{ width: '200px' }}>
          {/* Branding + stats */}
          <div className="glass-surface rounded-2xl overflow-hidden relative" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.30)' }}>
            <IslamicPattern id="geo-doa-sidebar" />
            <div className="relative z-10 px-4 pt-5 pb-3">
              <p style={{ fontFamily: 'var(--font-amiri)', fontSize: '18px', color: 'rgba(201,168,76,0.75)', direction: 'rtl', lineHeight: 1.3, marginBottom: '4px' }}>
                {'دُعاء الجماعة'}
              </p>
              <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                Doa Bersama
              </h2>
            </div>
            <div className="px-4 pb-4 flex flex-col gap-2 relative z-10" style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between pt-3">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jakarta)' }}>🤲 Total Doa</span>
                <span className="text-[13px] font-bold" style={{ color: '#fff' }}>{formatCount(wishes.length)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-jakarta)' }}>{'✨'} Total Aamiin</span>
                <span className="text-[13px] font-bold" style={{ color: '#C9A84C' }}>{formatCount(totalAamiin)}</span>
              </div>
            </div>
          </div>

          {/* Category nav */}
          <div className="glass-surface-2 rounded-2xl overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.25)' }}>Kategori</p>
            {ALL_CATS_FILTER.map((cat) => {
              const isActive = selectedCategoryFilter === cat.value
              const count = cat.value === 'semua' ? wishes.length : wishes.filter((w) => w.category === cat.value).length
              const colors = CATEGORY_COLORS[cat.value] ?? { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: '' }
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategoryFilter(cat.value)}
                  className="w-full flex items-center justify-between px-4 py-2.5 transition-all"
                  style={{
                    background: isActive ? colors.bg : 'transparent',
                    backdropFilter: isActive ? 'blur(6px)' : 'none',
                    WebkitBackdropFilter: isActive ? 'blur(6px)' : 'none',
                    boxShadow: isActive ? `-4px 0 12px -2px ${colors.text}44` : 'none',
                    borderLeft: isActive ? `2px solid ${colors.text}` : '2px solid transparent',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span style={{ fontSize: 13 }}>{cat.icon}</span>
                    <span className="text-[12px] font-semibold" style={{ color: isActive ? colors.text : 'rgba(255,255,255,0.45)' }}>{cat.label}</span>
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: isActive ? `${colors.text}20` : 'rgba(255,255,255,0.06)', color: isActive ? colors.text : 'rgba(255,255,255,0.25)' }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
            <div className="h-2" />
          </div>

          {/* Mosque filter */}
          {mosques.length > 0 && (
            <div className="glass-surface-2 rounded-2xl overflow-hidden">
              <p className="px-4 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.25)' }}>Masjid</p>
              {[{ id: null as null, name: 'Semua Masjid', theme: { primary: 'var(--primary)' } }, ...mosques].map((m) => {
                const isActive = selectedMosqueId === m.id
                return (
                  <button
                    key={m.id ?? 'all'}
                    onClick={() => setSelectedMosqueId(m.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 transition-all"
                    style={{ background: isActive ? `${m.theme.primary}18` : 'transparent', borderLeft: isActive ? `2px solid ${m.theme.primary}` : '2px solid transparent' }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isActive ? m.theme.primary : 'rgba(255,255,255,0.20)' }} />
                    <span className="text-[12px] font-semibold truncate" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.40)' }}>{m.name}</span>
                  </button>
                )
              })}
              <div className="h-2" />
            </div>
          )}

          {/* Tulis Doa CTA */}
          <motion.button
            onClick={() => setShowPostSheet(true)}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-3.5 rounded-2xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #B8943C 50%, #C9A84C 100%)', color: '#1A1200', boxShadow: '0 8px 32px rgba(201,168,76,0.38), 0 2px 8px rgba(0,0,0,0.28)', fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '13px' }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />
            <span className="relative z-10">🤲 Tulis Doa</span>
          </motion.button>
        </aside>

        {/* ZONE 2: Center Feed */}
        <div className="flex-1 min-w-0">

          {/* Hero */}
          <div className="px-4 pt-4 pb-0 md:px-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-3xl overflow-hidden relative min-h-[240px] md:min-h-[160px]"
              style={{ background: 'rgba(10,9,22,0.96)', boxShadow: '0 4px 32px rgba(0,0,0,0.50)' }}
            >
              <IslamicPattern id="geo-doa-hero" />
              <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(166,124,197,0.35) 0%, transparent 65%)', filter: 'blur(40px)' }} />
              <motion.div
                className="absolute -bottom-6 -left-6 w-52 h-52 rounded-full pointer-events-none"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 65%)', filter: 'blur(36px)' }}
              />
              <motion.div
                className="absolute top-4 left-1/4 w-40 h-40 rounded-full pointer-events-none"
                animate={{ opacity: [0.4, 0.7, 0.4], x: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(ellipse, rgba(107,143,212,0.20) 0%, transparent 65%)', filter: 'blur(28px)' }}
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none"
                style={{ fontFamily: 'var(--font-amiri)', fontSize: '120px', color: 'rgba(166,124,197,0.10)', lineHeight: 1, direction: 'rtl' }}
              >
                {'يَا رَبِّ'}
              </div>
              <div className="relative z-10 px-5 pt-5 pb-5">
                {/* Dynamic Island pill */}
                <div className="dynamic-island mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#C9A84C', textTransform: 'uppercase' }}>
                    Berdoa Bersama
                  </span>
                </div>
                <p className="mb-1" style={{ fontFamily: 'var(--font-amiri)', fontSize: '18px', color: 'rgba(255,255,255,0.65)', direction: 'rtl', lineHeight: 1.4 }}>
                  {'دُعاء الجماعة'}
                </p>
                <h1 className="mb-1" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '36px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  Doa Bersama
                </h1>
                <p className="mb-4" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-jakarta)', lineHeight: 1.6 }}>
                  Kongsi doa — semua jemaah akan mengaminkan
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.14)' }}>
                    <span style={{ fontSize: 13 }}>🤲</span>
                    <span className="text-[13px] font-bold" style={{ color: '#fff' }}>{formatCount(wishes.length)}</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>doa</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.14)' }}>
                    <span style={{ fontSize: 13 }}>{'✨'}</span>
                    <span className="text-[13px] font-bold" style={{ color: '#fff' }}>{formatCount(totalAamiin)}</span>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>aamiin</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile Spotlight row */}
          {topWishes.length > 0 && (
            <div className="pt-4 md:hidden">
              <div className="flex items-center justify-between px-4 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(201,168,76,0.70)' }}>{'✶'} Doa Terpilih</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Paling ramai Aamiin</span>
              </div>
              <div className="flex gap-2.5 px-4 pb-1 overflow-x-auto scrollbar-none">
                {topWishes.map((w) => {
                  const cat = DOA_CATEGORIES.find((c) => c.value === w.category)
                  const catColors = CATEGORY_COLORS[w.category]
                  return (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="flex-shrink-0 glass-surface rounded-2xl overflow-hidden"
                      style={{ width: '200px', boxShadow: `0 2px 12px rgba(0,0,0,0.30), 0 0 24px -8px ${catColors?.text ?? 'var(--primary)'}44` }}
                    >
                      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${catColors?.text ?? 'var(--primary)'} 0%, transparent 100%)` }} />
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          {cat && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: catColors?.bg, color: catColors?.text, border: `1px solid ${catColors?.border}` }}>
                              {cat.icon} {cat.label}
                            </span>
                          )}
                          <span className="text-[10px] font-bold" style={{ color: '#C9A84C' }}>🤲 {formatCount(w.aaminCount)}</span>
                        </div>
                        <p className="text-[12px] leading-[1.7] line-clamp-2" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-jakarta)' }}>{w.doaText}</p>
                        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          {w.isAnonymous ? 'Hamba Allah' : (w.authorName ?? 'Jemaah')}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mobile filter row — horizontal pill scroll */}
          <div className="flex items-center gap-0 px-4 pt-3 pb-1 md:hidden overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <div className="flex items-center gap-2 flex-nowrap pr-2">
              {ALL_CATS_FILTER.map((cat) => {
                const isActive = selectedCategoryFilter === cat.value
                const colors = CATEGORY_COLORS[cat.value] ?? { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: 'rgba(201,168,76,0.25)' }
                return (
                  <motion.button
                    key={cat.value}
                    onClick={() => setSelectedCategoryFilter(cat.value)}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                    style={
                      isActive
                        ? { background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, boxShadow: `0 0 12px -2px ${colors.text}66`, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.50)', border: '0.5px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }
                    }
                  >
                    <span style={{ fontSize: 12 }}>{cat.icon}</span>
                    {cat.label}
                  </motion.button>
                )
              })}

              {mosques.length > 0 && (
                <>
                  <div className="flex-shrink-0 w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.10)' }} />
                  {[{ id: null as null, name: 'Semua', theme: { primary: 'var(--primary)' } }, ...mosques].map((m) => {
                    const isActive = selectedMosqueId === m.id
                    return (
                      <motion.button
                        key={m.id ?? 'all'}
                        onClick={() => setSelectedMosqueId(m.id)}
                        whileTap={{ scale: 0.94 }}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
                        style={
                          isActive
                            ? { background: m.theme.primary, color: '#fff', boxShadow: `0 0 10px -2px ${m.theme.primary}88` }
                            : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '0.5px solid rgba(255,255,255,0.09)' }
                        }
                      >
                        {m.name.split(' ').slice(0, 2).join(' ')}
                      </motion.button>
                    )
                  })}
                </>
              )}

              {/* Overflow: opens full modal */}
              <motion.button
                onClick={() => setShowCategoryModal(true)}
                whileTap={{ scale: 0.94 }}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.40)' }}
                aria-label="Semua kategori"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5"  r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Desktop featured card */}
          {featuredWish && (
            <div className="hidden md:block pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold" style={{ color: '#C9A84C' }}>🏆</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(201,168,76,0.65)' }}>Paling Banyak Aamiin</span>
              </div>
              <div style={{ borderRadius: '28px', padding: '1.5px', background: 'transparent', boxShadow: '0 0 0 1px rgba(201,168,76,0.35), 0 0 40px rgba(201,168,76,0.18), 0 16px 48px rgba(0,0,0,0.40)' }}>
                <div style={{ borderRadius: '26px', overflow: 'hidden' }}>
                  <DoaWishCard wish={featuredWish} index={0} onAaminUpdate={handleAaminUpdate} />
                </div>
              </div>
            </div>
          )}

          {/* Feed */}
          <div className="px-4 md:px-0 pb-[140px] md:pb-12 pt-2">
            <AnimatePresence mode="popLayout">
              {visibleWishes.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center py-24 text-center px-6">
                  <motion.div className="relative w-24 h-24 mb-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                    <svg viewBox="0 0 96 96" fill="none" className="w-full h-full">
                      <circle cx="48" cy="48" r="44" fill="rgba(166,124,197,0.06)" />
                      <circle cx="48" cy="48" r="36" fill="rgba(166,124,197,0.04)" stroke="rgba(166,124,197,0.15)" strokeWidth="1" strokeDasharray="4 6" />
                      <path d="M56 24C42.75 24 32 34.75 32 48C32 61.25 42.75 72 56 72C48.27 72 42 65.73 42 58C42 44.75 46.54 33.46 56 24Z" fill="rgba(166,124,197,0.22)" stroke="rgba(166,124,197,0.50)" strokeWidth="1.5" />
                      <circle cx="64" cy="32" r="2" fill="#C9A84C" opacity="0.7" />
                      <circle cx="70" cy="44" r="1.5" fill="#A67CC5" opacity="0.6" />
                      <circle cx="62" cy="56" r="1" fill="#6B8FD4" opacity="0.5" />
                      <circle cx="40" cy="30" r="1.5" fill="#C9A84C" opacity="0.4" />
                    </svg>
                  </motion.div>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-1" style={{ fontFamily: 'var(--font-amiri)', fontSize: '18px', color: 'rgba(166,124,197,0.60)', direction: 'rtl' }}>
                    {'وَقَالَ رَبُّكُمُ ادْعُونِي'}
                  </motion.p>
                  <motion.h3 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-bold mb-2" style={{ color: 'var(--text)', fontFamily: 'var(--font-cormorant)', letterSpacing: '-0.2px' }}>
                    {selectedCategoryFilter !== 'semua' ? 'Tiada doa dalam kategori ini' : 'Belum ada doa'}
                  </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[13px] mb-8 max-w-[240px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-jakarta)' }}>
                    {selectedCategoryFilter !== 'semua' ? 'Cuba kategori lain atau jadilah yang pertama berkongsi.' : 'Jadilah yang pertama berkongsi doa. Allah maha mendengar.'}
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setShowPostSheet(true)}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, rgba(166,124,197,0.80) 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(166,124,197,0.30)', fontFamily: 'var(--font-jakarta)' }}
                  >
                    🤲 Tulis Doa Pertama
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* Mobile: all cards */}
                  <div className="flex flex-col gap-3 pt-1 md:hidden">
                    {visibleWishes.map((wish, i) => (
                      <DoaWishCard key={wish.id} wish={wish} index={i} onAaminUpdate={handleAaminUpdate} />
                    ))}
                  </div>
                  {/* Desktop: exclude featured, 2-col at md, 1-col at lg */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-1 md:gap-4 md:items-start pt-1">
                    {visibleWishes
                      .filter((w) => !featuredWish || w.id !== featuredWish.id)
                      .map((wish, i) => (
                        <DoaWishCard key={wish.id} wish={wish} index={i + 1} onAaminUpdate={handleAaminUpdate} />
                      ))}
                  </div>
                </>
              )}
            </AnimatePresence>

            {visibleWishes.length > 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <p style={{ fontFamily: 'var(--font-amiri)', fontSize: '16px', color: 'rgba(166,124,197,0.38)', direction: 'rtl', marginBottom: '4px' }}>
                  {'ادْعُونِي أَسْتَجِبْ لَكُمْ'}
                </p>
                <div className="flex items-center gap-3 w-full max-w-[200px]">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))' }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(201,168,76,0.40)' }} />
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
                </div>
                <span className="text-[11px] font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.18)' }}>Itu sahaja buat masa ini</span>
              </div>
            )}
          </div>

        </div>{/* end center feed */}

        {/* ZONE 3: Desktop Right Panel (lg+) */}
        {topWishes.length > 0 && (
          <aside className="hidden lg:flex flex-col flex-shrink-0 sticky top-6" style={{ width: '220px' }}>
            <div className="glass-surface rounded-2xl overflow-hidden">
              <div className="px-4 py-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(201,168,76,0.85)' }}>{'✶'} Trending Hari Ini</span>
              </div>
              <div className="flex flex-col">
                {topWishes.map((w, i) => {
                  const cat = DOA_CATEGORIES.find((c) => c.value === w.category)
                  const catColors = CATEGORY_COLORS[w.category]
                  return (
                    <div
                      key={w.id}
                      className="px-4 py-3.5 relative"
                      style={{
                        background: `linear-gradient(90deg, ${catColors?.text ?? 'var(--primary)'}18, transparent)`,
                        boxShadow: `inset 4px 0 12px -4px ${catColors?.text ?? 'var(--primary)'}55`,
                        borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                      }}
                    >
                      <span className="absolute top-3 right-3 font-black" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', color: '#C9A84C', opacity: 0.18 }}>{i + 1}</span>
                      {cat && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1.5" style={{ background: catColors?.bg, color: catColors?.text }}>
                          {cat.icon} {cat.label}
                        </span>
                      )}
                      <p className="text-[12px] leading-[1.65] line-clamp-2 mb-1.5" style={{ color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-jakarta)' }}>{w.doaText}</p>
                      <span className="text-[10px] font-bold" style={{ color: '#C9A84C' }}>🤲 {formatCount(w.aaminCount)} aamiin</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        )}

      </div>{/* end three-zone flex */}

      {/* Mobile sticky bottom bar */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 flex justify-center px-6 pb-2 pt-2"
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(0deg, rgba(12,12,20,0.98) 0%, rgba(12,12,20,0.80) 70%, transparent 100%)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      >
        <motion.button
          onClick={() => setShowPostSheet(true)}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.3 }}
          className="relative flex items-center justify-center gap-2.5 rounded-full overflow-hidden"
          style={{
            width: '200px',
            height: '48px',
            background: 'linear-gradient(135deg, #C9A84C 0%, #B8943C 50%, #C9A84C 100%)',
            boxShadow: '0 8px 32px rgba(201,168,76,0.50), 0 2px 12px rgba(0,0,0,0.40), 0 0 0 0.5px rgba(255,255,255,0.10)',
            color: '#1A1200',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          aria-label="Tulis doa baru"
        >
          <motion.div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }} />
          <motion.div className="absolute inset-0 rounded-full pointer-events-none" animate={{ scale: [1, 1.18, 1], opacity: [0, 0.28, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 1.5 }} style={{ background: 'rgba(201,168,76,0.55)' }} />
          <span className="relative z-10 text-lg">🤲</span>
          <span className="relative z-10 text-[14px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-jakarta)' }}>Tulis Doa +</span>
        </motion.button>
      </div>

      {/* Desktop FAB */}
      <motion.button
        onClick={() => setShowPostSheet(true)}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.04 }}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 0.4 }}
        className="hidden md:flex fixed bottom-8 right-8 z-40 items-center gap-2 pl-4 pr-5 h-14 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #C9A84C 0%, #B8943C 100%)',
          boxShadow: '0 8px 32px rgba(201,168,76,0.45), 0 2px 8px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.12)',
          color: '#1A1200',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        aria-label="Tulis doa baru"
      >
        <motion.div className="absolute inset-0 rounded-full pointer-events-none" animate={{ scale: [1, 1.25, 1], opacity: [0, 0.25, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 2 }} style={{ background: 'rgba(201,168,76,0.5)' }} />
        <span className="relative z-10" style={{ fontSize: 18 }}>🤲</span>
        <span className="text-[13px] font-bold relative z-10" style={{ fontFamily: 'var(--font-jakarta)' }}>Tulis Doa</span>
      </motion.button>

      <MobileCategoryModal
        open={showCategoryModal}
        selected={selectedCategoryFilter}
        wishes={wishes}
        onSelect={setSelectedCategoryFilter}
        onClose={() => setShowCategoryModal(false)}
      />

      <PostDoaSheet
        open={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        mosques={mosques}
        onSubmitted={handleNewWish}
      />
    </div>
  )
}
