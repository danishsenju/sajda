'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Zikir presets ──────────────────────────────────────────────────────── */

const ZIKIR = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    label: 'SubhanAllah',
    meaning: 'Maha Suci Allah',
    target: 33,
    color: '#102937',
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلّٰهِ',
    label: 'Alhamdulillah',
    meaning: 'Segala Puji bagi Allah',
    target: 33,
    color: '#124d54',
  },
  {
    id: 'allahuakbar',
    arabic: 'اللّٰهُ أَكْبَرُ',
    label: 'AllahuAkbar',
    meaning: 'Allah Maha Besar',
    target: 34,
    color: '#1a6b52',
  },
  {
    id: 'lailaha',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    label: 'La ilaha illallah',
    meaning: 'Tiada tuhan melainkan Allah',
    target: 100,
    color: '#5b21b6',
  },
  {
    id: 'astaghfir',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    label: 'Astaghfirullah',
    meaning: 'Aku memohon ampun kepada Allah',
    target: 100,
    color: '#9a3412',
  },
  {
    id: 'salawat',
    arabic: 'صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ',
    label: 'Selawat Nabi',
    meaning: 'Berselawat ke atas Nabi ﷺ',
    target: 100,
    color: '#0f766e',
  },
]

const LS_KEY = 'sajda_tasbih'

function haptic(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

/* ─── SVG circular progress ring ────────────────────────────────────────── */

function RingProgress({
  value,
  max,
  color,
}: {
  value: number
  max: number
  color: string
}) {
  const radius = 112
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)

  return (
    <svg width="284" height="284" viewBox="0 0 284 284" className="absolute inset-0">
      <circle
        cx="142" cy="142" r={radius}
        fill="none"
        stroke="rgba(16,41,55,0.07)"
        strokeWidth="9"
      />
      <motion.circle
        cx="142" cy="142" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: circumference * (1 - progress) }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        transform="rotate(-90 142 142)"
        style={{ opacity: 0.9 }}
      />
    </svg>
  )
}

/* ─── TasbihCounter ──────────────────────────────────────────────────────── */

export function TasbihCounter() {
  const [zikirIdx, setZikirIdx] = useState(0)
  const [count, setCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [showComplete, setShowComplete] = useState(false)

  const zikir = ZIKIR[zikirIdx]!

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
      if (saved.total) setTotalCount(saved.total)
      if (saved.sessions) setSessions(saved.sessions)
    } catch {}
  }, [])

  const handleTap = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1

      setTotalCount((t) => {
        const nt = t + 1
        try {
          localStorage.setItem(LS_KEY, JSON.stringify({ total: nt, sessions }))
        } catch {}
        return nt
      })

      if (next === zikir.target) {
        haptic([80, 40, 80, 40, 180])
        setShowComplete(true)
        setSessions((s) => {
          const ns = s + 1
          try {
            localStorage.setItem(LS_KEY, JSON.stringify({ total: totalCount + next, sessions: ns }))
          } catch {}
          return ns
        })
        setTimeout(() => {
          setShowComplete(false)
          setCount(0)
        }, 1800)
      } else if (next % 10 === 0) {
        haptic([40, 25, 40])
      } else {
        haptic(10)
      }

      return next >= zikir.target ? 0 : next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zikir.target, sessions, totalCount])

  function switchZikir(idx: number) {
    setZikirIdx(idx)
    setCount(0)
    setShowComplete(false)
    haptic(15)
  }

  function handleReset() {
    setCount(0)
    setShowComplete(false)
    haptic([25, 15, 25])
  }

  const displayCount = showComplete ? zikir.target : count

  return (
    <div className="flex flex-col items-center px-4 pt-3 pb-8 select-none">

      {/* ── Zikir preset tabs ──────────────────────────────────────── */}
      <div
        className="flex gap-2 w-full overflow-x-auto pb-3 mb-5"
        style={{ scrollbarWidth: 'none' }}
      >
        {ZIKIR.map((z, i) => (
          <button
            key={z.id}
            onClick={() => switchZikir(i)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
            style={{
              background: zikirIdx === i ? z.color : 'var(--surface-2)',
              color: zikirIdx === i ? '#fff' : 'var(--text-muted)',
              boxShadow: zikirIdx === i ? `0 2px 10px ${z.color}50` : 'none',
            }}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* ── Main tap circle ────────────────────────────────────────── */}
      <motion.div
        onTap={handleTap}
        whileTap={{ scale: 0.95 }}
        className="relative w-[284px] h-[284px] flex items-center justify-center rounded-full cursor-pointer touch-none"
        style={{
          background: 'var(--surface-2)',
          boxShadow: '0 10px 48px rgba(16,41,55,0.13)',
        }}
        role="button"
        aria-label={`Tekan untuk ${zikir.label}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' && handleTap()}
      >
        <RingProgress value={displayCount} max={zikir.target} color={zikir.color} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <p
            className="text-center leading-snug"
            style={{
              color: zikir.color,
              fontFamily: 'var(--font-amiri)',
              fontSize: 26,
              direction: 'rtl',
            }}
          >
            {zikir.arabic}
          </p>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={displayCount}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="font-bold tabular-nums leading-none"
              style={{ color: 'var(--text)', fontSize: 64 }}
            >
              {displayCount}
            </motion.span>
          </AnimatePresence>

          <span className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>
            / {zikir.target}
          </span>
        </div>

        {/* ── Complete overlay ────────────────────────────────────── */}
        <AnimatePresence>
          {showComplete && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              className="absolute inset-0 rounded-full flex flex-col items-center justify-center z-20"
              style={{ background: zikir.color }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              >
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="mb-2">
                  <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                Sempurna!
              </span>
              <span className="text-white/70 text-sm mt-1">{zikir.label}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Meaning ────────────────────────────────────────────────── */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{zikir.label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{zikir.meaning}</p>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-6 mt-6 py-4 px-8 rounded-2xl"
        style={{ background: 'var(--surface-2)', boxShadow: '0 2px 12px rgba(16,41,55,0.06)' }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
            {sessions}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-dim)' }}>
            Pusingan
          </p>
        </div>

        <div className="w-px h-8" style={{ background: 'var(--border-strong)' }} />

        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
            {totalCount >= 1000
              ? `${(totalCount / 1000).toFixed(1).replace('.0', '')}k`
              : totalCount}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-dim)' }}>
            Jumlah
          </p>
        </div>

        <div className="w-px h-8" style={{ background: 'var(--border-strong)' }} />

        <button onClick={handleReset} className="flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12A9 9 0 106 5.7L3 3v6h6L6.3 6.3"
              stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            Reset
          </p>
        </button>
      </div>

      <p className="text-xs mt-5 text-center" style={{ color: 'var(--text-dim)' }}>
        Tekan bulatan untuk berzikir · Getaran aktif
      </p>
    </div>
  )
}
