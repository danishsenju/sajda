'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
      className="flex flex-col items-center justify-center px-8 py-12 text-center"
    >
      {/* Illustration card */}
      <div
        className="w-full max-w-xs rounded-3xl p-8 mb-8 relative overflow-hidden"
        style={{ background: 'var(--surface-2)', boxShadow: '0 4px 24px rgba(16,41,55,0.08)' }}
      >
        {/* Decorative teal blob */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.07]"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-[0.05]"
          style={{ background: 'var(--primary-soft)' }}
        />

        <svg
          width="110"
          height="110"
          viewBox="0 0 120 120"
          fill="none"
          className="mx-auto relative z-10"
        >
          {/* Ground line */}
          <path d="M12 96H108" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Minaret left */}
          <rect x="20" y="58" width="10" height="30" rx="5" fill="var(--primary)" opacity="0.15"/>
          <rect x="21" y="58" width="8" height="30" rx="4" fill="var(--primary)" opacity="0.25"/>
          <path d="M20 58C20 53 30 53 30 58" fill="var(--primary)" opacity="0.35"/>
          <circle cx="25" cy="51" r="2" fill="var(--accent)" opacity="0.6"/>

          {/* Minaret right */}
          <rect x="90" y="58" width="10" height="30" rx="5" fill="var(--primary)" opacity="0.15"/>
          <rect x="91" y="58" width="8" height="30" rx="4" fill="var(--primary)" opacity="0.25"/>
          <path d="M90 58C90 53 100 53 100 58" fill="var(--primary)" opacity="0.35"/>
          <circle cx="95" cy="51" r="2" fill="var(--accent)" opacity="0.6"/>

          {/* Main dome */}
          <path
            d="M60 14C60 14 33 38 33 58C33 73.46 45.54 86 61 86C76.46 86 88 73.46 88 58C88 38 60 14 60 14Z"
            fill="var(--primary)"
            opacity="0.12"
          />
          <path
            d="M60 18C60 18 36 40 36 58C36 72 47 83 61 83C75 83 85 72 85 58C85 40 60 18 60 18Z"
            fill="var(--primary)"
            opacity="0.20"
          />
          <path
            d="M60 22C60 22 39 43 39 58C39 71 49 80 61 80C73 80 82 71 82 58C82 43 60 22 60 22Z"
            fill="var(--primary)"
            opacity="0.30"
          />

          {/* Windows on dome */}
          <path d="M52 62C52 59.24 54.24 57 57 57H64C66.76 57 69 59.24 69 62V80H52V62Z" fill="var(--primary)" opacity="0.15"/>
          <rect x="52" y="57" width="17" height="2" rx="1" fill="var(--primary)" opacity="0.20"/>

          {/* Crescent + star on dome top */}
          <g transform="translate(60, 22)">
            <path
              d="M0 -9C-2.76 -9 -5 -6.76 -5 -4C-5 -1.24 -2.76 1 0 1C0.74 1 1.44 0.83 2.07 0.54C1.01 2.6 -1.15 4 -3.64 4C-7.17 4 -10 1.17 -10 -2.36C-10 -5.89 -7.17 -8.72 -3.64 -8.72C-2.38 -8.72 -1.21 -8.35 -0.22 -7.72C-0.15 -8.15 -0.08 -8.57 0 -9Z"
              fill="var(--accent)"
            />
            <circle cx="4.5" cy="-7" r="1.2" fill="var(--accent)" opacity="0.7"/>
          </g>

          {/* Decorative stars */}
          <circle cx="16" cy="32" r="1.5" fill="var(--accent)" opacity="0.35"/>
          <circle cx="104" cy="28" r="1" fill="var(--accent)" opacity="0.30"/>
          <circle cx="96" cy="46" r="1.5" fill="var(--accent)" opacity="0.25"/>
          <circle cx="24" cy="48" r="1" fill="var(--accent)" opacity="0.30"/>
        </svg>
      </div>

      {/* Text */}
      <h2
        className="text-2xl font-bold mb-3"
        style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}
      >
        Sambungkan Diri Anda
      </h2>
      <p className="text-sm leading-relaxed mb-8 max-w-[260px]" style={{ color: 'var(--text-muted)' }}>
        Ikuti masjid berdekatan untuk menerima pengumuman, doa bersama, dan aktiviti komuniti anda.
      </p>

      {/* Primary CTA */}
      <Link
        href="/masjid"
        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold transition-all active:scale-95 glow-accent"
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Cari Masjid Berdekatan
      </Link>

      {/* Divider */}
      <div className="mt-8 flex items-center gap-3 w-full max-w-[220px]">
        <div className="flex-1 h-px" style={{ background: 'var(--border-strong)' }} />
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>atau</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border-strong)' }} />
      </div>

      {/* Secondary */}
      <p className="mt-4 text-xs" style={{ color: 'var(--text-dim)' }}>
        Tiada masjid di kawasan anda?{' '}
        <Link href="/masjid/daftar" className="font-medium underline" style={{ color: 'var(--primary-soft)' }}>
          Daftarkan masjid anda
        </Link>
      </p>
    </motion.div>
  )
}
