'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Prayer = { name: string; label: string; labelAr: string; time: string }

const ARABIC_NAMES: Record<string, string> = {
  subuh:   'الفجر',
  zohor:   'الظهر',
  asar:    'العصر',
  maghrib: 'المغرب',
  isyak:   'العشاء',
}

const FALLBACK: Prayer[] = [
  { name: 'subuh',   label: 'Subuh',   labelAr: 'الفجر',  time: '05:50' },
  { name: 'zohor',   label: 'Zohor',   labelAr: 'الظهر',  time: '13:10' },
  { name: 'asar',    label: 'Asar',    labelAr: 'العصر',  time: '16:35' },
  { name: 'maghrib', label: 'Maghrib', labelAr: 'المغرب', time: '19:22' },
  { name: 'isyak',   label: 'Isyak',   labelAr: 'العشاء', time: '20:35' },
]

const STRIP_SHORT: Record<string, string> = {
  subuh: 'Sub', zohor: 'Zoh', asar: 'Asr', maghrib: 'Mgh', isyak: 'Isy',
}

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
  return { prayer: fajr, minutesLeft: 1440 - cur + toMinutes(fajr.time), nextIndex: 0 }
}

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `dalam ${minutes} minit`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `dalam ${h} jam` : `dalam ${h}j ${m}m`
}

/* ─── Mosque silhouette ──────────────────────────────────────────────────── */

function MosqueSilhouette() {
  return (
    <svg
      className="absolute bottom-0 right-0 pointer-events-none select-none"
      width="160"
      height="100"
      viewBox="0 0 160 100"
      fill="none"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true"
      style={{ opacity: 0.08 }}
    >
      {/* Left minaret */}
      <rect x="12" y="28" width="10" height="72" rx="2" fill="white" />
      <path d="M17 20 C13 24 21 24 17 20Z" fill="white" />
      <rect x="14" y="24" width="6" height="6" rx="1" fill="white" />
      {/* Right minaret */}
      <rect x="138" y="28" width="10" height="72" rx="2" fill="white" />
      <path d="M143 20 C139 24 147 24 143 20Z" fill="white" />
      <rect x="140" y="24" width="6" height="6" rx="1" fill="white" />
      {/* Main dome */}
      <path d="M80 14 C55 14 35 32 35 52 L125 52 C125 32 105 14 80 14Z" fill="white" />
      {/* Side domes */}
      <path d="M45 42 C36 42 28 48 28 56 L62 56 C62 48 54 42 45 42Z" fill="white" />
      <path d="M115 42 C106 42 98 48 98 56 L132 56 C132 48 124 42 115 42Z" fill="white" />
      {/* Body */}
      <rect x="30" y="52" width="100" height="48" fill="white" />
      {/* Windows */}
      <path d="M52 70 L52 60 Q57 54 62 60 L62 70Z" fill="#1E6B45" />
      <path d="M75 70 L75 60 Q80 54 85 60 L85 70Z" fill="#1E6B45" />
      <path d="M98 70 L98 60 Q103 54 108 60 L108 70Z" fill="#1E6B45" />
      {/* Main door */}
      <path d="M70 100 L70 78 Q80 68 90 78 L90 100Z" fill="#1E6B45" />
    </svg>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

export function PrayerBannerSkeleton() {
  return (
    <div className="mx-4 mt-4 rounded-2xl overflow-hidden animate-pulse md:mx-0">
      <div className="h-52" style={{ background: 'rgba(30,107,69,0.15)' }} />
      <div className="h-14" style={{ background: 'var(--surface-raised)', borderTop: '1px solid var(--border)' }} />
    </div>
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
            { name: 'subuh',   label: 'Subuh',   labelAr: 'الفجر',  time: times.subuh },
            { name: 'zohor',   label: 'Zohor',   labelAr: 'الظهر',  time: times.zohor },
            { name: 'asar',    label: 'Asar',    labelAr: 'العصر',  time: times.asar },
            { name: 'maghrib', label: 'Maghrib', labelAr: 'المغرب', time: times.maghrib },
            { name: 'isyak',   label: 'Isyak',   labelAr: 'العشاء', time: times.isyak },
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
      const cached = JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') as {
        date?: string; prayers?: { name: string; label: string; time: string }[]; district?: string
      }
      if (cached.date === today && Array.isArray(cached.prayers)) {
        const enriched: Prayer[] = cached.prayers.map((p) => ({
          ...p,
          labelAr: ARABIC_NAMES[p.name] ?? '',
        }))
        setPrayers(enriched)
        setState(getNextPrayer(enriched))
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="mx-4 mt-4 rounded-2xl overflow-hidden md:mx-0 md:mt-0"
      style={{ boxShadow: '0 8px 32px rgba(15,61,38,0.35)' }}
    >
      {/* ── Hero ────────────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-5 pb-6"
        style={{ background: 'linear-gradient(135deg, #1E6B45 0%, #0F3D26 100%)' }}
      >
        <MosqueSilhouette />

        <div className="relative z-10">
          {/* Top row: label + location */}
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,0.50)' }}
            >
              Solat Seterusnya
            </span>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                try { localStorage.removeItem(LS_KEY) } catch {}
                detectLocation()
              }}
              disabled={isLocating}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium transition-opacity"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.20)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {isLocating ? (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/50 border-t-transparent animate-spin block"
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <MapPin size={10} strokeWidth={2.2} />
              )}
              {locationLabel ?? (isLocating ? '' : 'Lokasi')}
            </motion.button>
          </div>

          {/* Arabic prayer name */}
          <p
            className="leading-none mb-1 text-right"
            dir="rtl"
            style={{
              fontFamily: 'var(--font-amiri)',
              fontSize: '20px',
              color: '#C9A84C',
            }}
          >
            {prayer.labelAr}
          </p>

          {/* Malay prayer name */}
          <h2
            className="leading-none mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '36px',
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            {prayer.label}
          </h2>

          {/* Prayer time — 52px monospace hero */}
          <p
            className="leading-none mb-3 tabular-nums"
            style={{
              fontFamily: 'var(--font-jakarta), monospace',
              fontSize: '52px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-1px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {prayer.time}
          </p>

          {/* Countdown pill — glass-surface */}
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.20)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
              style={{ background: '#4ADE80' }}
            />
            <span
              className="text-[13px] font-semibold tabular-nums"
              style={{ color: 'rgba(255,255,255,0.92)' }}
            >
              {formatCountdown(minutesLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Prayer times strip ──────────────────────────────────── */}
      <div
        className="flex justify-between px-2 py-3"
        style={{ background: 'var(--surface-raised)', borderTop: '1px solid var(--border)' }}
      >
        {prayers.map((p, i) => {
          const isNext = i === nextIndex
          const isPast = !isNext && i < nextIndex
          return (
            <div
              key={p.name}
              className="flex flex-col items-center gap-1 flex-1 px-1 py-1.5 rounded-xl transition-all"
              style={isNext ? { background: 'var(--primary-muted)' } : {}}
            >
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{
                  color: isNext ? 'var(--primary)' : isPast ? 'var(--text-disabled)' : 'var(--text-secondary)',
                  fontWeight: isNext ? 700 : 400,
                }}
              >
                {STRIP_SHORT[p.name]}
              </span>
              <div
                className="w-1 h-1 rounded-full"
                style={{
                  background: isNext ? 'var(--primary)' : isPast ? 'var(--text-disabled)' : 'var(--border-strong)',
                }}
              />
              <span
                className="text-[11px] tabular-nums"
                style={{
                  color: isNext ? 'var(--primary)' : isPast ? 'var(--text-disabled)' : 'var(--text-secondary)',
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
