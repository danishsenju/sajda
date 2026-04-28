'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

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

    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const realTimes = await fetchRealTimes(latitude, longitude)
        if (realTimes) {
          setPrayers(realTimes)
          setState(getNextPrayer(realTimes))

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
      () => {},
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
      style={{
        background: 'linear-gradient(160deg, #EAF4EE 0%, #FFFFFF 100%)',
        border: '1px solid #C7E6D4',
      }}
    >
      {/* ── Hero section ────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[12px] font-medium"
            style={{ color: '#A8A49E', letterSpacing: '0.01em' }}
          >
            Waktu solat seterusnya
          </span>
          {locationLabel && (
            <span
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium"
              style={{
                background: '#EAF4EE',
                color: '#2D6A4F',
                border: '1px solid #C7E6D4',
              }}
            >
              <MapPin size={10} strokeWidth={2} />
              {locationLabel}
            </span>
          )}
        </div>

        {/* Prayer name + time */}
        <div className="mb-4">
          <h2
            className="leading-none mb-1.5"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1A1916',
              letterSpacing: '-0.5px',
            }}
          >
            {prayer.label}
          </h2>
          <p style={{ fontSize: '17px', color: '#6B6860' }}>
            {formatTime12h(prayer.time)}
          </p>
        </div>

        {/* Countdown pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: '#FFFFFF',
            border: '1px solid #C7E6D4',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2D6A4F' }} />
          <span
            className="text-[13px] font-semibold"
            style={{ color: '#2D6A4F' }}
          >
            {formatCountdown(minutesLeft)} lagi
          </span>
        </div>
      </div>

      {/* ── Prayer times strip ──────────────────────────────────────── */}
      <div
        className="flex justify-between px-5 py-4"
        style={{ borderTop: '1px solid #E8E5DF', background: '#FFFFFF' }}
      >
        {prayers.map((p, i) => {
          const isNext = i === nextIndex
          const isPast = !isNext && i < nextIndex
          return (
            <div key={p.name} className="flex flex-col items-center gap-1.5 flex-1">
              <span
                className="text-[11px]"
                style={{
                  color: isNext ? '#2D6A4F' : '#A8A49E',
                  fontWeight: isNext ? 600 : 400,
                }}
              >
                {p.label}
              </span>
              {/* Active indicator dot */}
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isNext ? '#2D6A4F' : isPast ? '#D5D0C9' : 'transparent',
                  border: isNext ? 'none' : '1px solid #E8E5DF',
                }}
              />
              <span
                className="text-[11px] tabular-nums"
                style={{
                  color: isNext ? '#2D6A4F' : '#A8A49E',
                  fontWeight: isNext ? 600 : 400,
                }}
              >
                {p.time}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
