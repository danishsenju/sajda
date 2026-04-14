'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Checklist items ────────────────────────────────────────────────────── */

type ItemDef = { key: string; label: string; category: string; points: number }

const ITEMS: ItemDef[] = [
  // Wajib
  { key: 'subuh',    label: 'Solat Subuh',                  category: 'Wajib',  points: 4 },
  { key: 'zohor',    label: 'Solat Zohor',                  category: 'Wajib',  points: 4 },
  { key: 'asar',     label: 'Solat Asar',                   category: 'Wajib',  points: 4 },
  { key: 'maghrib',  label: 'Solat Maghrib',                category: 'Wajib',  points: 4 },
  { key: 'isyak',    label: 'Solat Isyak',                  category: 'Wajib',  points: 4 },
  // Sunnah
  { key: 'rawatib',  label: 'Solat Sunat Rawatib',          category: 'Sunnah', points: 3 },
  { key: 'dhuha',    label: 'Solat Dhuha (min 2 rakaat)',   category: 'Sunnah', points: 3 },
  { key: 'witir',    label: 'Solat Witir',                  category: 'Sunnah', points: 3 },
  { key: 'quran',    label: 'Baca Al-Quran (≥ 1 halaman)',  category: 'Sunnah', points: 3 },
  { key: 'morning',  label: 'Zikir Pagi (Al-Mathurat)',     category: 'Sunnah', points: 2 },
  { key: 'evening',  label: 'Zikir Petang (Al-Mathurat)',   category: 'Sunnah', points: 2 },
  { key: 'sedekah',  label: 'Bersedekah (apa saja)',        category: 'Sunnah', points: 2 },
  // Akhlaq
  { key: 'lisan',    label: 'Jaga lisan — tiada mengumpat', category: 'Akhlaq', points: 2 },
  { key: 'syukur',   label: 'Syukur & muhasabah diri',      category: 'Akhlaq', points: 1 },
]

const CATEGORIES = ['Wajib', 'Sunnah', 'Akhlaq']
const MAX_POINTS = ITEMS.reduce((s, i) => s + i.points, 0)

const LS_KEY = 'sajda_deen_checklist'
const LS_STREAK = 'sajda_deen_streak'

function todayKey() { return new Date().toISOString().slice(0, 10) }

function getChecked(): Record<string, boolean> {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
    if (saved.date !== todayKey()) return {}
    return saved.checked ?? {}
  } catch { return {} }
}

function saveChecked(checked: Record<string, boolean>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ date: todayKey(), checked })) } catch {}
}

function getStreak(): number {
  try { return JSON.parse(localStorage.getItem(LS_STREAK) ?? '0') } catch { return 0 }
}

function updateStreakIfAllDone(checked: Record<string, boolean>) {
  const allDone = ITEMS.every((i) => checked[i.key])
  if (allDone) {
    const prev = getStreak()
    // Simple: just count from localStorage flags (we'll track "was complete yesterday" flag)
    try {
      const flag = JSON.parse(localStorage.getItem('sajda_deen_lastcomplete') ?? '""')
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const newStreak = flag === yesterday.toISOString().slice(0, 10) ? prev + 1 : 1
      localStorage.setItem(LS_STREAK, JSON.stringify(newStreak))
      localStorage.setItem('sajda_deen_lastcomplete', JSON.stringify(todayKey()))
    } catch {}
  }
}

/* ─── DeenChecklist ──────────────────────────────────────────────────────── */

export function DeenChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setChecked(getChecked())
    setStreak(getStreak())
    setMounted(true)
  }, [])

  function toggle(key: string) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      saveChecked(next)
      updateStreakIfAllDone(next)
      setStreak(getStreak())
      return next
    })
  }

  const doneCount = ITEMS.filter((i) => checked[i.key]).length
  const totalPoints = ITEMS.filter((i) => checked[i.key]).reduce((s, i) => s + i.points, 0)
  const progress = totalPoints / MAX_POINTS
  const allDone = doneCount === ITEMS.length

  if (!mounted) return null

  return (
    <div className="px-4 pb-10 md:px-0">

      {/* ── Header card ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mt-4 mb-6"
        style={{ background: 'var(--primary)' }}
      >
        <div className="flex items-center gap-5">
          {/* Circular progress */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
              <motion.circle
                cx="40" cy="40" r="33"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 33}
                animate={{ strokeDashoffset: 2 * Math.PI * 33 * (1 - progress) }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold leading-none" style={{ color: '#fff' }}>{doneCount}</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.60)' }}>/{ITEMS.length}</span>
            </div>
          </div>

          <div className="flex-1">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.50)' }}
            >
              Deen Checklist
            </p>
            <p
              className="text-xl font-bold mt-1"
              style={{ color: '#fff', fontFamily: 'var(--font-playfair)' }}
            >
              {Math.round(progress * 100)}% hari ini
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {totalPoints}/{MAX_POINTS} mata pahala
            </p>

            {streak > 0 && (
              <div
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full mt-2"
                style={{ background: 'rgba(249,116,75,0.20)' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--accent)">
                  <path d="M13 2L4.09 12.11a1 1 0 00.77 1.63L11 14l-1 8 8.92-10.11a1 1 0 00-.77-1.63L13 10l1-8z" />
                </svg>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {streak} hari streak
                </span>
              </div>
            )}
          </div>
        </div>

        {allDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 px-3 py-2 rounded-xl text-xs text-center font-semibold"
            style={{ background: 'rgba(255,255,255,0.10)', color: 'var(--accent)' }}
          >
            MasyaAllah! Semua selesai hari ini! Semoga diterima Allah. 🤲
          </motion.div>
        )}
      </motion.div>

      {/* ── Grouped checklist ──────────────────────────────────────── */}
      {CATEGORIES.map((cat) => {
        const catItems = ITEMS.filter((i) => i.category === cat)
        const catDone = catItems.filter((i) => checked[i.key]).length

        return (
          <div key={cat} className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <p
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-dim)' }}
              >
                {cat}
              </p>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: catDone === catItems.length ? 'rgba(22,163,74,0.12)' : 'var(--surface-2)',
                  color: catDone === catItems.length ? '#16a34a' : 'var(--text-dim)',
                }}
              >
                {catDone}/{catItems.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {catItems.map((item) => {
                const done = !!checked[item.key]
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    whileTap={{ scale: 0.975 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: done ? 'rgba(16,41,55,0.06)' : 'var(--surface-2)',
                      border: done ? '1px solid rgba(16,41,55,0.12)' : '1px solid transparent',
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: done ? 'var(--primary)' : 'var(--surface-3)',
                        border: done ? 'none' : '1.5px solid var(--border-strong)',
                      }}
                    >
                      <AnimatePresence>
                        {done && (
                          <motion.svg
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0 }}
                            width="13" height="13" viewBox="0 0 24 24" fill="none"
                          >
                            <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Label */}
                    <span
                      className="flex-1 text-sm font-medium"
                      style={{
                        color: done ? 'var(--text-dim)' : 'var(--text)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Points badge */}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{
                        background: done ? 'rgba(249,116,75,0.12)' : 'var(--surface-3)',
                        color: done ? 'var(--accent)' : 'var(--text-dim)',
                      }}
                    >
                      +{item.points}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}

      <p className="text-xs text-center mt-2" style={{ color: 'var(--text-dim)' }}>
        Senarai semak akan dikosongkan setiap hari pada pukul 12 tengah malam.
      </p>
    </div>
  )
}
