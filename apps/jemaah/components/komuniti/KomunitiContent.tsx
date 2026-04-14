'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { postKeperluan, toggleBantu } from '@/app/actions/komuniti'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type Mosque = { id: string; name: string; theme_color?: string | null }

export type KRequest = {
  id: string
  author_name: string | null
  mosque_id: string | null
  mosque_name?: string | null
  mosque_color?: string | null
  category: string
  title: string
  description?: string | null
  status: string
  helpers_count: number
  created_at: string
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { key: 'semua',        label: 'Semua',         color: 'var(--primary)',  light: 'rgba(16,41,55,0.08)' },
  { key: 'pinjaman',     label: 'Pinjaman',       color: '#3b82f6',        light: '#eff6ff' },
  { key: 'pendidikan',   label: 'Pendidikan',     color: '#8b5cf6',        light: '#f5f3ff' },
  { key: 'perkhidmatan', label: 'Perkhidmatan',   color: '#10b981',        light: '#ecfdf5' },
  { key: 'jualbeli',     label: 'Jual / Beli',    color: '#f97316',        light: '#fff7ed' },
  { key: 'lainlain',     label: 'Lain-lain',      color: '#6b7280',        light: '#f9fafb' },
]

const STATUS_META: Record<string, { label: string; color: string }> = {
  mencari:  { label: 'Mencari',       color: '#f97316' },
  dibantu:  { label: 'Sedang Dibantu', color: '#3b82f6' },
  selesai:  { label: 'Selesai',        color: '#10b981' },
}

function getCat(key: string) {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1]!
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)  return 'baru sahaja'
  if (mins < 60) return `${mins} min lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/* ─── RequestCard ────────────────────────────────────────────────────────── */

function RequestCard({
  req,
  isBantu,
  onBantu,
}: {
  req: KRequest
  isBantu: boolean
  onBantu: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cat    = getCat(req.category)
  const status = STATUS_META[req.status] ?? STATUS_META['mencari']!

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      {/* Category accent bar */}
      <div className="h-1" style={{ background: cat.color }} />

      <div className="p-4">
        {/* Top: author + status + time */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: cat.light, color: cat.color }}
            >
              {initials(req.author_name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                {req.author_name ?? 'Tanpa Nama'}
              </p>
              {req.mosque_name && (
                <span
                  className="inline-block text-[9px] px-1.5 py-0.5 rounded-full font-medium mt-0.5"
                  style={{
                    background: (req.mosque_color ?? '#102937') + '22',
                    color: req.mosque_color ?? '#102937',
                  }}
                >
                  {req.mosque_name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: status.color + '18', color: status.color }}
            >
              {status.label}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {timeAgo(req.created_at)}
            </span>
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text)' }}>
          {req.title}
        </p>

        {/* Description */}
        {req.description && (
          <div className="mb-2">
            <p
              className="text-xs leading-relaxed"
              style={{
                color: 'var(--text-dim)',
                ...(expanded ? {} : {
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }),
              } as React.CSSProperties}
            >
              {req.description}
            </p>
            {req.description.length > 90 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-medium mt-1"
                style={{ color: 'var(--accent)' }}
              >
                {expanded ? 'Kurangkan' : 'Baca lagi'}
              </button>
            )}
          </div>
        )}

        {/* Footer: category + bantu */}
        <div className="flex items-center justify-between mt-3">
          <span
            className="text-[10px] px-2.5 py-1 rounded-full font-medium"
            style={{ background: cat.light, color: cat.color }}
          >
            {cat.label}
          </span>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBantu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: isBantu ? '#10b981' : 'var(--surface)',
              color: isBantu ? '#fff' : 'var(--text-dim)',
              border: `1.5px solid ${isBantu ? '#10b981' : 'var(--border)'}`,
              transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            }}
          >
            {/* Handshake icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 11L7 13C6.5 13.5 6.5 14.5 7 15L9 17M15 11L17 13C17.5 13.5 17.5 14.5 17 15L15 17M12 3C10.34 3 9 4.34 9 6V11H15V6C15 4.34 13.66 3 12 3Z"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M5 21H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {req.helpers_count > 0 && <span>{req.helpers_count}</span>}
            <span>{isBantu ? 'Membantu' : 'Saya Boleh Bantu'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── PostSheet ──────────────────────────────────────────────────────────── */

function PostSheet({
  mosques,
  onClose,
  onPost,
}: {
  mosques: Mosque[]
  onClose: () => void
  onPost: (req: KRequest) => void
}) {
  const [title, setTitle]           = useState('')
  const [description, setDesc]      = useState('')
  const [category, setCategory]     = useState('pinjaman')
  const [mosqueId, setMosqueId]     = useState(mosques[0]?.id ?? '')
  const [isAnonymous, setAnonymous] = useState(false)
  const [error, setError]           = useState('')
  const [pending, startTransition]  = useTransition()

  async function handleSubmit() {
    if (!title.trim()) { setError('Sila isi tajuk keperluan'); return }
    setError('')
    startTransition(async () => {
      const result = await postKeperluan({
        title: title.trim(),
        description: description.trim() || null,
        category,
        mosqueId: mosqueId || null,
        isAnonymous,
      })
      if ('error' in result) { setError(result.error ?? 'Ralat tidak diketahui'); return }
      const mosque = mosques.find(m => m.id === mosqueId)
      onPost({
        id: result.id,
        author_name: result.authorName,
        mosque_id: mosqueId || null,
        mosque_name: mosque?.name ?? null,
        mosque_color: mosque?.theme_color ?? null,
        category,
        title: title.trim(),
        description: description.trim() || null,
        status: 'mencari',
        helpers_count: 0,
        created_at: new Date().toISOString(),
      })
    })
  }

  const cats = CATEGORIES.filter(c => c.key !== 'semua')

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{ background: 'var(--surface)', boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', maxHeight: '92dvh', overflowY: 'auto' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <div className="px-5 pb-safe-bottom pb-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Kongsi Keperluan</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface-2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Category picker */}
          <p className="text-[10px] font-bold tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>KATEGORI</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {cats.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                style={{
                  background: category === c.key ? c.color : 'var(--surface-2)',
                  color:      category === c.key ? '#fff'   : 'var(--text-dim)',
                  border: `1.5px solid ${category === c.key ? c.color : 'var(--border)'}`,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <p className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>TAJUK KEPERLUAN</p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            placeholder="cth: Nak pinjam tangga / Cari cikgu tuition..."
            className="w-full text-sm px-4 py-3 rounded-xl outline-none mb-4"
            style={{
              background: 'var(--surface-2)',
              color:      'var(--text)',
              border:     '1.5px solid var(--border)',
            }}
          />
          <div className="flex justify-end mb-4 -mt-3">
            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{title.length}/100</span>
          </div>

          {/* Description */}
          <p className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>HURAIAN <span className="font-normal normal-case tracking-normal">(pilihan)</span></p>
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Butiran lanjut tentang keperluan anda..."
            className="w-full text-sm px-4 py-3 rounded-xl outline-none resize-none mb-1"
            style={{
              background: 'var(--surface-2)',
              color:      'var(--text)',
              border:     '1.5px solid var(--border)',
            }}
          />
          <div className="flex justify-end mb-4">
            <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{description.length}/300</span>
          </div>

          {/* Mosque picker */}
          {mosques.length > 0 && (
            <>
              <p className="text-[10px] font-bold tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>MASJID</p>
              <div className="flex flex-wrap gap-2 mb-5">
                <button
                  onClick={() => setMosqueId('')}
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{
                    background: !mosqueId ? 'var(--primary)' : 'var(--surface-2)',
                    color:      !mosqueId ? '#fff' : 'var(--text-dim)',
                  }}
                >
                  Semua
                </button>
                {mosques.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMosqueId(m.id)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{
                      background: mosqueId === m.id ? (m.theme_color ?? 'var(--primary)') : 'var(--surface-2)',
                      color:      mosqueId === m.id ? '#fff' : 'var(--text-dim)',
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between py-3 mb-5 border-t border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Tanpa nama</p>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Nama anda tidak akan dipaparkan</p>
            </div>
            <button
              onClick={() => setAnonymous(!isAnonymous)}
              className="relative w-12 h-6 rounded-full flex-shrink-0"
              style={{ background: isAnonymous ? 'var(--accent)' : 'var(--border-strong)' }}
            >
              <motion.div
                animate={{ x: isAnonymous ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </div>

          {error && (
            <p className="text-xs text-center mb-3 font-medium" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={pending || !title.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: pending || !title.trim() ? 'var(--border-strong)' : 'var(--primary)',
              color: '#fff',
              opacity: pending || !title.trim() ? 0.6 : 1,
            }}
          >
            {pending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 rounded-full"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
              />
            ) : 'Hantar Keperluan'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

/* ─── KomunitiContent ────────────────────────────────────────────────────── */

export function KomunitiContent({
  mosques,
  initialRequests,
  myHelpIds,
}: {
  mosques: Mosque[]
  initialRequests: KRequest[]
  myHelpIds: string[]
}) {
  const [requests, setRequests]       = useState(initialRequests)
  const [myHelps, setMyHelps]         = useState(() => new Set(myHelpIds))
  const [activeCategory, setCategory] = useState('semua')
  const [showSheet, setShowSheet]     = useState(false)

  const filtered = activeCategory === 'semua'
    ? requests
    : requests.filter(r => r.category === activeCategory)

  async function handleBantu(id: string) {
    const wasBantu = myHelps.has(id)

    // Optimistic
    setMyHelps(prev => {
      const next = new Set(prev)
      wasBantu ? next.delete(id) : next.add(id)
      return next
    })
    setRequests(prev =>
      prev.map(r => r.id === id
        ? { ...r, helpers_count: r.helpers_count + (wasBantu ? -1 : 1) }
        : r
      )
    )

    const result = await toggleBantu(id)
    if ('error' in result) {
      // Revert on error
      setMyHelps(prev => {
        const next = new Set(prev)
        wasBantu ? next.add(id) : next.delete(id)
        return next
      })
      setRequests(prev =>
        prev.map(r => r.id === id
          ? { ...r, helpers_count: r.helpers_count + (wasBantu ? 1 : -1) }
          : r
        )
      )
    }
  }

  return (
    <div className="pb-28">
      {/* ── Category filter ── */}
      <div
        className="sticky top-0 z-10 px-4 pt-3 pb-2 md:px-0"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(c => {
            const isActive = activeCategory === c.key
            const count    = c.key === 'semua' ? requests.length : requests.filter(r => r.category === c.key).length
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full font-semibold"
                style={{
                  background: isActive ? c.color : 'var(--surface-2)',
                  color:      isActive ? '#fff'   : 'var(--text-dim)',
                  border:     `1.5px solid ${isActive ? c.color : 'var(--border)'}`,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {c.label}
                {count > 0 && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--border)' }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Request list ── */}
      <div className="px-4 md:px-0 flex flex-col gap-3 mt-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 gap-3 text-center"
            >
              {/* Empty state illustration */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--surface-2)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 11C16 13.21 14.21 15 12 15C9.79 15 8 13.21 8 11V5.5C8 4.12 9.12 3 10.5 3H13.5C14.88 3 16 4.12 16 5.5V11Z"
                    stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round"
                  />
                  <path
                    d="M6 10C4.9 10 4 10.9 4 12V14C4 17.31 6.69 20 10 20H14C17.31 20 20 17.31 20 14V12C20 10.9 19.1 10 18 10"
                    stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round"
                  />
                  <path d="M12 20V23" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M9 23H15" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
                Tiada keperluan dalam kategori ini
              </p>
              <p className="text-xs px-8" style={{ color: 'var(--text-dim)' }}>
                Jadilah yang pertama berkongsi keperluan atau tawaran bantuan anda
              </p>
              <button
                onClick={() => setShowSheet(true)}
                className="mt-2 text-xs px-5 py-2.5 rounded-full font-semibold"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                + Tambah Keperluan
              </button>
            </motion.div>
          ) : (
            filtered.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                isBantu={myHelps.has(req.id)}
                onBantu={() => handleBantu(req.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── FAB ── */}
      {filtered.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowSheet(true)}
          className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: 'var(--primary)', boxShadow: '0 6px 24px rgba(16,41,55,0.35)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </motion.button>
      )}

      {/* ── Post sheet ── */}
      <AnimatePresence>
        {showSheet && (
          <PostSheet
            mosques={mosques}
            onClose={() => setShowSheet(false)}
            onPost={req => {
              setRequests(prev => [req, ...prev])
              setShowSheet(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
