'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Prayer = { name: string; label: string; time: string }

const FALLBACK: Prayer[] = [
  { name: 'subuh',   label: 'Subuh',   time: '05:50' },
  { name: 'zohor',   label: 'Zohor',   time: '13:10' },
  { name: 'asar',    label: 'Asar',    time: '16:35' },
  { name: 'maghrib', label: 'Maghrib', time: '19:22' },
  { name: 'isyak',   label: 'Isyak',   time: '20:35' },
]

const LS_KEY = 'sajda_prayer_times_banner'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h! * 60 + m!
}

function getNextPrayer(prayers: Prayer[]) {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  for (let i = 0; i < prayers.length; i++) {
    if (toMinutes(prayers[i]!.time) > cur) {
      return { prayer: prayers[i]!, minutesLeft: toMinutes(prayers[i]!.time) - cur, nextIndex: i }
    }
  }
  const fajr = prayers[0]!
  return {
    prayer: fajr,
    minutesLeft: 1440 - cur + toMinutes(fajr.time),
    nextIndex: 0,
  }
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}j` : `${h}j ${m}m`
}

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h! >= 12 ? 'ptg' : 'pg'
  const hour = h! % 12 || 12
  return `${hour}:${String(m!).padStart(2, '0')} ${period}`
}

/* ─── Prayer time fetcher (Al Adhan API) ─────────────────────────────────── */

async function fetchRealTimes(lat: number, lng: number): Promise<Prayer[] | null> {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&method=3&school=1`
    )
    const data = await res.json()
    const t = data?.data?.timings
    if (!t) return null
    return [
      { name: 'subuh',   label: 'Subuh',   time: t.Fajr },
      { name: 'zohor',   label: 'Zohor',   time: t.Dhuhr },
      { name: 'asar',    label: 'Asar',    time: t.Asr },
      { name: 'maghrib', label: 'Maghrib', time: t.Maghrib },
      { name: 'isyak',   label: 'Isyak',   time: t.Isha },
    ]
  } catch {
    return null
  }
}

/* ─── PrayerBanner ───────────────────────────────────────────────────────── */

export function PrayerBanner() {
  const [prayers, setPrayers] = useState<Prayer[]>(FALLBACK)
  const [state, setState] = useState(() => getNextPrayer(FALLBACK))
  const [locationLabel, setLocationLabel] = useState<string | null>(null)

  /* ── Location-based prayer times ──────────────────────────────── */
  useEffect(() => {
    // Try cached first (same-day cache)
    const today = new Date().toISOString().slice(0, 10)
    try {
      const cached = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
      if (cached.date === today && Array.isArray(cached.prayers)) {
        setPrayers(cached.prayers)
        setState(getNextPrayer(cached.prayers))
        if (cached.city) setLocationLabel(cached.city)
        return
      }
    } catch {}

    // Fetch live
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const realTimes = await fetchRealTimes(latitude, longitude)
        if (realTimes) {
          setPrayers(realTimes)
          setState(getNextPrayer(realTimes))

          // Reverse geocode for city name
          let city: string | null = null
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { 'Accept-Language': 'ms,en' } }
            )
            const geo = await r.json()
            city = geo.address?.city ?? geo.address?.town ?? geo.address?.state ?? null
          } catch {}

          if (city) setLocationLabel(city)
          try {
            localStorage.setItem(LS_KEY, JSON.stringify({ date: today, prayers: realTimes, city }))
          } catch {}
        }
      },
      () => {}, // silently fall back to defaults
      { timeout: 8000 }
    )
  }, [])

  /* ── Tick every minute ─────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => setState(getNextPrayer(prayers)), 60_000)
    return () => clearInterval(id)
  }, [prayers])

  const { prayer, minutesLeft, nextIndex } = state

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-4 mt-4 rounded-2xl overflow-hidden md:mx-0"
      style={{ background: 'var(--primary)', boxShadow: '0 8px 32px rgba(16,41,55,0.20)' }}
    >
      {/* ── Top section ────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">

          {/* Left: next prayer */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Waktu Solat Seterusnya
              </p>
              {locationLabel && (
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)' }}
                >
                  📍 {locationLabel}
                </span>
              )}
            </div>
            <h2
              className="text-3xl font-bold leading-none"
              style={{ color: '#fff', fontFamily: 'var(--font-playfair)' }}
            >
              {prayer.label}
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
              {formatTime12h(prayer.time)}
            </p>
          </div>

          {/* Right: countdown + crescent */}
          <div className="flex flex-col items-end gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                <path d="M12 7V12L14.5 14.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-bold" style={{ color: '#fff' }}>
                {formatCountdown(minutesLeft)} lagi
              </span>
            </div>

            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <path
                d="M20 8C17.24 8 15 10.24 15 13C15 15.76 17.24 18 20 18C20.74 18 21.44 17.83 22.07 17.54C21.01 19.6 18.85 21 16.36 21C12.83 21 10 18.17 10 14.64C10 11.11 12.83 8.28 16.36 8.28C17.62 8.28 18.79 8.65 19.78 9.28C19.85 8.85 19.92 8.43 20 8Z"
                fill="rgba(255,255,255,0.18)"
              />
              <circle cx="26" cy="7" r="1.4" fill="rgba(255,255,255,0.22)" />
              <circle cx="8" cy="10" r="0.9" fill="rgba(255,255,255,0.14)" />
              <circle cx="28" cy="18" r="0.9" fill="rgba(255,255,255,0.18)" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Prayer times row ────────────────────────────────────────── */}
      <div
        className="flex justify-between px-4 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {prayers.map((p, i) => {
          const isNext = i === nextIndex
          const isPast = !isNext && i < nextIndex
          return (
            <div key={p.name} className="flex flex-col items-center gap-1">
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isNext ? 'var(--accent)' : isPast ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.52)',
                }}
              >
                {p.label}
              </span>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isNext ? 'var(--accent)' : isPast ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.32)',
                }}
              />
              <span
                className="text-[10px] tabular-nums"
                style={{
                  color: isNext ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.32)',
                  fontWeight: isNext ? 600 : 400,
                }}
              >
                {p.time}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Progress bar ────────────────────────────────────────────── */}
      <motion.div
        className="h-[3px]"
        style={{ background: 'var(--accent)', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0.02, 1 - minutesLeft / 720) }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </motion.div>
  )
}
