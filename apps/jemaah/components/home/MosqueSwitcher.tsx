'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type FollowedMosque = {
  id: string
  name: string
  slug: string
  theme: { primary: string; accent: string; logo_url: string | null }
  is_primary: boolean
  jemaah_count: number
}

type Props = {
  mosques: FollowedMosque[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  /** 'header' = pill button on dark bg | 'sidebar' = full-width row with avatar */
  variant?: 'header' | 'sidebar'
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`
  return String(n)
}

function MosqueAvatar({
  mosque,
  size = 28,
}: {
  mosque?: FollowedMosque
  size?: number
}) {
  if (!mosque) {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size, background: 'var(--surface-3)' }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z" fill="var(--text-dim)" />
          <path d="M5 22V18H19V22" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (mosque.theme.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mosque.theme.logo_url}
        alt={mosque.name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{
        width: size,
        height: size,
        background: mosque.theme.primary || 'var(--primary)',
        fontSize: Math.floor(size * 0.36),
      }}
    >
      {mosque.name.slice(0, 2).toUpperCase()}
    </div>
  )
}

/* ─── List content (shared by bottom sheet + dropdown) ──────────────────── */

function MosqueListContent({
  mosques,
  selectedId,
  onSelect,
}: {
  mosques: FollowedMosque[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <>
      {/* All mosques */}
      <button
        onClick={() => onSelect(null)}
        className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left"
        style={{
          background: selectedId === null ? 'var(--accent-soft)' : 'transparent',
        }}
      >
        <MosqueAvatar size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: selectedId === null ? 'var(--accent)' : 'var(--text)' }}>
            Semua Masjid
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {mosques.length} masjid diikuti
          </p>
        </div>
        {selectedId === null && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <path d="M5 13L9 17L19 7" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Mosque list */}
      {mosques.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {mosques.map((mosque) => {
            const isSelected = selectedId === mosque.id
            return (
              <button
                key={mosque.id}
                onClick={() => onSelect(mosque.id)}
                className="flex items-center gap-3 w-full px-4 py-3 transition-colors text-left"
                style={{ background: isSelected ? 'var(--accent-soft)' : 'transparent' }}
              >
                <MosqueAvatar mosque={mosque} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}
                    >
                      {mosque.name}
                    </p>
                    {mosque.is_primary && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ background: 'rgba(249,116,75,0.12)', color: 'var(--accent)' }}
                      >
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    {formatCount(mosque.jemaah_count)} ahli
                  </p>
                </div>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M5 13L9 17L19 7" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Footer CTA */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="p-3">
        <Link
          href="/masjid"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: 'var(--accent)', color: '#ffffff' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Cari Masjid Baru
        </Link>
      </div>
    </>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function MosqueSwitcher({ mosques, selectedId, onSelect, variant = 'header' }: Props) {
  const [open, setOpen] = useState(false)

  const selected = mosques.find((m) => m.id === selectedId)

  function handleSelect(id: string | null) {
    onSelect(id)
    setOpen(false)
  }

  function close() {
    setOpen(false)
  }

  /* ── Trigger: 'header' variant (pill on dark bg) ──────────────────── */
  const headerTrigger = (
    <button
      onClick={() => setOpen((v) => !v)}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
      style={{
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.18)',
        minHeight: '36px',
      }}
      aria-expanded={open}
      aria-label="Tukar masjid"
    >
      {selected ? (
        <MosqueAvatar mosque={selected} size={18} />
      ) : (
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.4)' }} />
      )}
      <span className="text-[13px] font-medium max-w-[120px] truncate" style={{ color: 'rgba(255,255,255,0.90)' }}>
        {selected?.name ?? 'Semua Masjid'}
      </span>
      <motion.svg
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        width="12" height="12" viewBox="0 0 24 24" fill="none"
      >
        <path d="M6 9L12 15L18 9" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    </button>
  )

  /* ── Trigger: 'sidebar' variant (full-width row) ──────────────────── */
  const sidebarTrigger = (
    <button
      onClick={() => setOpen((v) => !v)}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
      }}
      aria-expanded={open}
      aria-label="Tukar masjid"
    >
      <MosqueAvatar mosque={selected} size={32} />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
          {selected?.name ?? 'Semua Masjid'}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {selected
            ? `${formatCount(selected.jemaah_count)} ahli`
            : `${mosques.length} masjid diikuti`}
        </p>
      </div>
      <motion.svg
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        className="flex-shrink-0"
      >
        <path d="M6 9L12 15L18 9" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    </button>
  )

  return (
    <div className="relative">
      {variant === 'header' ? headerTrigger : sidebarTrigger}

      <AnimatePresence>
        {open && (
          <>
            {/* ── Mobile dark backdrop ─────────────────────────────── */}
            <motion.div
              className="fixed inset-0 z-[55] md:hidden"
              style={{ background: 'rgba(9,29,38,0.45)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            {/* ── Desktop transparent backdrop ─────────────────────── */}
            <motion.div
              className="fixed inset-0 z-[55] hidden md:block"
              onClick={close}
            />

            {/* ── Mobile bottom sheet ───────────────────────────────── */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl md:hidden safe-bottom overflow-hidden"
              style={{ background: 'var(--surface-2)', maxHeight: '72vh', display: 'flex', flexDirection: 'column' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
              </div>
              {/* Title */}
              <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}>
                  Pilih Masjid
                </h3>
              </div>
              {/* List (scrollable) */}
              <div className="overflow-y-auto flex-1">
                <MosqueListContent mosques={mosques} selectedId={selectedId} onSelect={handleSelect} />
              </div>
            </motion.div>

            {/* ── Desktop dropdown ──────────────────────────────────── */}
            <motion.div
              className="absolute left-0 top-full mt-2 z-[60] w-72 rounded-2xl overflow-hidden hidden md:block"
              style={{
                background: 'var(--surface-2)',
                boxShadow: '0 8px 40px rgba(16,41,55,0.18), 0 0 0 1px rgba(16,41,55,0.08)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <MosqueListContent mosques={mosques} selectedId={selectedId} onSelect={handleSelect} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
