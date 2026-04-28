'use client'

import { motion } from 'framer-motion'
import type { DailyHadis } from '@/app/actions/hadis'

/* ─── Helper ─────────────────────────────────────────────────────────────── */

async function shareHadis(english: string, source: string) {
  const text = `${english}\n\n— ${source}`
  if (navigator.share) {
    await navigator.share({ title: 'Hadis Harian · SAJDA', text }).catch(() => {})
  } else {
    await navigator.clipboard.writeText(text).catch(() => {})
  }
}

/* ─── HadisHarian ────────────────────────────────────────────────────────── */

export function HadisHarian({ data }: { data: DailyHadis | null }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Hadis hari ini tidak dapat dimuatkan</p>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Sila semak sambungan internet dan cuba semula.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-10"
    >
      {/* ── Header: source + hadith number ── */}
      <div
        className="mx-4 mt-4 rounded-2xl overflow-hidden md:mx-0"
        style={{ background: 'var(--primary)', boxShadow: '0 6px 28px rgba(16,41,55,0.18)' }}
      >
        <div
          className="flex items-center justify-between px-5 pt-4 pb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Hadis Harian
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.60)' }}
            >
              {data.source}
            </span>
          </div>
          {data.hadith_number && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No. {data.hadith_number}
            </span>
          )}
        </div>

        {/* Arabic text (if available) */}
        {data.arabic_text ? (
          <div className="px-5 py-6">
            <p
              className="text-right leading-loose"
              style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: 22,
                direction: 'rtl',
                color: '#fff',
                lineHeight: 2.2,
              }}
            >
              {data.arabic_text.trim()}
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <path
                d="M20 6C17.24 6 15 8.24 15 11C15 13.76 17.24 16 20 16C20.74 16 21.44 15.83 22.07 15.54C21.01 17.6 18.85 19 16.36 19C12.83 19 10 16.17 10 12.64C10 9.11 12.83 6.28 16.36 6.28C17.62 6.28 18.79 6.65 19.78 7.28C19.85 6.85 19.92 6.43 20 6Z"
                fill="rgba(255,255,255,0.18)"
              />
              <circle cx="26" cy="7" r="1.4" fill="rgba(255,255,255,0.22)" />
              <circle cx="8"  cy="10" r="0.9" fill="rgba(255,255,255,0.14)" />
            </svg>
          </div>
        )}
      </div>

      {/* ── English translation ── */}
      <div
        className="mx-4 mt-3 rounded-2xl p-5 md:mx-0"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <p
          className="text-[15px] leading-relaxed"
          style={{
            color: 'var(--text)',
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            lineHeight: 1.9,
          }}
        >
          &ldquo;{data.english_text}&rdquo;
        </p>
      </div>

      {/* ── Malay translation placeholder ── */}
      <div
        className="mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3 md:mx-0"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(249,116,75,0.10)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="var(--accent)" strokeWidth="1.8" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Terjemahan Bahasa Melayu</p>
          <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            Akan diambil dari jadual <code className="font-mono">hadis_malay</code> Supabase — segera hadir
          </p>
        </div>
      </div>

      {/* ── Muhasabah ── */}
      <div
        className="mx-4 mt-3 rounded-2xl px-5 py-4 md:mx-0"
        style={{ background: 'rgba(249,116,75,0.07)', border: '1px solid rgba(249,116,75,0.18)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>
          Muhasabah
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)', fontStyle: 'italic' }}>
          Bagaimanakah hadis ini boleh aku hayati dan amalkan dalam tindakanku hari ini?
        </p>
      </div>

      {/* ── Share ── */}
      <div className="flex justify-center mt-6">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => shareHadis(data.english_text, data.source)}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
          style={{ background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Kongsi Hadis
        </motion.button>
      </div>
    </motion.div>
  )
}
