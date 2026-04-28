import { NextResponse } from 'next/server'

/**
 * Proxy for api.quran.com/api/v4/verses/by_page/{page}
 * – Avoids potential browser CORS issues
 * – Caches response in Next.js fetch cache for 7 days (Quran text is immutable)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pageNum: string }> }
) {
  const { pageNum } = await params
  const page = Number(pageNum)

  if (!page || page < 1 || page > 604) {
    return NextResponse.json({ error: 'Halaman tidak sah (1–604)' }, { status: 400 })
  }

  const upstream =
    `https://api.quran.com/api/v4/verses/by_page/${page}` +
    `?fields=text_uthmani,chapter_id,verse_number,verse_key,juz_number` +
    `&translations=39` +
    `&per_page=50`

  try {
    const res = await fetch(upstream, {
      next: { revalidate: 604800 }, // 7 days
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream API error' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    })
  } catch {
    return NextResponse.json({ error: 'Gagal menghubungi server Al-Quran' }, { status: 502 })
  }
}
