import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MasjidContent } from '@/components/masjid/MasjidContent'

export const metadata = { title: 'Masjid' }

export default async function MasjidPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Followed mosques for the Diikuti section ── */
  const { data: follows } = await (supabase as any)
    .from('jemaah_follows')
    .select('mosque_id, mosques(id, name, theme_color)')
    .eq('user_id', user.id)

  const followed = ((follows ?? []) as any[])
    .map((f: any) => f.mosques)
    .filter(Boolean)
    .map((m: any, i: number) => ({
      id: m.id,
      name: m.name,
      initials: m.name.charAt(0).toUpperCase(),
      color: m.theme_color ?? ['#2D6A4F', '#C9A84C', '#4B6CB7'][i % 3],
    }))

  return <MasjidContent followedMosques={followed.length > 0 ? followed : undefined} />
}
