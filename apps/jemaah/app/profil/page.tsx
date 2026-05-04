import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfilContent } from '@/components/profil/ProfilContent'
import { getSolatStreak } from '@/app/actions/solat'

export const metadata = { title: 'Profil' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Mosque count ── */
  const { count: mosqueCount } = await (supabase as any)
    .from('jemaah_follows')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  /* ── Doa count ── */
  const { count: doaCount } = await (supabase as any)
    .from('doa')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  /* ── Solat streak ── */
  const { currentStreak } = await getSolatStreak()

  return (
    <ProfilContent
      email={user.email ?? ''}
      name={user.user_metadata?.display_name ?? user.user_metadata?.full_name}
      joinedAt={user.created_at}
      mosqueCount={mosqueCount ?? 0}
      doaCount={doaCount ?? 0}
      streak={currentStreak}
    />
  )
}
