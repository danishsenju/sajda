import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { TazkirahHarian } from '@/components/ibadah/TazkirahHarian'
import { getTodayTazkirah } from '@/app/actions/tazkirah'

export const metadata = { title: 'Tazkirah Harian' }

export default async function TazkirahPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tazkirah = await getTodayTazkirah()

  return <AppShell title="Tazkirah"><TazkirahHarian data={tazkirah} /></AppShell>
}
