'use client'

import { useCallback, useEffect, useState } from 'react'
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

/* ─── Arabic duas per prayer ─────────────────────────────────────────────── */

const PRAYER_IMAGES: Record<string, string> = {
  subuh:   '/subuh-image-top.png',
  zohor:   '/zohorasar-image-top.png',
  asar:    '/zohorasar-image-top.png',
  maghrib: '/maghrib-image-top.png',
  isyak:   '/isha-image-top.png',
}

const PRAYER_DUA: Record<string, string> = {
  subuh:   'اللَّهُمَّ بَارِكْ لَنَا فِي صَبَاحِنَا',
  zohor:   'اللَّهُمَّ بَارِكْ لَنَا فِي ظُهْرِنَا',
  asar:    'اللَّهُمَّ بَارِكْ لَنَا فِي عَصْرِنَا',
  maghrib: 'اللَّهُمَّ بَارِكْ لَنَا فِي مَغْرِبِنَا',
  isyak:   'اللَّهُمَّ بَارِكْ لَنَا فِي عِشَائِنَا',
}

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
  return { prayer: fajr, minutesLeft: 1440 - cur + toMinutes(fajr.time), nextIndex: 0 }
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `dalam ${minutes} minit`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `dalam ${h} jam` : `dalam ${h}j ${m}m`
}

/* ─── Islamic star SVG overlay ───────────────────────────────────────────── */

function StarPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 300 200"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity: 0.13 }}
    >
      {/* Large star top-right */}
      <polygon
        points="240,10 248,34 274,34 253,50 261,74 240,58 219,74 227,50 206,34 232,34"
        fill="white"
      />
      {/* Small star mid-left */}
      <polygon
        points="30,80 35,95 51,95 39,105 44,120 30,110 16,120 21,105 9,95 25,95"
        fill="white"
      />
      {/* Medium star bottom-right */}
      <polygon
        points="270,140 276,158 295,158 280,169 286,187 270,176 254,187 260,169 245,158 264,158"
        fill="white"
      />
      {/* Tiny star top-left */}
      <polygon
        points="60,20 63,30 73,30 66,36 69,46 60,40 51,46 54,36 47,30 57,30"
        fill="white"
      />
      {/* Crescent / decorative arc */}
      <circle cx="200" cy="160" r="50" stroke="white" strokeWidth="0.8" fill="none" strokeDasharray="4 6" />
      <circle cx="200" cy="160" r="70" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="2 8" />
    </svg>
  )
}

/* ─── PrayerBanner ───────────────────────────────────────────────────────── */

export function PrayerBanner() {
  const [prayers, setPrayers]             = useState<Prayer[]>(FALLBACK)
  const [state, setState]                 = useState(() => getNextPrayer(FALLBACK))
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [isLocating, setIsLocating]       = useState(false)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords

          const zoneRes = await fetch(
            `/api/prayer/zone?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}`
          )
          if (!zoneRes.ok) return

          const { zone, district } = await zoneRes.json() as { zone: string; district: string }

          const timesRes = await fetch(`/api/prayer?zone=${zone}`)
          if (!timesRes.ok) return

          const times = await timesRes.json() as {
            subuh: string; zohor: string; asar: string; maghrib: string; isyak: string
          }

          const realTimes: Prayer[] = [
            { name: 'subuh',   label: 'Subuh',   time: times.subuh },
            { name: 'zohor',   label: 'Zohor',   time: times.zohor },
            { name: 'asar',    label: 'Asar',    time: times.asar },
            { name: 'maghrib', label: 'Maghrib', time: times.maghrib },
            { name: 'isyak',   label: 'Isyak',   time: times.isyak },
          ]

          setPrayers(realTimes)
          setState(getNextPrayer(realTimes))
          if (district) setLocationLabel(district)

          try {
            const today = new Date().toISOString().slice(0, 10)
            localStorage.setItem(LS_KEY, JSON.stringify({ date: today, prayers: realTimes, district, zone }))
          } catch {}
        } finally {
          setIsLocating(false)
        }
      },
      () => { setIsLocating(false) },
      { timeout: 8000 }
    )
  }, [])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const cached = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
      if (cached.date === today && Array.isArray(cached.prayers)) {
        setPrayers(cached.prayers)
        setState(getNextPrayer(cached.prayers))
        if (cached.district) setLocationLabel(cached.district)
        return
      }
    } catch {}
    detectLocation()
  }, [detectLocation])

  useEffect(() => {
    const id = setInterval(() => setState(getNextPrayer(prayers)), 60_000)
    return () => clearInterval(id)
  }, [prayers])

  const { prayer, minutesLeft, nextIndex } = state
  const dua = PRAYER_DUA[prayer.name] ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-4 mt-4 rounded-2xl overflow-hidden md:mx-0"
      style={{ boxShadow: '0 4px 24px rgba(109,43,61,0.18)' }}
    >
      {/* ── Hero section ────────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-5 pb-5"
        style={{
          backgroundImage: `url(${PRAYER_IMAGES[prayer.name] ?? '/subuh-image-top.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      >
        <StarPattern />

        <div className="relative z-10">
          {/* Top row: label + location chip */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Solat Seterusnya
            </span>

            <button
              onClick={() => {
                try { localStorage.removeItem(LS_KEY) } catch {}
                detectLocation()
              }}
              disabled={isLocating}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-opacity active:opacity-70"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(4px)',
                cursor: isLocating ? 'default' : 'pointer',
              }}
            >
              {isLocating ? (
                <span className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin block" style={{ flexShrink: 0 }} />
              ) : (
                <MapPin size={10} strokeWidth={2} />
              )}
              {locationLabel ?? (isLocating ? '' : 'Lokasi')}
            </button>
          </div>

          {/* Prayer name + time */}
          <div className="mb-3">
            <h2
              className="leading-none mb-1"
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              {prayer.label}
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.80)', fontWeight: 500 }}>
              {prayer.time}
            </p>
          </div>

          {/* Countdown badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.28)',
            }}
          >
            <span className="text-[13px] font-semibold" style={{ color: '#ffffff' }}>
              {formatCountdown(minutesLeft)}
            </span>
          </div>

          {/* Arabic dua */}
          <p
            className="text-center leading-relaxed"
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: '18px',
              color: 'rgba(255,255,255,0.70)',
              direction: 'rtl',
            }}
          >
            {dua}
          </p>
        </div>
      </div>

      {/* ── Prayer times strip ──────────────────────────────────────── */}
      <div
        className="flex justify-between px-4 py-3"
        style={{ background: '#581F2E' }}
      >
        {prayers.map((p, i) => {
          const isNext = i === nextIndex
          const isPast = !isNext && i < nextIndex
          return (
            <div
              key={p.name}
              className="flex flex-col items-center gap-1 flex-1 px-1 py-1.5 rounded-xl transition-colors"
              style={isNext ? { background: 'rgba(255,255,255,0.14)' } : {}}
            >
              <span
                className="text-[11px]"
                style={{
                  color: isNext ? '#ffffff' : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)',
                  fontWeight: isNext ? 700 : 400,
                }}
              >
                {p.label}
              </span>
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: isNext ? '#ffffff' : isPast ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.18)' }}
              />
              <span
                className="text-[11px] tabular-nums"
                style={{
                  color: isNext ? '#ffffff' : isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.55)',
                  fontWeight: isNext ? 700 : 400,
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
