'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types & constants ──────────────────────────────────────────────────── */

const PRAYERS = [
  { key: 'subuh', label: 'Subuh', fardhu: 'Fajr', icon: '🌅', time: '05:50' },
  { key: 'zohor', label: 'Zohor', fardhu: 'Dhuhr', icon: '☀️', time: '13:10' },
  { key: 'asar', label: 'Asar', fardhu: 'Asr', icon: '🌤️', time: '16:35' },
  { key: 'maghrib', label: 'Maghrib', fardhu: 'Maghrib', icon: '🌇', time: '19:22' },
  { key: 'isyak', label: 'Isyak', fardhu: 'Isha', icon: '🌙', time: '20:35' },
] as const

type PrayerKey = typeof PRAYERS[number]['key']
type DayLog = Record<PrayerKey, boolean>
type PrayerTimes = Record<string, string>

const LS_LOG = 'sajda_solat_log'
const LS_TIMES = 'sajda_prayer_times'

const STREAKS_MSG = [
  { min: 0, msg: 'Mulakan hari ini. Setiap langkah dikira.' },
  { min: 1, msg: 'Bagus! Teruskan momentum anda.' },
  { min: 3, msg: 'Tiga hari berturut-turut! Konsistensi adalah kunci.' },
  { min: 7, msg: 'Satu minggu penuh! MasyaAllah, teruskan!' },
  { min: 14, msg: 'Dua minggu! Solat sudah jadi tabiat mulia.' },
  { min: 30, msg: 'Sebulan! SubhanAllah, anda luar biasa!' },
  { min: 100, msg: 'Lebih 100 hari! Anda adalah inspirasi.' },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function dateKey(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function dayLabel(daysAgo: number) {
  if (daysAgo === 0) return 'Hari ini'
  if (daysAgo === 1) return 'Semalam'
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('ms-MY', { weekday: 'short' })
}

function getLog(): Record<string, DayLog> {
  try { return JSON.parse(localStorage.getItem(LS_LOG) ?? '{}') } catch { return {} }
}

function saveLog(log: Record<string, DayLog>) {
  try { localStorage.setItem(LS_LOG, JSON.stringify(log)) } catch {}
}

function calcStreak(log: Record<string, DayLog>): number {
  let streak = 0
  for (let i = 1; i <= 365; i++) {
    const key = dateKey(i)
    const day = log[key]
    if (!day || !PRAYERS.every((p) => day[p.key])) break
    streak++
  }
  return streak
}

function streakMsg(n: number) {
  const match = [...STREAKS_MSG].reverse().find((m) => n >= m.min)
  return match?.msg ?? ''
}

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h! >= 12 ? 'ptg' : 'pg'
  const hour = h! % 12 || 12
  return `${hour}:${String(m!).padStart(2, '0')} ${period}`
}

/* ─── Prayer times via Al Adhan API ─────────────────────────────────────── */

async function fetchPrayerTimes(lat: number, lng: number): Promise<PrayerTimes | null> {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=3&school=1`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    const t = data?.data?.timings
    if (!t) return null
    return {
      subuh: t.Fajr,
      zohor: t.Dhuhr,
      asar: t.Asr,
      maghrib: t.Maghrib,
      isyak: t.Isha,
    }
  } catch {
    return null
  }
}

/* ─── SolatTracker ───────────────────────────────────────────────────────── */

export function SolatTracker() {
  const [log, setLog] = useState<Record<string, DayLog>>({})
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [timesLoading, setTimesLoading] = useState(false)
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = getLog()
    setLog(stored)
    setStreak(calcStreak(stored))
    setMounted(true)

    // Try to get location-based prayer times
    const cachedTimes = localStorage.getItem(LS_TIMES)
    if (cachedTimes) {
      try {
        const parsed = JSON.parse(cachedTimes)
        if (parsed.date === todayKey()) {
          setPrayerTimes(parsed.times)
          return
        }
      } catch {}
    }

    if (navigator.geolocation) {
      setTimesLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const times = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude)
          if (times) {
            setPrayerTimes(times)
            try {
              localStorage.setItem(LS_TIMES, JSON.stringify({ date: todayKey(), times }))
            } catch {}
          }
          setTimesLoading(false)
        },
        () => setTimesLoading(false),
        { timeout: 8000 }
      )
    }
  }, [])

  function togglePrayer(prayerKey: PrayerKey) {
    const today = todayKey()
    setLog((prev) => {
      const todayLog: DayLog = prev[today] ?? {
        subuh: false, zohor: false, asar: false, maghrib: false, isyak: false,
      }
      const updated = { ...prev, [today]: { ...todayLog, [prayerKey]: !todayLog[prayerKey] } }
      saveLog(updated)
      setStreak(calcStreak(updated))
      return updated
    })
  }

  const todayLog: DayLog = log[todayKey()] ?? {
    subuh: false, zohor: false, asar: false, maghrib: false, isyak: false,
  }

  const doneToday = PRAYERS.filter((p) => todayLog[p.key]).length
  const allDone = doneToday === 5

  if (!mounted) return null

  return (
    <div className="px-4 pb-10 md:px-0">

      {/* ── Streak banner ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mt-4 mb-5"
        style={{ background: 'var(--primary)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'rgba(255,255,255,0.50)' }}
            >
              Streak Solat
            </p>
            <div className="flex items-end gap-2">
              <span
                className="text-5xl font-bold leading-none"
                style={{ color: '#fff', fontFamily: 'var(--font-playfair)' }}
              >
                {streak}
              </span>
              <span className="text-lg font-medium mb-1" style={{ color: 'rgba(255,255,255,0.60)' }}>hari</span>
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {streakMsg(streak)}
            </p>
          </div>

          {/* Progress donut */}
          <div className="relative w-16 h-16">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="5" />
              <motion.circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - doneToday / 5) }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: '#fff' }}>{doneToday}/5</span>
            </div>
          </div>
        </div>

        {allDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              Semua solat hari ini selesai! AllahuAkbar 🎉
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* ── Today's prayer checklist ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            Solat Hari Ini
          </p>
          {timesLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-3.5 h-3.5 border-2 rounded-full"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
            />
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {PRAYERS.map((p) => {
            const done = todayLog[p.key]
            const time = prayerTimes?.[p.key] ?? p.time
            return (
              <motion.button
                key={p.key}
                onClick={() => togglePrayer(p.key)}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
                style={{
                  background: done ? 'var(--primary)' : 'var(--surface-2)',
                  boxShadow: done ? '0 4px 16px rgba(16,41,55,0.20)' : '0 1px 6px rgba(16,41,55,0.06)',
                }}
              >
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: done ? '#fff' : 'var(--text)' }}
                  >
                    {p.label}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: done ? 'rgba(255,255,255,0.60)' : 'var(--text-dim)' }}
                  >
                    {formatTime(time)}
                    {timesLoading && ' (memuatkan...)'}
                  </p>
                </div>
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="circle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: 'var(--border-strong)' }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── 7-day history ──────────────────────────────────────────── */}
      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>
          7 Hari Lepas
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const daysAgo = 6 - i
            const key = dateKey(daysAgo)
            const dayLog = log[key]
            const count = dayLog ? PRAYERS.filter((p) => dayLog[p.key]).length : 0
            const isToday = daysAgo === 0
            const full = count === 5
            const partial = count > 0 && count < 5

            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-medium" style={{ color: 'var(--text-dim)' }}>
                  {dayLabel(daysAgo)}
                </span>
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center"
                  style={{
                    background: full
                      ? 'var(--primary)'
                      : partial
                      ? 'rgba(16,41,55,0.15)'
                      : 'var(--surface-2)',
                    border: isToday ? '2px solid var(--accent)' : 'none',
                  }}
                >
                  <span
                    className="text-[11px] font-bold"
                    style={{
                      color: full ? '#fff' : partial ? 'var(--text-muted)' : 'var(--text-dim)',
                    }}
                  >
                    {count > 0 ? count : daysAgo === 0 ? doneToday : '–'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-dim)' }}>
          Warna penuh = 5/5 solat selesai
        </p>
      </div>
    </div>
  )
}
