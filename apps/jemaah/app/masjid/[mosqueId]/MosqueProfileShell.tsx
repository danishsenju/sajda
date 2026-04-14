'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/ui/BottomNav'

/* ─── Types (exported for page.tsx) ─────────────────────────────────────── */

export type MosqueProfile = {
  id: string
  name: string
  address: string
  phone: string
  website: string | null
  zone_code: string
  jemaah_count: number
  announcements_this_month: number
  is_following: boolean
  theme: { primary: string; accent: string; logo_url: string | null; banner_url: string | null }
}

export type Announcement = {
  id: string
  title: string
  body: string
  published_at: string
  category: 'Penting' | 'Am' | 'Aktiviti' | 'Kewangan'
}

export type DoaWish = {
  id: string
  doa_text: string
  is_anonymous: boolean
  display_name: string | null
  aamiin_count: number
  user_has_aamined: boolean
  created_at: string
}

export type JanaizEntry = {
  id: string
  arwah_name: string
  age: number | null
  date_passed: string
  solat_jenazah_time: string | null
  jenazah_location: string
  notes: string | null
}

export type Program = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  image_url: string | null
  category: string
}

export type JadualEntry = {
  id: string
  date: string          // YYYY-MM-DD
  prayer: string        // 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak' | 'jumaat'
  role: string          // 'imam' | 'bilal' | 'khatib'
  officer_name: string
  notes: string | null
}

type Tab = 'utama' | 'pengumuman' | 'doa' | 'janaiz' | 'program' | 'jadual'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.startsWith('#') ? hex.slice(1) : hex
  if (c.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ms-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'baru sahaja'
  if (m < 60) return `${m} min lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

/* ─── Category badge ─────────────────────────────────────────────────────── */

const CATEGORY_CONFIG = {
  Penting:  { color: '#d94f3d', bg: 'rgba(217,79,61,0.10)' },
  Am:       { color: '#094044', bg: 'rgba(9,64,68,0.08)' },
  Aktiviti: { color: '#2a9d6e', bg: 'rgba(42,157,110,0.10)' },
  Kewangan: { color: '#c68a00', bg: 'rgba(198,138,0,0.10)' },
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.Am
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {category}
    </span>
  )
}

/* ─── Mosque logo avatar ─────────────────────────────────────────────────── */

function MosqueLogo({
  mosque,
  size,
  className = '',
}: {
  mosque: MosqueProfile
  size: number
  className?: string
}) {
  if (mosque.theme.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mosque.theme.logo_url}
        alt={mosque.name}
        width={size}
        height={size}
        className={`rounded-xl object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  const initials = mosque.name
    .split(' ')
    .filter((w) => !['masjid', 'al', 'bin', 'binti'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: 'var(--page-accent)',
        fontSize: Math.floor(size * 0.34),
        letterSpacing: '0.05em',
      }}
    >
      {initials}
    </div>
  )
}

/* ─── Announcement card ──────────────────────────────────────────────────── */

function AnnouncementCard({
  ann,
  compact = false,
}: {
  ann: Announcement
  compact?: boolean
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        boxShadow: '0 2px 12px rgba(16,41,55,0.06), 0 0 0 1px rgba(16,41,55,0.05)',
      }}
    >
      {/* Category accent line */}
      <div className="h-[3px]" style={{ background: CATEGORY_CONFIG[ann.category]?.color ?? '#094044' }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CategoryBadge category={ann.category} />
          <span className="text-[11px] flex-shrink-0" style={{ color: '#6b8e92' }}>
            {formatTimeAgo(ann.published_at)}
          </span>
        </div>
        <h3
          className="text-[15px] font-semibold leading-snug mb-1.5"
          style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}
        >
          {ann.title}
        </h3>
        <p
          className={`text-sm leading-relaxed ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}
          style={{ color: '#094044' }}
        >
          {ann.body}
        </p>
        {!compact && (
          <p className="text-xs mt-2" style={{ color: '#6b8e92' }}>
            {formatDate(ann.published_at)}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Doa card ───────────────────────────────────────────────────────────── */

function DoaCard({
  doa,
  aaminCount,
  hasAamined,
  onAamiin,
  accent,
}: {
  doa: DoaWish
  aaminCount: number
  hasAamined: boolean
  onAamiin: () => void
  accent: string
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        boxShadow: '0 2px 12px rgba(16,41,55,0.06), 0 0 0 1px rgba(16,41,55,0.05)',
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
            style={{ background: doa.is_anonymous ? '#e1d9cf' : 'var(--page-primary)' }}
          >
            {doa.is_anonymous ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#6b8e92" />
                <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke="#6b8e92" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              (doa.display_name ?? 'HB').slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: '#091d26' }}>
              {doa.is_anonymous ? 'Hamba Allah' : doa.display_name}
            </p>
            <p className="text-[10px]" style={{ color: '#6b8e92' }}>{formatTimeAgo(doa.created_at)}</p>
          </div>
        </div>

        {/* Doa text */}
        <div
          className="px-4 py-3 rounded-xl mb-3"
          style={{
            background: '#f8f6f3',
            borderLeft: `3px solid var(--page-primary)`,
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#091d26', fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
          >
            &ldquo;{doa.doa_text}&rdquo;
          </p>
        </div>

        {/* Aamiin button */}
        <motion.button
          onClick={onAamiin}
          whileTap={{ scale: 0.88 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          style={{
            background: hasAamined ? accent : '#f0ece8',
            color: hasAamined ? '#ffffff' : '#094044',
            boxShadow: hasAamined ? `0 4px 14px ${hexToRgba(accent, 0.35)}` : 'none',
          }}
          aria-pressed={hasAamined}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 11V6a1 1 0 012 0v5M9 11V9a1 1 0 012 0v2M11 11V8a1 1 0 012 0v3M13 11V9a1 1 0 012 0v6c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3a1 1 0 012 0"
              stroke={hasAamined ? '#ffffff' : '#094044'}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Aamiin
          <span
            className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{
              background: hasAamined ? 'rgba(255,255,255,0.25)' : 'rgba(9,64,68,0.08)',
              color: hasAamined ? '#ffffff' : '#094044',
            }}
          >
            {formatCount(aaminCount)}
          </span>
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Janaiz card ────────────────────────────────────────────────────────── */

function JanaizCard({
  entry,
  isSolatDone,
  onToggleSolat,
  primary,
}: {
  entry: JanaizEntry
  isSolatDone: boolean
  onToggleSolat: () => void
  primary: string
}) {
  const daysSince = Math.floor(
    (Date.now() - new Date(entry.date_passed).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        boxShadow: '0 2px 12px rgba(16,41,55,0.06), 0 0 0 1px rgba(16,41,55,0.05)',
      }}
    >
      {/* Top solemn band */}
      <div className="h-[2px]" style={{ background: 'rgba(16,41,55,0.12)' }} />

      <div className="p-5">
        {/* Al-Fatihah header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-medium uppercase tracking-widest"
            style={{ color: '#6b8e92' }}
          >
            اَلْفَاتِحَة
          </span>
          <span
            className="text-[11px] px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(16,41,55,0.06)',
              color: '#6b8e92',
            }}
          >
            {daysSince === 0 ? 'Hari ini' : `${daysSince} hari lalu`}
          </span>
        </div>

        {/* Name */}
        <h3
          className="text-lg font-bold leading-snug mb-1"
          style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}
        >
          {entry.arwah_name}
        </h3>
        {entry.age && (
          <p className="text-sm mb-3" style={{ color: '#6b8e92' }}>
            {entry.age} tahun · {formatDate(entry.date_passed)}
          </p>
        )}

        {/* Solat jenazah info */}
        {entry.solat_jenazah_time && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl mb-3"
            style={{ background: '#f8f6f3' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
              <path d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z" fill="rgba(16,41,55,0.15)" stroke="var(--page-primary)" strokeWidth="1.5" />
              <path d="M5 22V19H19V22M3 19H21" stroke="var(--page-primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: '#091d26' }}>
                Solat Jenazah
              </p>
              <p className="text-xs" style={{ color: '#094044' }}>
                {formatDateTime(entry.solat_jenazah_time)}
              </p>
              <p className="text-xs" style={{ color: '#6b8e92' }}>
                {entry.jenazah_location}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#6b8e92', fontStyle: 'italic' }}>
            {entry.notes}
          </p>
        )}

        {/* Solat jenazah toggle */}
        <motion.button
          onClick={onToggleSolat}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all justify-center"
          style={{
            background: isSolatDone ? hexToRgba(primary, 0.10) : '#f0ece8',
            color: isSolatDone ? primary : '#094044',
            border: `1px solid ${isSolatDone ? hexToRgba(primary, 0.25) : 'transparent'}`,
          }}
        >
          {isSolatDone ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Telah solat jenazah
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Saya telah solat jenazah
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Hantar Doa bottom sheet ────────────────────────────────────────────── */

function HantarDoaSheet({
  open,
  onClose,
  accent,
}: {
  open: boolean
  onClose: () => void
  accent: string
}) {
  const [text, setText] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (text.trim().length < 10) return
    // TODO: Supabase insert
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setText('')
      onClose()
    }, 1800)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55]"
            style={{ background: 'rgba(9,29,38,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl safe-bottom"
            style={{ background: '#ffffff', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e1d9cf' }} />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(16,41,55,0.08)' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}>
                Hantar Doa
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#6b8e92' }}>
                Doa anda akan dikongsi bersama jemaah masjid ini.
              </p>
            </div>

            {/* Form */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: hexToRgba(accent, 0.12) }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}>
                    Doa dihantar
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#6b8e92' }}>
                    Semoga Allah memakbulkan doa anda. Aamiin.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-medium" style={{ color: '#094044' }}>
                    Tulis doa anda
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ya Allah, permudahkanlah..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed outline-none resize-none transition-colors"
                    style={{
                      background: '#f8f6f3',
                      border: '1px solid rgba(16,41,55,0.10)',
                      color: '#091d26',
                      fontFamily: 'var(--font-playfair)',
                      fontStyle: text ? 'italic' : 'normal',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = hexToRgba(accent, 0.40))}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(16,41,55,0.10)')}
                  />
                  <p className="text-[11px] text-right" style={{ color: '#6b8e92' }}>
                    {text.length}/500
                  </p>
                </div>

                {/* Anonymous toggle */}
                <button
                  type="button"
                  onClick={() => setIsAnon((v) => !v)}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl transition-colors"
                  style={{
                    background: isAnon ? hexToRgba(accent, 0.08) : '#f8f6f3',
                    border: `1px solid ${isAnon ? hexToRgba(accent, 0.25) : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                    style={{ background: isAnon ? accent : 'rgba(16,41,55,0.10)' }}
                  >
                    {isAnon && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: '#091d26' }}>Hantar sebagai Hamba Allah</p>
                    <p className="text-[11px]" style={{ color: '#6b8e92' }}>Nama anda tidak akan dipaparkan</p>
                  </div>
                </button>

                <button
                  type="submit"
                  disabled={text.trim().length < 10}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
                  style={{
                    background: accent,
                    color: '#ffffff',
                    boxShadow: `0 4px 20px ${hexToRgba(accent, 0.30)}`,
                  }}
                >
                  Hantar Doa
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Tab panels ─────────────────────────────────────────────────────────── */

function UtamaPanel({
  announcements,
  doaWishes,
  aaminCounts,
  aaminStates,
  onAamiin,
  accent,
  mosque,
}: {
  announcements: Announcement[]
  doaWishes: DoaWish[]
  aaminCounts: Record<string, number>
  aaminStates: Record<string, boolean>
  onAamiin: (id: string) => void
  accent: string
  mosque: MosqueProfile
}) {
  return (
    <div className="flex flex-col gap-6 py-4 px-4 md:px-0">
      {/* Latest announcements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}>
            Pengumuman Terkini
          </h3>
          <button className="text-xs font-medium" style={{ color: accent }}>
            Lihat semua →
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {announcements.slice(0, 3).map((ann) => (
            <AnnouncementCard key={ann.id} ann={ann} compact />
          ))}
        </div>
      </section>

      {/* Active doa */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}>
            Doa Komuniti
          </h3>
          <button className="text-xs font-medium" style={{ color: accent }}>
            Lihat semua →
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {doaWishes.slice(0, 2).map((doa) => (
            <DoaCard
              key={doa.id}
              doa={doa}
              aaminCount={aaminCounts[doa.id] ?? doa.aamiin_count}
              hasAamined={aaminStates[doa.id] ?? doa.user_has_aamined}
              onAamiin={() => onAamiin(doa.id)}
              accent={accent}
            />
          ))}
        </div>
      </section>

      {/* Mosque info */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}>
          Maklumat Masjid
        </h3>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#ffffff',
            boxShadow: '0 2px 12px rgba(16,41,55,0.06), 0 0 0 1px rgba(16,41,55,0.05)',
          }}
        >
          {[
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="var(--page-primary)" strokeWidth="1.8" />
                  <circle cx="12" cy="10" r="3" stroke="var(--page-primary)" strokeWidth="1.8" />
                </svg>
              ),
              label: 'Alamat',
              value: mosque.address,
            },
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12 19.79 19.79 0 01.14 3.37 2 2 0 012.12 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.56-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
              label: 'Telefon',
              value: mosque.phone,
            },
            ...(mosque.website ? [{
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="var(--page-primary)" strokeWidth="1.8" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
              label: 'Laman Web',
              value: mosque.website,
            }] : []),
            {
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z" fill="rgba(16,41,55,0.10)" stroke="var(--page-primary)" strokeWidth="1.5" />
                  <path d="M5 22V19H19V22" stroke="var(--page-primary)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
              label: 'Zon Waktu Solat',
              value: mosque.zone_code,
            },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              className="flex items-start gap-3 px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(16,41,55,0.06)' : 'none' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(16,41,55,0.06)' }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium mb-0.5" style={{ color: '#6b8e92' }}>{item.label}</p>
                <p className="text-sm leading-snug" style={{ color: '#091d26' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PengumumanPanel({ announcements }: { announcements: Announcement[] }) {
  const [filter, setFilter] = useState<string>('Semua')
  const categories = ['Semua', 'Penting', 'Aktiviti', 'Am', 'Kewangan']
  const filtered = filter === 'Semua' ? announcements : announcements.filter((a) => a.category === filter)

  return (
    <div className="py-4 px-4 md:px-0">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {categories.map((cat) => {
          const active = filter === cat
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? 'var(--page-primary)' : '#ffffff',
                color: active ? '#ffffff' : '#094044',
                border: `1px solid ${active ? 'var(--page-primary)' : 'rgba(16,41,55,0.12)'}`,
                boxShadow: active ? '0 2px 8px rgba(16,41,55,0.15)' : 'none',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Announcement list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            {filtered.map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AnnouncementCard ann={ann} />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: '#6b8e92' }}>Tiada pengumuman dalam kategori ini.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function DoaBersamaPanel({
  doaWishes,
  aaminCounts,
  aaminStates,
  onAamiin,
  accent,
  onHantarDoa,
}: {
  doaWishes: DoaWish[]
  aaminCounts: Record<string, number>
  aaminStates: Record<string, boolean>
  onAamiin: (id: string) => void
  accent: string
  onHantarDoa: () => void
}) {
  return (
    <div className="py-4 px-4 md:px-0">
      <div className="flex flex-col gap-3 pb-24">
        {doaWishes.map((doa, i) => (
          <motion.div
            key={doa.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <DoaCard
              doa={doa}
              aaminCount={aaminCounts[doa.id] ?? doa.aamiin_count}
              hasAamined={aaminStates[doa.id] ?? doa.user_has_aamined}
              onAamiin={() => onAamiin(doa.id)}
              accent={accent}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating action button */}
      <motion.button
        onClick={onHantarDoa}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-lg font-semibold text-sm"
        style={{
          background: accent,
          color: '#ffffff',
          boxShadow: `0 6px 24px ${hexToRgba(accent, 0.40)}`,
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Hantar Doa</span>
        <span className="sm:hidden">Doa</span>
      </motion.button>
    </div>
  )
}

function JanaizPanel({
  janaizList,
  solatDone,
  onToggleSolat,
  primary,
}: {
  janaizList: JanaizEntry[]
  solatDone: Set<string>
  onToggleSolat: (id: string) => void
  primary: string
}) {
  return (
    <div className="py-4 px-4 md:px-0">
      {/* Respectful note */}
      <div
        className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
        style={{ background: 'rgba(16,41,55,0.05)', border: '1px solid rgba(16,41,55,0.08)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="9" stroke="#094044" strokeWidth="1.8" />
          <path d="M12 8v4" stroke="#094044" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="#094044" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: '#094044' }}>
          Semoga Allah mencucuri rahmat ke atas roh-roh mereka dan ditempatkan di kalangan orang-orang yang soleh. Al-Fatihah.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {janaizList.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <JanaizCard
              entry={entry}
              isSolatDone={solatDone.has(entry.id)}
              onToggleSolat={() => onToggleSolat(entry.id)}
              primary={primary}
            />
          </motion.div>
        ))}

        {janaizList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#6b8e92' }}>Tiada rekod janaiz buat masa ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Program panel ──────────────────────────────────────────────────────── */

const PROGRAM_CATS: Record<string, { color: string; light: string }> = {
  Ceramah:   { color: '#1B3A5C', light: 'rgba(27,58,92,0.08)'  },
  Kursus:    { color: '#8b5cf6', light: 'rgba(139,92,246,0.08)' },
  Aktiviti:  { color: '#10b981', light: 'rgba(16,185,129,0.08)' },
  Majlis:    { color: '#c68a00', light: 'rgba(198,138,0,0.08)'  },
  Tazkirah:  { color: '#2a9d6e', light: 'rgba(42,157,110,0.08)' },
  'Lain-lain': { color: '#6b7280', light: 'rgba(107,114,128,0.08)' },
}

function ProgramCard({ prog }: { prog: Program }) {
  const cfg = PROGRAM_CATS[prog.category] ?? PROGRAM_CATS['Lain-lain']!
  const eventDate = new Date(prog.event_date)
  const dayNum  = eventDate.toLocaleDateString('ms-MY', { day: '2-digit' })
  const month   = eventDate.toLocaleDateString('ms-MY', { month: 'short' })
  const dayName = eventDate.toLocaleDateString('ms-MY', { weekday: 'short' })

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        boxShadow: '0 2px 12px rgba(16,41,55,0.06), 0 0 0 1px rgba(16,41,55,0.05)',
      }}
    >
      {/* Image or colored header */}
      {prog.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={prog.image_url}
          alt={prog.title}
          className="w-full object-cover"
          style={{ height: 160 }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center relative overflow-hidden"
          style={{ height: 100, background: cfg.color }}
        >
          {/* Geometric pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id={`prog-${prog.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L40 20L20 40L0 20Z" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#prog-${prog.id})`} />
          </svg>
          {/* Date badge */}
          <div className="relative z-10 text-center">
            <p className="text-4xl font-bold text-white leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>
              {dayNum}
            </p>
            <p className="text-sm font-medium text-white/80 uppercase tracking-wider mt-0.5">{month}</p>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Category + date row */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ background: cfg.light, color: cfg.color }}
          >
            {prog.category}
          </span>
          <span className="text-xs" style={{ color: '#6b8e92' }}>
            {dayName}, {dayNum} {month}
            {prog.event_time && ` · ${prog.event_time}`}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-[15px] font-semibold leading-snug mb-1.5"
          style={{ color: '#091d26', fontFamily: 'var(--font-playfair)' }}
        >
          {prog.title}
        </h3>

        {/* Description */}
        {prog.description && (
          <p
            className="text-sm line-clamp-2 leading-relaxed mb-2"
            style={{ color: '#094044' }}
          >
            {prog.description}
          </p>
        )}

        {/* Location */}
        {prog.location && (
          <div className="flex items-center gap-1.5 mt-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="#6b8e92" strokeWidth="1.8" />
              <circle cx="12" cy="10" r="3" stroke="#6b8e92" strokeWidth="1.8" />
            </svg>
            <span className="text-xs" style={{ color: '#6b8e92' }}>{prog.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgramPanel({ programs }: { programs: Program[] }) {
  const [filter, setFilter] = useState<'semua' | 'akan' | 'lalu'>('akan')
  const now = Date.now()

  const filtered = programs.filter((p) => {
    const t = new Date(p.event_date).getTime()
    if (filter === 'akan')  return t >= now - 86400000 // include today
    if (filter === 'lalu')  return t < now - 86400000
    return true
  })

  return (
    <div className="py-4 px-4 md:px-0">
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'akan' as const, label: 'Akan Datang' },
          { key: 'semua' as const, label: 'Semua'        },
          { key: 'lalu' as const, label: 'Lepas'         },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filter === key ? 'var(--page-primary)' : '#ffffff',
              color:      filter === key ? '#ffffff' : '#094044',
              border: `1px solid ${filter === key ? 'var(--page-primary)' : 'rgba(16,41,55,0.12)'}`,
              boxShadow: filter === key ? '0 2px 8px rgba(16,41,55,0.15)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#6b8e92' }}>
              {filter === 'akan' ? 'Tiada program akan datang.' : 'Tiada program dalam tempoh ini.'}
            </p>
          </div>
        ) : (
          filtered.map((prog, i) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ProgramCard prog={prog} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

/* ─── Jadual panel ───────────────────────────────────────────────────────── */

const PRAYERS = [
  { key: 'subuh',   label: 'Subuh',   icon: '🌙' },
  { key: 'zohor',   label: 'Zohor',   icon: '☀️' },
  { key: 'asar',    label: 'Asar',    icon: '🌤' },
  { key: 'maghrib', label: 'Maghrib', icon: '🌅' },
  { key: 'isyak',   label: 'Isyak',   icon: '🌃' },
  { key: 'jumaat',  label: 'Jumaat',  icon: '🕌' },
]

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  imam:   { label: 'Imam',   color: '#1B3A5C', bg: 'rgba(27,58,92,0.10)'   },
  bilal:  { label: 'Bilal',  color: '#c68a00', bg: 'rgba(198,138,0,0.10)'  },
  khatib: { label: 'Khatib', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
}

function JadualPanel({ jadualList }: { jadualList: JadualEntry[] }) {
  // Generate 7 days starting from today
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  const [selDay, setSelDay] = useState(0)
  const selectedDate = days[selDay]!
  const selectedKey  = selectedDate.toISOString().slice(0, 10)
  const isFriday     = selectedDate.getDay() === 5

  const dayEntries = jadualList.filter((e) => e.date === selectedKey)

  function getSlot(prayer: string, role: string) {
    return dayEntries.find((e) => e.prayer === prayer && e.role === role) ?? null
  }

  const visiblePrayers = isFriday
    ? PRAYERS
    : PRAYERS.filter((p) => p.key !== 'jumaat')

  return (
    <div className="py-4 px-4 md:px-0">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
        {days.map((d, i) => {
          const active = selDay === i
          const dayName = i === 0 ? 'Hari Ini'
            : d.toLocaleDateString('ms-MY', { weekday: 'short' })
          const dateNum = d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })

          return (
            <button
              key={i}
              onClick={() => setSelDay(i)}
              className="flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: active ? 'var(--page-primary)' : '#ffffff',
                border: `1.5px solid ${active ? 'var(--page-primary)' : 'rgba(16,41,55,0.10)'}`,
                boxShadow: active ? '0 3px 12px rgba(16,41,55,0.20)' : 'none',
              }}
            >
              <span
                className="text-[9px] font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: active ? 'rgba(255,255,255,0.70)' : '#6b8e92' }}
              >
                {dayName}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: active ? '#ffffff' : '#091d26' }}
              >
                {dateNum}
              </span>
            </button>
          )
        })}
      </div>

      {/* Prayer slots */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 2px 12px rgba(16,41,55,0.06), 0 0 0 1px rgba(16,41,55,0.05)',
        }}
      >
        {visiblePrayers.map((prayer, i, arr) => {
          const slots = dayEntries.filter((e) => e.prayer === prayer.key)
          const hasSlots = slots.length > 0

          return (
            <div
              key={prayer.key}
              className="px-4 py-3.5"
              style={{
                borderBottom: i < arr.length - 1 ? '1px solid rgba(16,41,55,0.06)' : 'none',
                background: hasSlots ? '#fff' : 'rgba(16,41,55,0.01)',
              }}
            >
              {/* Prayer header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{prayer.icon}</span>
                <span className="text-sm font-bold" style={{ color: '#091d26' }}>
                  {prayer.label}
                </span>
                {prayer.key === 'jumaat' && (
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                    style={{ background: 'rgba(139,92,246,0.10)', color: '#8b5cf6' }}
                  >
                    Khutbah
                  </span>
                )}
              </div>

              {/* Officers */}
              {hasSlots ? (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const rm = ROLE_META[slot.role] ?? ROLE_META['imam']!
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: rm.bg }}
                      >
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide"
                          style={{ color: rm.color }}
                        >
                          {rm.label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: '#091d26' }}>
                          {slot.officer_name}
                        </span>
                        {slot.notes && (
                          <span className="text-[10px]" style={{ color: '#6b8e92' }}>
                            · {slot.notes}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs" style={{ color: '#b0c4c7' }}>Belum ditetapkan</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Note */}
      <p className="text-[11px] text-center mt-4" style={{ color: '#6b8e92' }}>
        Jadual diurus oleh AJK masjid. Tertakluk kepada perubahan.
      </p>
    </div>
  )
}

/* ─── Main shell ─────────────────────────────────────────────────────────── */

type Props = {
  mosque: MosqueProfile
  announcements: Announcement[]
  doaWishes: DoaWish[]
  janaizList: JanaizEntry[]
  programs: Program[]
  jadualList: JadualEntry[]
}

export function MosqueProfileShell({ mosque, announcements, doaWishes, janaizList, programs, jadualList }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('utama')
  const [isFollowing, setIsFollowing] = useState(mosque.is_following)
  const [jemaahCount, setJemaahCount] = useState(mosque.jemaah_count)
  const [isPending, startTransition] = useTransition()
  const [doaSheetOpen, setDoaSheetOpen] = useState(false)
  const [solatDone, setSolatDone] = useState<Set<string>>(new Set())
  const tabsRef = useRef<HTMLDivElement>(null)

  // Doa aamiin state
  const [aaminStates, setAaminStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(doaWishes.map((d) => [d.id, d.user_has_aamined]))
  )
  const [aaminCounts, setAaminCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(doaWishes.map((d) => [d.id, d.aamiin_count]))
  )

  const { primary, accent } = mosque.theme
  const pagePrimary = primary || '#102937'
  const pageAccent = accent || '#f9744b'

  const themeVars = {
    '--page-primary': pagePrimary,
    '--page-accent': pageAccent,
    '--page-primary-10': hexToRgba(pagePrimary, 0.10),
    '--page-primary-20': hexToRgba(pagePrimary, 0.20),
    '--page-accent-10': hexToRgba(pageAccent, 0.10),
  } as React.CSSProperties

  function handleFollow() {
    startTransition(() => {
      setIsFollowing((prev) => {
        const next = !prev
        setJemaahCount((c) => c + (next ? 1 : -1))
        // TODO: Supabase upsert / delete on jemaah_follows
        return next
      })
    })
  }

  function handleAamiin(id: string) {
    const current = aaminStates[id] ?? false
    setAaminStates((prev) => ({ ...prev, [id]: !current }))
    setAaminCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + (current ? -1 : 1) }))
    // TODO: toggleAamiin server action
  }

  function handleToggleSolat(id: string) {
    setSolatDone((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'utama',      label: 'Utama'       },
    { key: 'pengumuman', label: 'Pengumuman'  },
    { key: 'program',    label: 'Program'     },
    { key: 'jadual',     label: 'Jadual'      },
    { key: 'doa',        label: 'Doa Bersama' },
    { key: 'janaiz',     label: 'Janaiz'      },
  ]

  return (
    <div style={themeVars} className="min-h-screen">
      <div className="md:max-w-[900px] md:mx-auto" style={{ background: '#ededed', minHeight: '100vh' }}>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="relative h-64 md:h-80 overflow-hidden" style={{ background: pagePrimary }}>
          {/* Geometric pattern overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id={`geo-${mosque.id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="white" strokeWidth="0.8" />
                <circle cx="30" cy="30" r="3" fill="white" opacity="0.6" />
                <circle cx="0" cy="0" r="2" fill="white" opacity="0.35" />
                <circle cx="60" cy="0" r="2" fill="white" opacity="0.35" />
                <circle cx="0" cy="60" r="2" fill="white" opacity="0.35" />
                <circle cx="60" cy="60" r="2" fill="white" opacity="0.35" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#geo-${mosque.id})`} />
          </svg>

          {/* Depth gradient */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.35) 100%)' }}
          />

          {/* Top controls */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 safe-top">
            {/* Back */}
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              aria-label="Kembali"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Follow button */}
            <motion.button
              onClick={handleFollow}
              disabled={isPending}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: isFollowing ? 'rgba(255,255,255,0.90)' : pageAccent,
                color: isFollowing ? pagePrimary : '#ffffff',
                boxShadow: isFollowing ? 'none' : `0 4px 16px ${hexToRgba(pageAccent, 0.45)}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {isFollowing ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Mengikuti
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Ikuti
                </>
              )}
            </motion.button>
          </div>

          {/* Bottom info overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-10"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
          >
            <div className="flex items-end gap-3">
              <MosqueLogo mosque={mosque} size={56} className="shadow-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h1
                  className="text-xl font-bold text-white leading-snug"
                  style={{ fontFamily: 'var(--font-playfair)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                >
                  {mosque.name}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                    <circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                  </svg>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {mosque.address.split(',').slice(-2).join(',').trim()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
        <div
          className="flex items-stretch"
          style={{ background: '#ffffff', borderBottom: '1px solid rgba(16,41,55,0.08)' }}
        >
          {[
            {
              value: formatCount(jemaahCount),
              label: 'Jemaah',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="7" r="3" stroke="var(--page-primary)" strokeWidth="1.8" />
                  <circle cx="17" cy="9" r="2.5" stroke="var(--page-primary)" strokeWidth="1.8" />
                  <path d="M3 20C3 17.24 5.69 15 9 15s6 2.24 6 5" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M19 20c0-1.86-.93-3.5-2.5-4.5" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              value: String(mosque.announcements_this_month),
              label: 'Pengumuman',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              value: mosque.zone_code,
              label: 'Zon Solat',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="var(--page-primary)" strokeWidth="1.8" />
                  <path d="M12 7V12L15 14" stroke="var(--page-primary)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5"
              style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(16,41,55,0.08)' : 'none' }}
            >
              <div className="flex items-center gap-1.5">
                {stat.icon}
                <span className="text-sm font-bold" style={{ color: '#091d26' }}>
                  {stat.value}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: '#6b8e92' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tab navigation ────────────────────────────────────────── */}
        <div
          ref={tabsRef}
          className="sticky top-0 z-20 flex overflow-x-auto"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid rgba(16,41,55,0.08)',
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-shrink-0 px-5 py-3.5 text-sm font-medium relative transition-colors"
                style={{ color: active ? pagePrimary : '#6b8e92' }}
              >
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full"
                    style={{ background: pagePrimary }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Tab content ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'utama' && (
              <UtamaPanel
                announcements={announcements}
                doaWishes={doaWishes}
                aaminCounts={aaminCounts}
                aaminStates={aaminStates}
                onAamiin={handleAamiin}
                accent={pageAccent}
                mosque={mosque}
              />
            )}
            {activeTab === 'pengumuman' && (
              <PengumumanPanel announcements={announcements} />
            )}
            {activeTab === 'doa' && (
              <DoaBersamaPanel
                doaWishes={doaWishes}
                aaminCounts={aaminCounts}
                aaminStates={aaminStates}
                onAamiin={handleAamiin}
                accent={pageAccent}
                onHantarDoa={() => setDoaSheetOpen(true)}
              />
            )}
            {activeTab === 'program' && (
              <ProgramPanel programs={programs} />
            )}
            {activeTab === 'jadual' && (
              <JadualPanel jadualList={jadualList} />
            )}
            {activeTab === 'janaiz' && (
              <JanaizPanel
                janaizList={janaizList}
                solatDone={solatDone}
                onToggleSolat={handleToggleSolat}
                primary={pagePrimary}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom nav (mobile only) ───────────────────────────────── */}
        <BottomNav />

        {/* ── Hantar Doa sheet ───────────────────────────────────────── */}
        <HantarDoaSheet
          open={doaSheetOpen}
          onClose={() => setDoaSheetOpen(false)}
          accent={pageAccent}
        />
      </div>
    </div>
  )
}
