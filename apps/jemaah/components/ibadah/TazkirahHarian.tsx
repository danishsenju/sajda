'use client'

import { motion } from 'framer-motion'
import type { TazkirahItem } from '@/app/actions/tazkirah'

/* ─── TazkirahHarian ─────────────────────────────────────────────────────── */

export function TazkirahHarian({ data }: { data: TazkirahItem | null }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--surface-2)' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Tazkirah hari ini tidak dapat dimuatkan</p>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Sila semak sambungan internet dan cuba semula.</p>
      </div>
    )
  }

  const accentColor = data.color ?? '#102937'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-4 pt-4 pb-10 md:px-0 flex flex-col gap-4"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: accentColor, boxShadow: `0 8px 28px ${accentColor}40` }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full mb-3 inline-block"
          style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.80)' }}
        >
          {data.category}
        </span>
        <h2
          className="text-xl font-bold"
          style={{ color: '#fff', fontFamily: 'var(--font-playfair)' }}
        >
          {data.title}
        </h2>
        {data.hadis_ref && (
          <p className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {data.hadis_ref}
          </p>
        )}
      </div>

      {/* ── Arabic text (if any) ─────────────────────────────────────── */}
      {data.arabic_text && (
        <div
          className="px-5 py-4 rounded-xl"
          style={{ background: 'var(--surface-2)', borderLeft: `3px solid ${accentColor}` }}
        >
          <p
            className="text-right leading-loose"
            style={{
              color: 'var(--text)',
              fontFamily: 'var(--font-amiri)',
              fontSize: 20,
              direction: 'rtl',
              lineHeight: 2,
            }}
          >
            {data.arabic_text}
          </p>
          {data.arabic_ref && (
            <p className="text-[11px] mt-2 text-right" style={{ color: 'var(--text-dim)' }}>
              — {data.arabic_ref}
            </p>
          )}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text)', lineHeight: 1.9 }}
        >
          {data.content_malay}
        </p>
      </div>

      {/* ── Muhasabah ───────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: `${accentColor}0f`, border: `1px solid ${accentColor}25` }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: accentColor }}
        >
          Muhasabah Diri
        </p>
        <p className="text-sm font-medium" style={{ color: 'var(--text)', fontStyle: 'italic' }}>
          {data.muhasabah}
        </p>
      </div>
    </motion.div>
  )
}
