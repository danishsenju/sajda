'use client'

import { motion } from 'framer-motion'
import type { DailyHadis } from '@/app/actions/hadis'

/* ─── Helper ─────────────────────────────────────────────────────────────── */

async function shareHadis(hadis: DailyHadis) {
  const text = `${hadis.arabic_text}\n\n${hadis.malay_text}\n\n— ${hadis.source}`
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
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Sila cuba sebentar lagi.</p>
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
      {/* ── Header card with Arabic ── */}
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
              {data.theme}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No. {data.number}
          </span>
        </div>

        {/* Arabic text */}
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
      </div>

      {/* ── Source ── */}
      <div className="mx-4 mt-2 md:mx-0">
        <p className="text-[11px] text-center" style={{ color: 'var(--text-dim)' }}>
          {data.source}
        </p>
      </div>

      {/* ── Malay translation ── */}
      <div
        className="mx-4 mt-3 rounded-2xl p-5 md:mx-0"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
          Terjemahan
        </p>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: 'var(--text)', lineHeight: 1.9 }}
        >
          {data.malay_text}
        </p>
      </div>

      {/* ── English translation ── */}
      <div
        className="mx-4 mt-3 rounded-2xl p-5 md:mx-0"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
          English
        </p>
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
          onClick={() => shareHadis(data)}
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
