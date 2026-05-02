import { NextRequest, NextResponse } from 'next/server'
import { resolveZone } from '@/lib/prayer-zones'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  try {
    const geo = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: { 'Accept-Language': 'ms,en', 'User-Agent': 'SAJDA/1.0' },
        next: { revalidate: 86400 }, // cache geocode result for 24h
      }
    )
    const data = await geo.json()
    const addr = data?.address ?? {}

    const district: string = addr.district ?? addr.city ?? addr.town ?? addr.county ?? ''
    const state: string    = addr.state ?? ''
    const displayName: string =
      addr.district ?? addr.city ?? addr.town ?? addr.state ?? ''

    const zone = resolveZone(district, state)

    return NextResponse.json({ zone, district: displayName, state }, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return NextResponse.json({ error: 'Gagal mengesan lokasi' }, { status: 502 })
  }
}
