import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { DoaContent } from '@/components/doa/DoaContent'
import type { DoaWishItem } from '@/components/doa/DoaContent'
import type { FollowedMosque } from '@/components/home/MosqueSwitcher'

export const metadata = { title: 'Doa Bersama' }

export default async function DoaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Followed mosques (for filter + post selector) ────────────────── */
  const { data: follows } = await supabase
    .from('jemaah_follows')
    .select('mosque_id, is_primary, masjid(id, name, slug, theme, jemaah_count)')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })

  const mosques: FollowedMosque[] = (follows ?? []).flatMap((f) => {
    const m = f.masjid as {
      id: string; name: string; slug: string
      theme: Record<string, string>; jemaah_count: number
    } | null
    if (!m) return []
    return [{
      id: m.id,
      name: m.name,
      slug: m.slug,
      theme: {
        primary: m.theme?.primary ?? '#102937',
        accent: m.theme?.accent ?? '#f9744b',
        logo_url: m.theme?.logo_url ?? null,
      },
      is_primary: f.is_primary ?? false,
      jemaah_count: m.jemaah_count ?? 0,
    }]
  })

  /* ── Doa wishes (public feed, newest first) ───────────────────────── */
  const { data: rawWishes } = await supabase
    .from('doa_wishes')
    .select('id, doa_text, is_anonymous, author_name, created_at, mosque_id, masjid(name, theme)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  const wishIds = (rawWishes ?? []).map((w) => w.id)

  /* ── Aamiin counts + user's own aamiin ────────────────────────────── */
  const [{ data: allAamiin }, { data: myAamiin }] = await Promise.all([
    wishIds.length > 0
      ? supabase.from('doa_aamiin').select('doa_wish_id').in('doa_wish_id', wishIds)
      : Promise.resolve({ data: [] }),
    wishIds.length > 0
      ? supabase.from('doa_aamiin').select('doa_wish_id').eq('user_id', user.id).in('doa_wish_id', wishIds)
      : Promise.resolve({ data: [] }),
  ])

  const countMap: Record<string, number> = {}
  for (const row of allAamiin ?? []) {
    countMap[row.doa_wish_id] = (countMap[row.doa_wish_id] ?? 0) + 1
  }
  const myAaminedSet = new Set((myAamiin ?? []).map((r) => r.doa_wish_id))

  const wishes: DoaWishItem[] = (rawWishes ?? []).map((w) => {
    const mosque = w.masjid as { name: string; theme: Record<string, string> } | null
    return {
      id: w.id,
      doaText: w.doa_text,
      isAnonymous: w.is_anonymous ?? false,
      authorName: w.author_name ?? null,
      mosqueId: w.mosque_id ?? null,
      mosqueName: mosque?.name ?? null,
      mosqueColor: mosque?.theme?.primary ?? '#102937',
      aaminCount: countMap[w.id] ?? 0,
      userHasAamined: myAaminedSet.has(w.id),
      createdAt: w.created_at,
    }
  })

  return (
    <AppShell title="Doa">
      <DoaContent mosques={mosques} wishes={wishes} />
    </AppShell>
  )
}
