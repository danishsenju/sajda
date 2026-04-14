'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ─── Constants ──────────────────────────────────────────────────────────── */

const KAABA = { lat: 21.4225, lng: 39.8262 }
const toRad = (d: number) => (d * Math.PI) / 180
const toDeg = (r: number) => (r * 180) / Math.PI

function calcQibla(lat: number, lng: number): number {
  const φ1 = toRad(lat)
  const φ2 = toRad(KAABA.lat)
  const Δλ = toRad(KAABA.lng - lng)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

type Status = 'idle' | 'loading' | 'ready' | 'denied' | 'error'

/* ─── QiblaCompass ───────────────────────────────────────────────────────── */

export function QiblaCompass() {
  const [status, setStatus] = useState<Status>('idle')
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null)
  const [deviceHeading, setDeviceHeading] = useState(0)
  const [cityName, setCityName] = useState<string | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const orientationCleanupRef = useRef<(() => void) | null>(null)

  /* ── Device orientation listener ──────────────────────────────────── */
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
      const heading = ios != null ? ios : e.alpha != null ? (360 - e.alpha) % 360 : 0
      setDeviceHeading(heading)
    }

    window.addEventListener('deviceorientation', handler, true)
    orientationCleanupRef.current = () => window.removeEventListener('deviceorientation', handler, true)
    return orientationCleanupRef.current
  }, [])

  /* ── Geolocation ───────────────────────────────────────────────────── */
  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus('error')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const bearing = calcQibla(latitude, longitude)
        setQiblaBearing(bearing)

        // Distance to Kaaba (Haversine)
        const R = 6371
        const dLat = toRad(KAABA.lat - latitude)
        const dLon = toRad(KAABA.lng - longitude)
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(latitude)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLon / 2) ** 2
        const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        setDistance(Math.round(km))

        setStatus('ready')
        fetchCity(latitude, longitude)
      },
      (err) => setStatus(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  async function fetchCity(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        { headers: { 'Accept-Language': 'ms,en' } }
      )
      const data = await res.json()
      const name =
        data.address?.city ??
        data.address?.town ??
        data.address?.municipality ??
        data.address?.state ??
        null
      setCityName(name)
    } catch {}
  }

  /* ── Derived angles ────────────────────────────────────────────────── */
  const needleAngle = qiblaBearing != null ? (qiblaBearing - deviceHeading + 360) % 360 : 0
  const aligned = qiblaBearing != null && Math.abs(needleAngle) < 8

  const CARDINALS = [
    { label: 'U', deg: 0 },
    { label: 'TL', deg: 45 },
    { label: 'T', deg: 90 },
    { label: 'TG', deg: 135 },
    { label: 'S', deg: 180 },
    { label: 'BD', deg: 225 },
    { label: 'B', deg: 270 },
    { label: 'BL', deg: 315 },
  ]

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-10">

      {/* ── Location badge ─────────────────────────────────────────── */}
      {cityName && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="10" r="3" stroke="var(--accent)" strokeWidth="2" />
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="var(--accent)" strokeWidth="1.8" />
          </svg>
          {cityName}
          {distance && <span style={{ color: 'var(--text-dim)' }}>· {distance.toLocaleString()} km ke Kaabah</span>}
        </div>
      )}

      {/* ── Compass ────────────────────────────────────────────────── */}
      <div
        className="relative w-[300px] h-[300px] rounded-full"
        style={{
          background: 'var(--surface-2)',
          boxShadow: '0 12px 48px rgba(16,41,55,0.14), inset 0 1px 6px rgba(0,0,0,0.05)',
        }}
      >
        {/* ── Compass rose (rotates with device) ─────────────────── */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -deviceHeading }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        >
          {/* Tick marks */}
          <svg width="300" height="300" viewBox="0 0 300 300" className="absolute inset-0">
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = i * 5
              const rad = toRad(angle)
              const isMajor = angle % 30 === 0
              const r1 = isMajor ? 126 : 132
              const r2 = 138
              return (
                <line
                  key={i}
                  x1={150 + r1 * Math.sin(rad)}
                  y1={150 - r1 * Math.cos(rad)}
                  x2={150 + r2 * Math.sin(rad)}
                  y2={150 - r2 * Math.cos(rad)}
                  stroke={isMajor ? 'var(--border-strong)' : 'var(--border)'}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                />
              )
            })}
          </svg>

          {/* Cardinal labels */}
          {CARDINALS.map(({ label, deg }) => {
            const rad = toRad(deg)
            const r = 113
            const x = 150 + r * Math.sin(rad)
            const y = 150 - r * Math.cos(rad)
            const isMajor = deg % 90 === 0
            return (
              <div
                key={label}
                className="absolute text-center pointer-events-none"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  color: deg === 0 ? 'var(--accent)' : 'var(--text-dim)',
                  fontWeight: isMajor ? 700 : 400,
                  fontSize: isMajor ? 13 : 9,
                }}
              >
                {label}
              </div>
            )
          })}
        </motion.div>

        {/* ── Qibla needle (independent rotation) ────────────────── */}
        {status === 'ready' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 70, damping: 16 }}
          >
            <svg width="40" height="240" viewBox="0 0 40 240" className="-translate-y-[20px]">
              {/* Kaabah icon */}
              <rect x="10" y="4" width="20" height="20" rx="3" fill={aligned ? '#16a34a' : 'var(--accent)'} />
              <rect x="14" y="8" width="12" height="12" rx="1" fill="rgba(0,0,0,0.25)" />
              {/* Needle body (up) */}
              <polygon points="20,26 16,110 24,110" fill={aligned ? '#16a34a' : 'var(--accent)'} opacity="0.95" />
              {/* Tail (down) */}
              <polygon points="20,155 16,110 24,110" fill="var(--surface-3)" />
            </svg>
          </motion.div>
        )}

        {/* ── Centre pin ─────────────────────────────────────────── */}
        <div
          className="absolute left-1/2 top-1/2 w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
          style={{ background: 'var(--primary)', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>
      </div>

      {/* ── Bearing info ───────────────────────────────────────────── */}
      {status === 'ready' && qiblaBearing != null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-center"
        >
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: aligned ? '#16a34a' : 'var(--text)', fontFamily: 'var(--font-playfair)' }}
          >
            {Math.round(qiblaBearing)}°
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>
            Arah kiblat dari kedudukan anda
          </p>
          {aligned && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: '#dcfce7', color: '#16a34a' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Menghadap Kiblat
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── CTAs / status ──────────────────────────────────────────── */}
      <div className="mt-6 w-full max-w-xs text-center">
        {status === 'idle' && (
          <>
            <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
              Izinkan akses lokasi untuk mendapatkan arah kiblat yang tepat berdasarkan kedudukan anda.
            </p>
            <motion.button
              onClick={requestLocation}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 16px rgba(249,116,75,0.35)' }}
            >
              Dapatkan Arah Kiblat
            </motion.button>
          </>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 rounded-full"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
            />
            Sedang menentukan lokasi...
          </div>
        )}

        {status === 'denied' && (
          <>
            <p className="text-sm mb-3" style={{ color: 'var(--error)' }}>
              Akses lokasi ditolak. Benarkan akses lokasi dalam tetapan penyemak imbas anda.
            </p>
            <button
              onClick={requestLocation}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
            >
              Cuba Semula
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-sm mb-3" style={{ color: 'var(--error)' }}>
              Tidak dapat menentukan lokasi. Pastikan GPS anda aktif.
            </p>
            <button
              onClick={requestLocation}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
            >
              Cuba Semula
            </button>
          </>
        )}

        {status === 'ready' && (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Pusing telefon sehingga anak panah menghala lurus ke atas.
          </p>
        )}
      </div>
    </div>
  )
}
