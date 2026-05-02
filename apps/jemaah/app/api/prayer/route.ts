import { NextRequest, NextResponse } from 'next/server'
import { ZONE_COORDINATES } from '@/lib/prayer-zones'

type PrayerTimes = {
  subuh: string
  zohor: string
  asar: string
  maghrib: string
  isyak: string
}

function unixToKLTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

async function fromWaktuSolat(zone: string): Promise<PrayerTimes | null> {
  const res = await fetch(`https://api.waktusolat.app/v2/solat/${zone}`, {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null

  const data = await res.json()
  const today = new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })
  const dayOfMonth = new Date(today).getDate()

  const entry = (data?.prayers as Array<{ day: number; fajr: number; dhuhr: number; asr: number; maghrib: number; isha: number }> | undefined)
    ?.find((p) => p.day === dayOfMonth)

  if (!entry) return null

  return {
    subuh:   unixToKLTime(entry.fajr),
    zohor:   unixToKLTime(entry.dhuhr),
    asar:    unixToKLTime(entry.asr),
    maghrib: unixToKLTime(entry.maghrib),
    isyak:   unixToKLTime(entry.isha),
  }
}

async function fromAlAdhan(zone: string): Promise<PrayerTimes | null> {
  const coords = ZONE_COORDINATES[zone] ?? ZONE_COORDINATES['WLY01']!
  const timestamp = Math.floor(Date.now() / 1000)

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${coords.lat}&longitude=${coords.lng}&method=11`,
    { next: { revalidate: 3600 }, headers: { Accept: 'application/json' } }
  )
  if (!res.ok) return null

  const data = await res.json()
  const t = data?.data?.timings
  if (!t) return null

  return {
    subuh:   t.Fajr,
    zohor:   t.Dhuhr,
    asar:    t.Asr,
    maghrib: t.Maghrib,
    isyak:   t.Isha,
  }
}

export async function GET(req: NextRequest) {
  const zone = req.nextUrl.searchParams.get('zone') ?? 'WLY01'

  const times = await fromWaktuSolat(zone) ?? await fromAlAdhan(zone)

  if (!times) {
    return NextResponse.json({ error: 'Gagal mendapatkan waktu solat' }, { status: 502 })
  }

  return NextResponse.json(times, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
