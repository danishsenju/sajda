import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MasjidContent } from '@/components/masjid/MasjidContent'

export const metadata = { title: 'Masjid' }

export default async function MasjidPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── All mosques ── */
  const { data: mosquesData } = await (supabase as any)
    .from('masjid')
    .select('id, name, slug, zone_code, jemaah_count')
    .order('name')

  const mosques = ((mosquesData ?? []) as any[]).map((m) => ({
    id:            String(m.id),
    name:          String(m.name),
    slug:          String(m.slug ?? m.id),
    zone_code:     m.zone_code ?? null,
    jemaah_count:  Number(m.jemaah_count ?? 0),
  }))

  /* ── Followed IDs ── */
  const { data: followsData } = await (supabase as any)
    .from('jemaah_follows')
    .select('masjid_id')
    .eq('user_id', user.id)

  const followedIds: string[] = ((followsData ?? []) as any[])
    .map((f) => f.masjid_id)
    .filter(Boolean)
    .map(String)

  return <MasjidContent mosques={mosques} followedIds={followedIds} />
}
