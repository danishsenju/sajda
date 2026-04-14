'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toggleAamiin, postDoa } from '@/app/actions/doa'
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
  if (minutes < 60) return `${minutes} min lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'semalam'
  if (days < 7) return `${days} hari lalu`
  return new Date(iso).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })
}

/* ─── DoaWishCard ────────────────────────────────────────────────────────── */

function DoaWishCard({
  wish,
  index,
  onAaminUpdate,
}: {
  wish: DoaWishItem
  index: number
  onAaminUpdate: (id: string, delta: number, newState: boolean) => void
}) {
  const [hasAamined, setHasAamined] = useState(wish.userHasAamined)
  const [aaminCount, setAaminCount] = useState(wish.aaminCount)
  const [burst, setBurst] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const displayName = wish.isAnonymous
    ? 'Hamba Allah'
    : (wish.authorName ?? 'Jemaah')

  const initials = displayName === 'Hamba Allah'
    ? '?'
    : displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

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
        // revert
        setHasAamined(!nextState)
        setAaminCount((c) => c - delta)
        onAaminUpdate(wish.id, -delta, !nextState)
      }
    })
  }

  const isLong = wish.doaText.length > 180

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden card-shadow"
      style={{ background: 'var(--surface-2)' }}
    >
      <div className="p-4">

        {/* ── Header row ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
            style={{
              background: wish.isAnonymous ? 'var(--surface-3)' : wish.mosqueColor,
              color: wish.isAnonymous ? 'var(--text-dim)' : '#fff',
              fontSize: 13,
            }}
          >
            {wish.isAnonymous ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="var(--text-dim)" />
                <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : initials}
          </div>

          {/* Name + time */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold leading-none truncate" style={{ color: 'var(--text)' }}>
              {displayName}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {formatTimeAgo(wish.createdAt)}
            </p>
          </div>

          {/* Mosque badge */}
          {wish.mosqueName && (
            <span
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0"
              style={{
                background: `${wish.mosqueColor}18`,
                color: wish.mosqueColor,
                border: `1px solid ${wish.mosqueColor}30`,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z" fill="currentColor" />
                <path d="M5 22V18H19V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              {wish.mosqueName.split(' ').slice(0, 2).join(' ')}
            </span>
          )}
        </div>

        {/* ── Doa text block ────────────────────────────────────────── */}
        <button
          onClick={() => isLong && setExpanded((v) => !v)}
          className="w-full text-left mb-3"
          aria-expanded={expanded}
        >
          <div
            className="px-4 py-3 rounded-xl"
            style={{
              background: 'var(--surface-3)',
              borderLeft: '3px solid var(--primary-soft)',
            }}
          >
            <p
              className={`text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}
              style={{
                color: 'var(--text)',
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
              }}
            >
              &ldquo;{wish.doaText}&rdquo;
            </p>
            {isLong && (
              <p
                className="text-[11px] font-medium mt-1.5"
                style={{ color: 'var(--accent)' }}
              >
                {expanded ? 'Tutup' : 'Baca selengkapnya'}
              </p>
            )}
          </div>
        </button>

        {/* ── Aamiin button ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <div className="relative">
            {/* Burst ring */}
            <AnimatePresence>
              {burst && (
                <motion.div
                  key="ring"
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  exit={{}}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{ background: 'rgba(249,116,75,0.35)' }}
                />
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleAamiin}
              disabled={isPending}
              whileTap={{ scale: 0.86 }}
              animate={burst ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors relative z-[1]"
              style={{
                background: hasAamined ? 'var(--accent)' : 'var(--surface-3)',
                color: hasAamined ? '#fff' : 'var(--text-muted)',
                boxShadow: hasAamined ? '0 4px 14px rgba(249,116,75,0.35)' : 'none',
              }}
              aria-label="Aamiin"
              aria-pressed={hasAamined}
            >
              {/* Open hands / dua SVG */}
              <motion.svg
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                animate={burst ? { rotate: [-8, 8, 0] } : { rotate: 0 }}
                transition={{ duration: 0.35 }}
              >
                <path
                  d="M9 11V6a1 1 0 012 0v5M9 11V9a1 1 0 012 0v2M11 11V8a1 1 0 012 0v3M13 11V9a1 1 0 012 0v6c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3a1 1 0 012 0"
                  stroke={hasAamined ? '#fff' : 'var(--text-muted)'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
              Aamiin

              {aaminCount > 0 && (
                <motion.span
                  key={aaminCount}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    background: hasAamined ? 'rgba(255,255,255,0.22)' : 'rgba(16,41,55,0.08)',
                    color: hasAamined ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {aaminCount >= 1000
                    ? `${(aaminCount / 1000).toFixed(1).replace('.0', '')}k`
                    : aaminCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
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

  const charsLeft = MAX_CHARS - text.length
  const canSubmit = text.trim().length > 0 && !isPending

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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[50]"
            style={{ background: 'rgba(9,29,38,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[55] rounded-t-3xl safe-bottom overflow-hidden md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-2xl"
            style={{ background: 'var(--surface-2)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
            </div>

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}
                >
                  Tulis Doa
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                  Doa anda akan dikongsi kepada semua jemaah SAJDA
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: 'var(--surface-3)' }}
                aria-label="Tutup"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col gap-4">

              {/* Text area */}
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Tuliskan doa anda..."
                  rows={5}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: 'var(--surface-3)',
                    color: 'var(--text)',
                    border: '1.5px solid var(--border)',
                    fontFamily: 'var(--font-lexend)',
                    lineHeight: '1.65',
                  }}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
                <div className="flex justify-between items-center mt-1.5 px-1">
                  {error ? (
                    <p className="text-[11px]" style={{ color: 'var(--error)' }}>{error}</p>
                  ) : (
                    <span />
                  )}
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: charsLeft < 30 ? 'var(--warning)' : 'var(--text-dim)' }}
                  >
                    {text.length}/{MAX_CHARS}
                  </p>
                </div>
              </div>

              {/* Anonymous toggle */}
              <div
                className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ background: 'var(--surface-3)' }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Tunjuk nama saya
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {isAnonymous ? 'Dipapar sebagai "Hamba Allah"' : 'Nama anda akan kelihatan'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAnonymous((v) => !v)}
                  className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors"
                  style={{ background: !isAnonymous ? 'var(--accent)' : 'var(--border-strong)' }}
                  aria-checked={!isAnonymous}
                  role="switch"
                >
                  <motion.div
                    animate={{ x: !isAnonymous ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full"
                    style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>

              {/* Mosque selector */}
              {mosques.length > 0 && (
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    Masjid
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedMosqueId(null)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: selectedMosqueId === null ? 'var(--primary)' : 'var(--surface-3)',
                        color: selectedMosqueId === null ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      Tiada
                    </button>
                    {mosques.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMosqueId(m.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: selectedMosqueId === m.id ? m.theme.primary : 'var(--surface-3)',
                          color: selectedMosqueId === m.id ? '#fff' : 'var(--text-muted)',
                        }}
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
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: canSubmit ? 'var(--accent)' : 'var(--surface-3)',
                  color: canSubmit ? '#fff' : 'var(--text-dim)',
                  boxShadow: canSubmit ? '0 4px 16px rgba(249,116,75,0.30)' : 'none',
                }}
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
      prev.map((w) =>
        w.id === id
          ? { ...w, aaminCount: w.aaminCount + delta, userHasAamined: newState }
          : w
      )
    )
  }

  function handleNewWish(wish: DoaWishItem) {
    setWishes((prev) => [wish, ...prev])
    setShowPostSheet(false)
  }

  return (
    <div className="relative">

      {/* ── Page intro ──────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-2 md:px-0">
        <h1
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}
        >
          Doa Bersama
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Kongsi doa anda — semua jemaah SAJDA akan mengaminkan.
        </p>
      </div>

      {/* ── Mosque filter pills ─────────────────────────────────────── */}
      {mosques.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto md:px-0 md:pb-4" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedMosqueId(null)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: selectedMosqueId === null ? 'var(--primary)' : 'var(--surface-2)',
              color: selectedMosqueId === null ? '#fff' : 'var(--text-muted)',
              boxShadow: selectedMosqueId === null ? '0 2px 8px rgba(16,41,55,0.20)' : 'none',
            }}
          >
            Semua
          </button>
          {mosques.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMosqueId(m.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background: selectedMosqueId === m.id ? m.theme.primary : 'var(--surface-2)',
                color: selectedMosqueId === m.id ? '#fff' : 'var(--text-muted)',
                boxShadow: selectedMosqueId === m.id ? `0 2px 10px ${m.theme.primary}40` : 'none',
              }}
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
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--surface-2)', boxShadow: '0 2px 8px rgba(16,41,55,0.06)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11V6a1 1 0 012 0v5M9 11V9a1 1 0 012 0v2M11 11V8a1 1 0 012 0v3M13 11V9a1 1 0 012 0v6c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3a1 1 0 012 0"
                    stroke="var(--text-dim)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                Tiada doa lagi
              </p>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                Jadilah yang pertama berkongsi doa anda.
              </p>
              <button
                onClick={() => setShowPostSheet(true)}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Tulis Doa
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 md:items-start">
              {visibleWishes.map((wish, i) => (
                <DoaWishCard
                  key={wish.id}
                  wish={wish}
                  index={i}
                  onAaminUpdate={handleAaminUpdate}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {visibleWishes.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="h-px w-12" style={{ background: 'var(--border-strong)' }} />
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Itu sahaja buat masa ini</span>
            <div className="h-px w-12" style={{ background: 'var(--border-strong)' }} />
          </div>
        )}
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setShowPostSheet(true)}
        whileTap={{ scale: 0.90 }}
        whileHover={{ scale: 1.06 }}
        className="fixed bottom-[88px] right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center md:bottom-8"
        style={{
          background: 'var(--accent)',
          boxShadow: '0 6px 20px rgba(249,116,75,0.45)',
        }}
        aria-label="Tulis doa baru"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.button>

      {/* ── Post Doa Sheet ───────────────────────────────────────────── */}
      <PostDoaSheet
        open={showPostSheet}
        onClose={() => setShowPostSheet(false)}
        mosques={mosques}
        onSubmitted={handleNewWish}
      />
    </div>
  )
}
