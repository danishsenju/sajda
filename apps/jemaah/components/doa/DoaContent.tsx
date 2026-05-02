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
}

type Props = {
  mosques: FollowedMosque[]
  wishes: DoaWishItem[]
}

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

/* ─── CommentItem ────────────────────────────────────────────────────────── */

function CommentItem({
  comment,
  onDelete,
}: {
  comment: DoaComment
  onDelete: (id: string) => void
}) {
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
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
        style={{
          background: comment.isAnonymous ? '#F0EEE9' : '#EAF4EE',
          color: comment.isAnonymous ? '#A8A49E' : '#2D6A4F',
          fontSize: comment.isAnonymous ? 12 : 10,
        }}
      >
        {initials}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div
          className="inline-block px-3 py-2 rounded-2xl rounded-tl-sm max-w-full"
          style={{ background: '#F0EEE9' }}
        >
          <span
            className="text-[12px] font-semibold mr-1.5"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-jakarta)' }}
          >
            {displayName}
          </span>
          <span
            className="text-[12px] leading-snug break-words"
            style={{ color: 'var(--text-muted)' }}
          >
            {comment.commentText}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 pl-1">
          <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
            {formatTimeAgo(comment.createdAt)}
          </span>
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

function CommentsSection({
  doaWishId,
  onCountChange,
}: {
  doaWishId: string
  onCountChange: (delta: number) => void
}) {
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

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleTextChange(value: string) {
    setCommentText(value.slice(0, MAX_COMMENT_CHARS))
    if (inputError) setInputError(null)
  }

  function handleSubmit() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    if (containsProfanity(trimmed)) {
      setInputError(PROFANITY_ERROR_MSG)
      return
    }

    startSubmit(async () => {
      const result = await postComment({ doaWishId, commentText: trimmed, isAnonymous })
      if ('error' in result) {
        setInputError(result.error)
        return
      }

      const newComment: DoaComment = {
        id: result.id,
        doaWishId,
        authorName: result.authorName,
        isAnonymous,
        commentText: trimmed,
        createdAt: result.createdAt,
        isOwn: true,
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
    <div className="pt-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border)' }}>

      {/* Comment list */}
      {loading ? (
        <div className="flex gap-2 py-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-3 rounded-full animate-pulse" style={{ width: i === 1 ? 80 : 120, background: '#E8E5DF' }} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {!showAll && hiddenCount > 0 && (
            <button
              key="load-more"
              onClick={() => setShowAll(true)}
              className="text-[11px] font-semibold mb-3 block"
              style={{ color: 'var(--accent)' }}
            >
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

      {/* Comment input */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
          style={{ background: '#EAF4EE', color: '#2D6A4F' }}
        >
          &bull;
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: '#F0EEE9' }}>
          <input
            ref={inputRef}
            value={commentText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                e.preventDefault()
                handleSubmit()
              }
            }}
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
                transition={{ duration: 0.15 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
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

      {/* Profanity / error */}
      <AnimatePresence>
        {inputError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] mt-1.5 pl-9"
            style={{ color: 'var(--error)' }}
          >
            {inputError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── DoaWishCard ────────────────────────────────────────────────────────── */

function DoaWishCard({
  wish,
  index,
  onAaminUpdate,
  onCommentCountChange,
}: {
  wish: DoaWishItem
  index: number
  onAaminUpdate: (id: string, delta: number, newState: boolean) => void
  onCommentCountChange: (id: string, delta: number) => void
}) {
  const [hasAamined, setHasAamined] = useState(wish.userHasAamined)
  const [aaminCount, setAaminCount] = useState(wish.aaminCount)
  const [commentCount, setCommentCount] = useState(wish.commentCount)
  const [burst, setBurst] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isPending, startTransition] = useTransition()

  const displayName = wish.isAnonymous ? 'Hamba Allah' : (wish.authorName ?? 'Jemaah')
  const initials = displayName === 'Hamba Allah' ? '☽' : getInitials(displayName)
  const isLong = wish.doaText.length > 180

  function handleAamiin() {
    if (isPending) return
    const nextState = !hasAamined
    const delta = nextState ? 1 : -1

    setHasAamined(nextState)
    setAaminCount((c) => c + delta)
    onAaminUpdate(wish.id, delta, nextState)

    if (nextState) {
      setBurst(true)
      setTimeout(() => setBurst(false), 600)
    }

    startTransition(async () => {
      const result = await toggleAamiin(wish.id)
      if ('error' in result) {
        setHasAamined(!nextState)
        setAaminCount((c) => c - delta)
        onAaminUpdate(wish.id, -delta, !nextState)
      }
    })
  }

  function handleCommentCountChange(delta: number) {
    setCommentCount((c) => c + delta)
    onCommentCountChange(wish.id, delta)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden bg-white"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(45,106,79,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #2D6A4F 0%, #52B788 60%, transparent 100%)' }} />

      <div className="px-4 pt-4 pb-0">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-semibold"
            style={
              wish.isAnonymous
                ? { background: '#F0EEE9', color: '#A8A49E', fontSize: 16 }
                : {
                    background: `linear-gradient(135deg, ${wish.mosqueColor} 0%, ${wish.mosqueColor}bb 100%)`,
                    color: '#fff',
                    fontSize: 12,
                    boxShadow: `0 2px 8px ${wish.mosqueColor}40`,
                  }
            }
          >
            {initials}
          </div>

          {/* Name + time */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--text)', fontFamily: 'var(--font-jakarta)' }}>
              {displayName}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {formatTimeAgo(wish.createdAt)}
            </p>
          </div>

          {/* Mosque badge */}
          {wish.mosqueName && (
            <span
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
              style={{
                background: `${wish.mosqueColor}12`,
                color: wish.mosqueColor,
                border: `1px solid ${wish.mosqueColor}25`,
              }}
            >
              <svg width="7" height="9" viewBox="0 0 14 18" fill="currentColor">
                <path d="M7 0C4.24 0 2 2.24 2 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 115.5 5 1.5 1.5 0 017 6.5z" />
              </svg>
              {wish.mosqueName.split(' ').slice(0, 2).join(' ')}
            </span>
          )}
        </div>

        {/* ── Doa text ──────────────────────────────────────────────── */}
        <button
          onClick={() => isLong && setExpanded((v) => !v)}
          className="w-full text-left mb-3"
          aria-expanded={expanded}
        >
          <div className="relative px-4 py-3.5 rounded-xl" style={{ background: '#F7F6F3' }}>
            <span
              className="absolute top-1.5 left-3 leading-none select-none pointer-events-none"
              style={{ fontFamily: 'var(--font-playfair)', fontSize: 36, color: '#2D6A4F', opacity: 0.12, lineHeight: 1 }}
            >
              &ldquo;
            </span>
            <p
              className={`text-sm leading-relaxed relative z-10 pl-1.5 ${!expanded && isLong ? 'line-clamp-3' : ''}`}
              style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
            >
              {wish.doaText}
            </p>
            {isLong && (
              <p className="text-[11px] font-semibold mt-1.5 pl-1.5 relative z-10" style={{ color: 'var(--accent)' }}>
                {expanded ? 'Tutup ▲' : 'Baca selengkapnya ▼'}
              </p>
            )}
          </div>
        </button>

        {/* ── Action bar (social media style) ──────────────────────── */}
        <div
          className="flex items-center gap-0 -mx-4 px-3 py-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Aamiin button */}
          <div className="relative flex-1">
            <AnimatePresence>
              {burst && (
                <motion.div
                  key="ring"
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{}}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ background: 'rgba(45,106,79,0.25)' }}
                />
              )}
            </AnimatePresence>
            <motion.button
              onClick={handleAamiin}
              disabled={isPending}
              whileTap={{ scale: 0.88 }}
              animate={burst ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl w-full justify-center transition-colors relative z-[1]"
              style={{
                background: hasAamined ? '#EAF4EE' : 'transparent',
                color: hasAamined ? '#2D6A4F' : 'var(--text-dim)',
              }}
              aria-label="Aamiin"
              aria-pressed={hasAamined}
            >
              <motion.svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                animate={burst ? { rotate: [-8, 8, 0] } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  d="M9 11V6a1 1 0 012 0v5M9 11V9a1 1 0 012 0v2M11 11V8a1 1 0 012 0v3M13 11V9a1 1 0 012 0v6c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3a1 1 0 012 0"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
              <span className="text-[13px] font-semibold">
                {aaminCount > 0 ? formatCount(aaminCount) : ''} Aamiin
              </span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--border)' }} />

          {/* Comment button */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1 justify-center transition-colors"
            style={{
              background: showComments ? '#EAF4EE' : 'transparent',
              color: showComments ? '#2D6A4F' : 'var(--text-dim)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[13px] font-semibold">
              {commentCount > 0 ? formatCount(commentCount) : ''} Komen
            </span>
          </button>
        </div>
      </div>

      {/* ── Comments section (lazy-expanded) ──────────────────────── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            key="comments"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <CommentsSection
              doaWishId={wish.id}
              onCountChange={handleCommentCountChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── PostDoaSheet ───────────────────────────────────────────────────────── */

const MAX_CHARS = 300

function PostDoaSheet({
  open,
  onClose,
  mosques,
  onSubmitted,
}: {
  open: boolean
  onClose: () => void
  mosques: FollowedMosque[]
  onSubmitted: (wish: DoaWishItem) => void
}) {
  const primaryMosque = mosques.find((m) => m.is_primary) ?? mosques[0] ?? null

  const [text, setText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(primaryMosque?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const MIN_CHARS = 10
  const charsLeft = MAX_CHARS - text.length
  const trimmedLength = text.trim().length
  const hasProfanity = trimmedLength > 0 && containsProfanity(text)
  const canSubmit = trimmedLength >= MIN_CHARS && !isPending && !hasProfanity

  function handleClose() {
    if (isPending) return
    onClose()
  }

  function handleSubmit() {
    if (!canSubmit) return
    setError(null)

    startTransition(async () => {
      const result = await postDoa({ doaText: text, isAnonymous, mosqueId: selectedMosqueId })

      if ('error' in result) {
        setError(result.error)
        return
      }

      const mosque = mosques.find((m) => m.id === selectedMosqueId) ?? null
      onSubmitted({
        id: result.id,
        doaText: text,
        isAnonymous,
        authorName: result.authorName,
        mosqueId: selectedMosqueId,
        mosqueName: mosque?.name ?? null,
        mosqueColor: mosque?.theme.primary ?? '#102937',
        aaminCount: 0,
        userHasAamined: false,
        commentCount: 0,
        createdAt: new Date().toISOString(),
      })

      setText('')
      setIsAnonymous(false)
      setSelectedMosqueId(primaryMosque?.id ?? null)
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[50]"
            style={{ background: 'rgba(26,25,22,0.60)', backdropFilter: 'blur(2px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[55] rounded-t-3xl safe-bottom overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-2xl"
            style={{ background: '#FFFFFF', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#D5D0C9' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 className="text-lg font-semibold leading-tight" style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}>
                  Tulis Doa
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  Doa anda akan dikongsi kepada semua jemaah SAJDA
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ background: 'var(--surface-3)' }}
                aria-label="Tutup"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Textarea */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
                  Doa anda
                </label>
                <textarea
                  value={text}
                  onChange={(e) => { setText(e.target.value.slice(0, MAX_CHARS)); setError(null) }}
                  placeholder="Tuliskan doa anda dengan penuh ikhlas..."
                  rows={5}
                  className="w-full resize-none rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    border: `1.5px solid ${hasProfanity ? 'var(--error)' : 'var(--border)'}`,
                    fontFamily: 'var(--font-jakarta)',
                    lineHeight: '1.7',
                  }}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
                <div className="flex justify-between items-center mt-1.5 px-1">
                  {hasProfanity ? (
                    <p className="text-[11px]" style={{ color: 'var(--error)' }}>{PROFANITY_ERROR_MSG}</p>
                  ) : error ? (
                    <p className="text-[11px]" style={{ color: 'var(--error)' }}>{error}</p>
                  ) : trimmedLength > 0 && trimmedLength < MIN_CHARS ? (
                    <p className="text-[11px]" style={{ color: 'var(--warning)' }}>
                      Minimum {MIN_CHARS} huruf ({MIN_CHARS - trimmedLength} lagi)
                    </p>
                  ) : (
                    <span />
                  )}
                  <p
                    className="text-[11px] font-medium tabular-nums"
                    style={{ color: charsLeft < 30 ? 'var(--warning)' : 'var(--text-dim)' }}
                  >
                    {text.length}/{MAX_CHARS}
                  </p>
                </div>
              </div>

              {/* Anonymous toggle */}
              <div
                className="flex items-center justify-between py-3.5 px-4 rounded-xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Tunjuk nama saya</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {isAnonymous ? 'Dipapar sebagai "Hamba Allah"' : 'Nama anda akan kelihatan'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAnonymous((v) => !v)}
                  className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
                  style={{
                    background: !isAnonymous
                      ? 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)'
                      : 'var(--border-strong)',
                  }}
                  aria-checked={!isAnonymous}
                  role="switch"
                >
                  <motion.div
                    animate={{ x: !isAnonymous ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full"
                    style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
                  />
                </button>
              </div>

              {/* Mosque selector */}
              {mosques.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 px-1" style={{ color: 'var(--text-dim)' }}>
                    Masjid
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedMosqueId(null)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={
                        selectedMosqueId === null
                          ? { background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(27,67,50,0.25)' }
                          : { background: 'var(--surface-3)', color: 'var(--text-muted)' }
                      }
                    >
                      Tiada
                    </button>
                    {mosques.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMosqueId(m.id)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={
                          selectedMosqueId === m.id
                            ? { background: m.theme.primary, color: '#fff', boxShadow: `0 2px 8px ${m.theme.primary}40` }
                            : { background: 'var(--surface-3)', color: 'var(--text-muted)' }
                        }
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                disabled={!canSubmit}
                whileTap={canSubmit ? { scale: 0.97 } : {}}
                className="w-full py-4 rounded-xl text-sm font-semibold transition-all"
                style={
                  canSubmit
                    ? { background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(27,67,50,0.30)' }
                    : { background: 'var(--surface-3)', color: 'var(--text-dim)' }
                }
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                    />
                    Menghantar...
                  </span>
                ) : (
                  'Hantar Doa'
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── DoaContent ─────────────────────────────────────────────────────────── */

export function DoaContent({ mosques, wishes: initialWishes }: Props) {
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null)
  const [wishes, setWishes] = useState<DoaWishItem[]>(initialWishes)
  const [showPostSheet, setShowPostSheet] = useState(false)

  const visibleWishes = selectedMosqueId
    ? wishes.filter((w) => w.mosqueId === selectedMosqueId)
    : wishes

  function handleAaminUpdate(id: string, delta: number, newState: boolean) {
    setWishes((prev) =>
      prev.map((w) => w.id === id ? { ...w, aaminCount: w.aaminCount + delta, userHasAamined: newState } : w)
    )
  }

  function handleCommentCountChange(id: string, delta: number) {
    setWishes((prev) =>
      prev.map((w) => w.id === id ? { ...w, commentCount: w.commentCount + delta } : w)
    )
  }

  function handleNewWish(wish: DoaWishItem) {
    setWishes((prev) => [wish, ...prev])
    setShowPostSheet(false)
  }

  return (
    <div className="relative">

      {/* ── Premium hero header ──────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-0 md:px-0">
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 55%, #3D8B5E 100%)',
            boxShadow: '0 4px 24px rgba(27,67,50,0.20)',
          }}
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 leading-none select-none pointer-events-none"
            style={{ fontFamily: 'var(--font-amiri)', fontSize: 72, color: 'rgba(255,255,255,0.06)', lineHeight: 1 }}>
            آمين
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="relative z-10 px-5 py-5">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.85)' }}>
              Komuniti SAJDA
            </p>
            <h1 className="text-2xl font-bold leading-tight mb-1" style={{ color: '#FFFFFF', fontFamily: 'var(--font-playfair)', letterSpacing: '-0.3px' }}>
              Doa Bersama
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Kongsi doa — semua jemaah akan mengaminkan
            </p>
          </div>
        </div>
      </div>

      {/* ── Mosque filter pills ─────────────────────────────────────── */}
      {mosques.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto md:px-0 md:py-4" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedMosqueId(null)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              selectedMosqueId === null
                ? { background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', color: '#fff', boxShadow: '0 2px 10px rgba(27,67,50,0.25)' }
                : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
            }
          >
            Semua
          </button>
          {mosques.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMosqueId(m.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={
                selectedMosqueId === m.id
                  ? { background: m.theme.primary, color: '#fff', boxShadow: `0 2px 10px ${m.theme.primary}40` }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Feed ────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-0 pb-28 md:pb-12">
        <AnimatePresence mode="popLayout">
          {visibleWishes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #EAF4EE 0%, #C7E6D4 100%)', boxShadow: '0 4px 16px rgba(45,106,79,0.12)' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11V6a1 1 0 012 0v5M9 11V9a1 1 0 012 0v2M11 11V8a1 1 0 012 0v3M13 11V9a1 1 0 012 0v6c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3a1 1 0 012 0"
                    stroke="#2D6A4F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}>
                Tiada doa lagi
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>
                Jadilah yang pertama berkongsi doa anda.
              </p>
              <button
                onClick={() => setShowPostSheet(true)}
                className="px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', color: '#fff', boxShadow: '0 4px 16px rgba(27,67,50,0.25)' }}
              >
                Tulis Doa Pertama
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 pt-1 md:grid md:grid-cols-2 md:gap-4 md:items-start">
              {visibleWishes.map((wish, i) => (
                <DoaWishCard
                  key={wish.id}
                  wish={wish}
                  index={i}
                  onAaminUpdate={handleAaminUpdate}
                  onCommentCountChange={handleCommentCountChange}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {visibleWishes.length > 0 && (
          <div className="flex items-center justify-center gap-3 py-10">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'var(--border)' }} />
            <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-dim)' }}>
              Itu sahaja buat masa ini
            </span>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'var(--border)' }} />
          </div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setShowPostSheet(true)}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-[88px] right-5 z-40 flex items-center gap-2.5 pl-4 pr-5 h-14 rounded-full md:bottom-8"
        style={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          boxShadow: '0 6px 24px rgba(27,67,50,0.40), 0 2px 8px rgba(0,0,0,0.12)',
        }}
        aria-label="Tulis doa baru"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold text-white">Tulis Doa</span>
      </motion.button>

      <PostDoaSheet
        open={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        mosques={mosques}
        onSubmitted={handleNewWish}
      />
    </div>
  )
}
