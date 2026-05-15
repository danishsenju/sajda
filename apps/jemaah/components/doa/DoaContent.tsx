'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, ChevronLeft } from 'lucide-react'
import { toggleAamiin, postDoa } from '@/app/actions/doa'
import { getComments, postComment, deleteComment } from '@/app/actions/doa-comments'
import type { DoaComment } from '@/app/actions/doa-comments'
import { containsProfanity, PROFANITY_ERROR_MSG } from '@/lib/utils/profanity'
import type { FollowedMosque } from '@/components/home/MosqueSwitcher'

/* ─── Types ─────────────────────────────────────────────────────────────── */

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

/* ─── Constants ─────────────────────────────────────────────────────────── */

const DOA_CATEGORIES = [
  { value: 'kesihatan',     label: 'Kesihatan',     icon: '🤲' },
  { value: 'keluarga',      label: 'Keluarga',       icon: '👨‍👩‍👧' },
  { value: 'pekerjaan',     label: 'Pekerjaan',      icon: '💼' },
  { value: 'pelajaran',     label: 'Pelajaran',      icon: '📖' },
  { value: 'kekuatan_iman', label: 'Kekuatan Iman', icon: '☪️' },
  { value: 'jodoh',         label: 'Jodoh',          icon: '💚' },
  { value: 'keselamatan',   label: 'Keselamatan',    icon: '🛡️' },
  { value: 'ummah',         label: 'Ummah',          icon: '🕌' },
  { value: 'umum',          label: 'Umum',           icon: '🤍' },
] as const

type DoaCategory = typeof DOA_CATEGORIES[number]['value']

const MAX_CHARS         = 300
const MIN_CHARS         = 10
const MAX_COMMENT_CHARS = 200
const PREVIEW_COMMENTS  = 3

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function formatTimeAgo(iso: string): string {
  const diff    = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1)  return 'baru sahaja'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}j`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'semalam'
  if (days < 7)   return `${days}h`
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

/* ─── CommentItem ───────────────────────────────────────────────────────── */

function CommentItem({
  comment,
  onDelete,
}: {
  comment: DoaComment
  onDelete: (id: string) => void
}) {
  const [deleting, startDelete] = useTransition()
  const displayName = comment.isAnonymous ? 'Hamba Allah' : (comment.authorName ?? 'Jemaah')
  const initials    = displayName === 'Hamba Allah' ? '☽' : getInitials(displayName)

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
      <div className="w-7 h-7 rounded-full bg-[--surface-overlay] border border-[--border] flex items-center justify-center flex-shrink-0 text-[10px] font-jakarta font-semibold text-[--text-secondary]">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="inline-block px-3 py-2 rounded-2xl rounded-tl-sm bg-[--surface-overlay] max-w-full">
          <span className="text-[12px] font-jakarta font-semibold text-[--text-primary] mr-1.5">
            {displayName}
          </span>
          <span className="text-[12px] font-jakarta text-[--text-secondary] leading-snug break-words">
            {comment.commentText}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 pl-1">
          <span className="text-[10px] font-jakarta text-[--text-disabled] tabular-nums">
            {formatTimeAgo(comment.createdAt)}
          </span>
          {comment.isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[10px] font-jakarta font-medium text-[--error] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {deleting ? 'Memadamkan...' : 'Padam'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── CommentsSection ───────────────────────────────────────────────────── */

function CommentsSection({
  doaWishId,
  onCountChange,
}: {
  doaWishId: string
  onCountChange: (delta: number) => void
}) {
  const [comments, setComments]       = useState<DoaComment[] | null>(null)
  const [loading, setLoading]         = useState(true)
  const [showAll, setShowAll]         = useState(false)
  const [commentText, setCommentText] = useState('')
  const [inputError, setInputError]   = useState<string | null>(null)
  const [isAnonymous]                 = useState(false)
  const [submitting, startSubmit]     = useTransition()
  const inputRef                      = useRef<HTMLInputElement>(null)

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

  const visibleComments = showAll ? (comments ?? []) : (comments ?? []).slice(-PREVIEW_COMMENTS)
  const hiddenCount     = (comments?.length ?? 0) - PREVIEW_COMMENTS

  return (
    <div className="border-t border-[--border] px-4 pt-3 pb-4">
      {loading ? (
        <div className="flex gap-2 py-1">
          {[80, 120].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-[--surface-overlay] animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {!showAll && hiddenCount > 0 && (
            <button
              key="load-more"
              onClick={() => setShowAll(true)}
              className="text-[11px] font-jakarta font-semibold text-[--primary] mb-3 block"
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

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[--surface-overlay] border border-[--border] flex items-center justify-center flex-shrink-0 text-[--text-disabled] font-jakarta text-xs select-none">
          •
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-[--surface-overlay] border border-[--border]">
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
            className="flex-1 bg-transparent outline-none text-[13px] font-jakarta text-[--text-primary] placeholder:text-[--text-disabled] min-w-0"
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
                className="flex-shrink-0 w-6 h-6 rounded-full bg-[--primary] flex items-center justify-center"
                aria-label="Hantar komen"
              >
                <Send size={10} color="#fff" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {inputError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] font-jakarta text-[--error] mt-1.5 pl-9"
          >
            {inputError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── DoaWishCard ───────────────────────────────────────────────────────── */

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
  const [hasAamined, setHasAamined]     = useState(wish.userHasAamined)
  const [aaminCount, setAaminCount]     = useState(wish.aaminCount)
  const [commentCount, setCommentCount] = useState(wish.commentCount)
  const [showComments, setShowComments] = useState(false)
  const [expanded, setExpanded]         = useState(false)
  const [isPending, startTransition]    = useTransition()

  const displayName = wish.isAnonymous ? 'Hamba Allah' : (wish.authorName ?? 'Jemaah')
  const initials    = displayName === 'Hamba Allah' ? '☽' : getInitials(displayName)
  const isLong      = wish.doaText.length > 200
  const cat         = DOA_CATEGORIES.find((c) => c.value === wish.category)

  function handleAamiin() {
    if (isPending) return
    const nextState = !hasAamined
    const delta     = nextState ? 1 : -1

    setHasAamined(nextState)
    setAaminCount((c) => c + delta)
    onAaminUpdate(wish.id, delta, nextState)

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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32, delay: index * 0.05 }}
      className="bg-[--surface-raised] rounded-2xl overflow-hidden shadow-[--shadow-sm]"
      style={{
        border: '1px solid var(--border)',
        ...(hasAamined ? { borderLeftWidth: 3, borderLeftColor: 'var(--gold)' } : {}),
      }}
    >
      <div className="p-5">
        {/* ── Author row ──────────────────────────────── */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-jakarta font-semibold ${
              wish.isAnonymous
                ? 'bg-[--surface-overlay] text-[--text-secondary] border border-[--border]'
                : 'bg-[--primary-muted] text-[--primary]'
            }`}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-jakarta font-semibold text-[--text-primary] leading-tight truncate">
                {displayName}
              </p>
              <span className="text-[11px] font-jakarta text-[--text-disabled] tabular-nums flex-shrink-0 mt-px">
                {formatTimeAgo(wish.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {wish.mosqueName && (
                <span className="text-[11px] font-jakarta text-[--text-secondary]">
                  {wish.mosqueName.split(' ').slice(0, 3).join(' ')}
                </span>
              )}
              {cat && (
                <span className="inline-flex items-center gap-1 text-[10px] font-jakarta font-semibold px-2 py-0.5 rounded-full bg-[--primary-muted] text-[--primary]">
                  {cat.icon} {cat.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Doa text ───────────────────────────────── */}
        <div className="pl-12 mb-4">
          <p
            className={`text-[15px] font-jakarta text-[--text-primary] leading-[1.8] ${
              !expanded && isLong ? 'line-clamp-4' : ''
            }`}
          >
            {wish.doaText}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] font-jakarta font-semibold text-[--primary] mt-1.5 block"
            >
              {expanded ? 'Tutup ▲' : 'Baca selengkapnya ▼'}
            </button>
          )}
        </div>

        {/* ── Action bar ─────────────────────────────── */}
        <div className="flex items-center gap-2 pl-12 pt-3 border-t border-[--border]">
          <motion.button
            onClick={handleAamiin}
            disabled={isPending}
            whileTap={{ scale: 0.92 }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-jakarta font-semibold transition-colors ${
              hasAamined
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-[--surface] text-[--text-secondary] border border-[--border]'
            }`}
            aria-label="Aamiin"
            aria-pressed={hasAamined}
          >
            <span className="text-[14px] leading-none">🤲</span>
            <span className="text-[13px] font-semibold leading-none">
              {aaminCount > 0 ? `${formatCount(aaminCount)} ` : ''}Aamiin
            </span>
          </motion.button>

          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-jakarta font-semibold border transition-colors ${
              showComments
                ? 'bg-[--surface-overlay] text-[--text-primary] border-[--border-strong]'
                : 'bg-[--surface-overlay] text-[--text-secondary] border-[--border]'
            }`}
          >
            <MessageCircle size={13} />
            <span>{commentCount > 0 ? formatCount(commentCount) : 'Komen'}</span>
          </button>
        </div>
      </div>

      {/* ── Comments panel ──────────────────────────── */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
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

/* ─── PostDoaFormContent (mobile sheet body) ────────────────────────────── */

function PostDoaFormContent({
  mosques,
  onSubmitted,
  onClose,
  showClose = false,
}: {
  mosques: FollowedMosque[]
  onSubmitted: (wish: DoaWishItem) => void
  onClose?: () => void
  showClose?: boolean
}) {
  const primaryMosque = mosques.find((m) => m.is_primary) ?? mosques[0] ?? null

  const [step, setStep]                         = useState<'category' | 'write'>('category')
  const [selectedCategory, setSelectedCategory] = useState<DoaCategory>('umum')
  const [text, setText]                         = useState('')
  const [isAnonymous, setIsAnonymous]           = useState(true)
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(primaryMosque?.id ?? null)
  const [error, setError]                       = useState<string | null>(null)
  const [isPending, startTransition]            = useTransition()

  const charsLeft     = MAX_CHARS - text.length
  const trimmedLength = text.trim().length
  const hasProfanity  = trimmedLength > 0 && containsProfanity(text)
  const canSubmit     = trimmedLength >= MIN_CHARS && !isPending && !hasProfanity

  const selectedCategoryObj = DOA_CATEGORIES.find((c) => c.value === selectedCategory)

  function reset() {
    setStep('category')
    setText('')
    setIsAnonymous(true)
    setSelectedMosqueId(primaryMosque?.id ?? null)
    setError(null)
  }

  function handleSubmit() {
    if (isPending) return
    if (trimmedLength < MIN_CHARS) {
      setError(`Tulis sekurang-kurangnya ${MIN_CHARS} huruf untuk menghantar doa.`)
      return
    }
    if (hasProfanity) {
      setError(PROFANITY_ERROR_MSG)
      return
    }
    setError(null)

    startTransition(async () => {
      const result = await postDoa({
        doaText: text,
        isAnonymous,
        mosqueId: selectedMosqueId,
        category: selectedCategory,
      })

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
        mosqueColor: mosque?.theme.primary ?? '#1E6B45',
        aaminCount: 0,
        userHasAamined: false,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        category: selectedCategory,
      })

      reset()
      onClose?.()
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[--border]">
        {step === 'write' ? (
          <button
            onClick={() => setStep('category')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[--surface-overlay] text-[--text-secondary] flex-shrink-0"
            aria-label="Kembali"
          >
            <ChevronLeft size={15} />
          </button>
        ) : (
          <div className="w-8 h-8 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-cormorant text-[20px] font-semibold text-[--text-primary] leading-tight">
            {step === 'category' ? 'Pilih Kategori' : 'Tulis Doa'}
          </h3>
          <p className="text-[11px] font-jakarta text-[--text-secondary] mt-0.5">
            {step === 'category'
              ? 'Pilih jenis doa anda'
              : 'Doa akan dikongsi kepada jemaah SAJDA'}
          </p>
        </div>

        {showClose && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[--surface-overlay] text-[--text-secondary] flex-shrink-0"
            aria-label="Tutup"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {step === 'category' ? (
          <div className="grid grid-cols-3 gap-2">
            {DOA_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value
              return (
                <motion.button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    setStep('write')
                  }}
                  whileTap={{ scale: 0.93 }}
                  className="flex flex-col items-center gap-2 py-3.5 rounded-xl transition-all"
                  style={active
                    ? { backgroundColor: 'rgba(30,107,69,0.12)', border: '1.5px solid rgba(30,107,69,0.25)' }
                    : { backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--border)' }
                  }
                >
                  <span className="text-[22px] leading-none">{cat.icon}</span>
                  <span className="text-[11px] font-jakarta font-semibold text-[--text-primary] text-center leading-tight px-1">
                    {cat.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <>
            {selectedCategoryObj && (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-jakarta font-semibold bg-[--primary-muted] text-[--primary] border border-[--primary]/20">
                  {selectedCategoryObj.icon} {selectedCategoryObj.label}
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-jakarta font-semibold uppercase tracking-widest text-[--text-disabled] mb-2">
                Doa anda
              </label>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value.slice(0, MAX_CHARS)); setError(null) }}
                placeholder="Tuliskan doa anda dengan penuh ikhlas..."
                rows={5}
                className="w-full resize-none rounded-xl px-4 py-3.5 text-[14px] font-jakarta text-[--text-primary] placeholder:text-[--text-disabled] bg-[--surface-input] outline-none leading-relaxed transition-all"
                style={{ border: `1.5px solid ${hasProfanity ? 'var(--error)' : 'var(--border)'}` }}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <div className="flex justify-between items-center mt-1.5 px-1">
                {hasProfanity ? (
                  <p className="text-[11px] font-jakarta text-[--error]">{PROFANITY_ERROR_MSG}</p>
                ) : error ? (
                  <p className="text-[11px] font-jakarta text-[--error]">{error}</p>
                ) : trimmedLength > 0 && trimmedLength < MIN_CHARS ? (
                  <p className="text-[11px] font-jakarta text-[--warning]">
                    Minimum {MIN_CHARS} huruf ({MIN_CHARS - trimmedLength} lagi)
                  </p>
                ) : (
                  <span />
                )}
                <p
                  className="text-[11px] font-jakarta font-medium tabular-nums ml-auto"
                  style={{ color: charsLeft < 30 ? 'var(--warning)' : 'var(--text-disabled)' }}
                >
                  {text.length}/{MAX_CHARS}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[--surface-overlay] border border-[--border]">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-[14px] font-jakarta font-medium text-[--text-primary]">
                  Tunjuk nama saya
                </p>
                <p className="text-[11px] font-jakarta text-[--text-secondary] mt-0.5">
                  {isAnonymous ? 'Dipapar sebagai "Hamba Allah"' : 'Nama anda akan kelihatan'}
                </p>
              </div>
              <button
                onClick={() => setIsAnonymous((v) => !v)}
                className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
                style={{ background: !isAnonymous ? 'var(--primary)' : 'var(--border-strong)' }}
                aria-checked={!isAnonymous}
                role="switch"
              >
                <motion.div
                  animate={{ x: !isAnonymous ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.20)' }}
                />
              </button>
            </div>

            {mosques.length > 0 && (
              <div>
                <p className="text-[10px] font-jakarta font-semibold uppercase tracking-widest text-[--text-disabled] mb-2 px-1">
                  Masjid
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedMosqueId(null)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-jakarta font-semibold transition-all ${
                      selectedMosqueId === null
                        ? 'bg-[--primary] text-white'
                        : 'bg-[--surface-overlay] text-[--text-secondary] border border-[--border]'
                    }`}
                  >
                    Tiada
                  </button>
                  {mosques.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMosqueId(m.id)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-jakarta font-semibold transition-all ${
                        selectedMosqueId === m.id
                          ? 'text-white'
                          : 'bg-[--surface-overlay] text-[--text-secondary] border border-[--border]'
                      }`}
                      style={selectedMosqueId === m.id ? { background: m.theme.primary } : {}}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={isPending}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl text-[14px] font-jakarta font-semibold transition-all"
              style={canSubmit
                ? { backgroundColor: '#B8860B', color: '#FFFFFF', boxShadow: '0 2px 12px rgba(184,134,11,0.25)' }
                : { backgroundColor: 'var(--surface-overlay)', color: 'var(--text-disabled)' }
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
                'Hantar Doa 🤲'
              )}
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── DesktopDoaPanel ───────────────────────────────────────────────────── */

function DesktopDoaPanel({
  mosques,
  wishes,
  onSubmitted,
}: {
  mosques: FollowedMosque[]
  wishes: DoaWishItem[]
  onSubmitted: (wish: DoaWishItem) => void
}) {
  const primaryMosque = mosques.find((m) => m.is_primary) ?? mosques[0] ?? null

  const [selectedCategory, setSelectedCategory] = useState<DoaCategory>('umum')
  const [text, setText]                         = useState('')
  const [isAnonymous, setIsAnonymous]           = useState(true)
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(primaryMosque?.id ?? null)
  const [error, setError]                       = useState<string | null>(null)
  const [isPending, startTransition]            = useTransition()

  const charsLeft     = MAX_CHARS - text.length
  const trimmedLength = text.trim().length
  const hasProfanity  = trimmedLength > 0 && containsProfanity(text)
  const canSubmit     = trimmedLength >= MIN_CHARS && !isPending && !hasProfanity

  const topDoa = [...wishes]
    .sort((a, b) => b.aaminCount - a.aaminCount)
    .slice(0, 3)
    .filter((w) => w.aaminCount > 0)

  function handleSubmit() {
    if (isPending) return
    if (trimmedLength < MIN_CHARS) {
      setError(`Tulis sekurang-kurangnya ${MIN_CHARS} huruf untuk menghantar doa.`)
      return
    }
    if (hasProfanity) {
      setError(PROFANITY_ERROR_MSG)
      return
    }
    setError(null)

    startTransition(async () => {
      const result = await postDoa({
        doaText: text,
        isAnonymous,
        mosqueId: selectedMosqueId,
        category: selectedCategory,
      })

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
        mosqueColor: mosque?.theme.primary ?? '#1E6B45',
        aaminCount: 0,
        userHasAamined: false,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        category: selectedCategory,
      })

      setText('')
      setIsAnonymous(true)
      setSelectedMosqueId(primaryMosque?.id ?? null)
      setError(null)
    })
  }

  return (
    <div className="sticky top-8 bg-[--surface-raised] border border-[--border] rounded-2xl p-5 flex flex-col gap-4 shadow-[--shadow-sm]">

      {/* Heading */}
      <h3 className="font-cormorant text-[22px] font-semibold text-[--text-primary] leading-tight">
        Tulis Doa
      </h3>

      {/* Category grid — 3×3, no emoji */}
      <div>
        <p className="text-[10px] font-jakarta font-semibold uppercase tracking-widest text-[--text-disabled] mb-2">
          Kategori
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {DOA_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className="py-1.5 px-1 rounded-lg text-[11px] font-jakarta font-semibold text-center transition-all"
                style={active
                  ? { backgroundColor: 'rgba(30,107,69,0.12)', color: '#1E6B45', border: '1.5px solid rgba(30,107,69,0.25)' }
                  : { backgroundColor: 'var(--surface-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                }
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value.slice(0, MAX_CHARS)); setError(null) }}
          placeholder="Tuliskan doa anda..."
          className="w-full resize-none rounded-xl p-3 text-[14px] font-jakarta text-[--text-primary] placeholder:text-[--text-disabled] bg-[--surface-input] outline-none leading-relaxed transition-all"
          style={{
            minHeight: 120,
            border: `1.5px solid ${hasProfanity ? 'var(--error)' : 'var(--border)'}`,
          }}
        />
        <div className="flex items-center justify-between mt-1 px-0.5">
          {hasProfanity ? (
            <p className="text-[11px] font-jakarta text-[--error]">{PROFANITY_ERROR_MSG}</p>
          ) : error ? (
            <p className="text-[11px] font-jakarta text-[--error]">{error}</p>
          ) : trimmedLength > 0 && trimmedLength < MIN_CHARS ? (
            <p className="text-[11px] font-jakarta text-[--warning]">
              Minimum {MIN_CHARS} huruf
            </p>
          ) : (
            <span />
          )}
          <p
            className="text-[11px] font-jakarta font-medium tabular-nums ml-auto"
            style={{ color: charsLeft < 30 ? 'var(--warning)' : 'var(--text-disabled)' }}
          >
            {text.length}/{MAX_CHARS}
          </p>
        </div>
      </div>

      {/* Anonymous toggle */}
      <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[--surface-overlay] border border-[--border]">
        <p className="text-[13px] font-jakarta font-medium text-[--text-primary]">
          {isAnonymous ? '"Hamba Allah"' : 'Nama saya dipapar'}
        </p>
        <button
          onClick={() => setIsAnonymous((v) => !v)}
          className="relative w-10 h-5 rounded-full flex-shrink-0 transition-colors"
          style={{ background: !isAnonymous ? 'var(--primary)' : 'var(--border-strong)' }}
          aria-checked={!isAnonymous}
          role="switch"
        >
          <motion.div
            animate={{ x: !isAnonymous ? 18 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.20)' }}
          />
        </button>
      </div>

      {/* Submit — gold */}
      <motion.button
        onClick={handleSubmit}
        disabled={isPending}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-2xl text-[14px] font-jakarta font-semibold transition-all"
        style={canSubmit
          ? { backgroundColor: '#B8860B', color: '#FFFFFF', boxShadow: '0 2px 12px rgba(184,134,11,0.25)' }
          : { backgroundColor: 'var(--surface-overlay)', color: 'var(--text-disabled)' }
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
          'Hantar Doa 🤲'
        )}
      </motion.button>

      {/* Doa Terpilih */}
      {topDoa.length > 0 && (
        <>
          <div className="border-t border-[--border]" />

          <div>
            <p className="font-cormorant text-[17px] font-semibold text-[--text-primary] mb-3">
              Doa Terpilih
            </p>
            <div className="flex flex-col gap-2">
              {topDoa.map((w) => (
                <div
                  key={w.id}
                  className="flex items-start gap-2 py-2 px-3 rounded-xl bg-[--surface-overlay]"
                >
                  <p className="flex-1 text-[12px] font-jakarta text-[--text-secondary] leading-relaxed line-clamp-2 min-w-0">
                    {w.doaText}
                  </p>
                  <span className="text-[11px] font-jakarta font-semibold flex-shrink-0 tabular-nums" style={{ color: 'var(--gold)' }}>
                    🤲 {formatCount(w.aaminCount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── PostDoaSheet (mobile) ─────────────────────────────────────────────── */

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
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[55] rounded-t-3xl safe-bottom overflow-hidden md:hidden"
            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 -4px 32px rgba(0,0,0,0.15)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[--border-strong]" />
            </div>
            <PostDoaFormContent
              mosques={mosques}
              onSubmitted={onSubmitted}
              onClose={onClose}
              showClose
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Empty State ───────────────────────────────────────────────────────── */

function EmptyDoa({ onWrite }: { onWrite: () => void }) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[--surface-overlay] border border-[--border] flex items-center justify-center mb-5">
        <span className="font-amiri text-[26px] text-[--text-arabic]" dir="rtl">آمين</span>
      </div>
      <p className="font-cormorant text-[22px] font-semibold text-[--text-primary] mb-2">
        Tiada doa lagi
      </p>
      <p className="text-[13px] font-jakarta text-[--text-secondary] mb-7 max-w-[220px] leading-relaxed">
        Jadilah yang pertama berkongsi doa anda kepada jemaah.
      </p>
      <motion.button
        onClick={onWrite}
        whileTap={{ scale: 0.94 }}
        className="px-6 py-3 rounded-3xl text-[14px] font-jakarta font-semibold bg-[--primary] text-white"
      >
        Tulis Doa Pertama
      </motion.button>
    </motion.div>
  )
}

/* ─── Animation variants ────────────────────────────────────────────────── */

const feedContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

/* ─── DoaContent ────────────────────────────────────────────────────────── */

export function DoaContent({ mosques, wishes: initialWishes }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<DoaCategory | 'semua'>('semua')
  const [wishes, setWishes]                     = useState<DoaWishItem[]>(initialWishes)
  const [showPostSheet, setShowPostSheet]       = useState(false)

  const visibleWishes =
    selectedCategory === 'semua'
      ? wishes
      : wishes.filter((w) => w.category === selectedCategory)

  const totalAamiin = wishes.reduce((sum, w) => sum + w.aaminCount, 0)

  function handleAaminUpdate(id: string, delta: number, newState: boolean) {
    setWishes((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, aaminCount: w.aaminCount + delta, userHasAamined: newState } : w
      )
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
    <div className="min-h-screen bg-[--surface] md:flex md:gap-8 md:px-8 md:py-8 md:items-start md:max-w-5xl md:mx-auto">

      {/* ── Left: feed column ───────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Section 1 — Page Header */}
        <div className="px-4 pt-6 pb-2 md:px-0 md:pt-0">
          <h1 className="font-cormorant text-[32px] font-bold text-[--text-primary] leading-none">
            Doa Bersama
          </h1>
          <p
            className="font-amiri text-[16px] text-[--text-arabic] leading-loose mt-0.5"
            dir="rtl"
          >
            دُعاء الجماعة
          </p>
          <p className="text-[12px] font-jakarta text-[--text-secondary] mt-2 tabular-nums">
            {wishes.length} doa · {formatCount(totalAamiin)} aamiin
          </p>
        </div>

        {/* Section 2 — Category Filter (text-only, no emoji) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 py-3 md:mx-0 md:px-0 md:flex-wrap">
          {(['semua', ...DOA_CATEGORIES.map((c) => c.value)] as const).map((val) => {
            const label = val === 'semua' ? 'Semua' : DOA_CATEGORIES.find((c) => c.value === val)!.label
            const active = selectedCategory === val
            return (
              <button
                key={val}
                onClick={() => setSelectedCategory(val as DoaCategory | 'semua')}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-jakarta font-semibold whitespace-nowrap transition-all"
                style={active
                  ? { backgroundColor: 'rgba(30,107,69,0.12)', color: '#1E6B45', border: '1.5px solid rgba(30,107,69,0.25)' }
                  : { backgroundColor: '#FFFFFF', color: '#6B6B6B', border: '1px solid rgba(0,0,0,0.10)' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Section 3 — Feed */}
        <div className="px-4 pb-36 md:px-0 md:pb-8">
          <AnimatePresence mode="popLayout">
            {visibleWishes.length === 0 ? (
              <EmptyDoa onWrite={() => setShowPostSheet(true)} />
            ) : (
              <motion.div
                key="feed"
                variants={feedContainer}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {visibleWishes.map((wish, i) => (
                  <DoaWishCard
                    key={wish.id}
                    wish={wish}
                    index={i}
                    onAaminUpdate={handleAaminUpdate}
                    onCommentCountChange={handleCommentCountChange}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {visibleWishes.length > 0 && (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="h-px flex-1 max-w-[60px] bg-[--border]" />
              <span className="text-[11px] font-jakarta text-[--text-disabled] tracking-wide">
                Itu sahaja buat masa ini
              </span>
              <div className="h-px flex-1 max-w-[60px] bg-[--border]" />
            </div>
          )}
        </div>
      </div>

      {/* ── Right: desktop panel ─────────────────────── */}
      <div className="hidden md:block w-[300px] flex-shrink-0">
        <DesktopDoaPanel
          mosques={mosques}
          wishes={wishes}
          onSubmitted={handleNewWish}
        />
      </div>

      {/* ── Mobile FAB — centered gold pill ─────────── */}
      <motion.button
        onClick={() => setShowPostSheet(true)}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-jakarta md:hidden"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom))',
          backgroundColor: '#C9A84C',
          color: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(184,134,11,0.35), 0 2px 8px rgba(0,0,0,0.12)',
        }}
        aria-label="Tulis doa baru"
      >
        <span className="text-base leading-none">🤲</span>
        <span className="text-[14px] font-semibold leading-none">Tulis Doa</span>
      </motion.button>

      {/* ── Mobile bottom sheet ──────────────────────── */}
      <PostDoaSheet
        open={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        mosques={mosques}
        onSubmitted={handleNewWish}
      />
    </div>
  )
}
