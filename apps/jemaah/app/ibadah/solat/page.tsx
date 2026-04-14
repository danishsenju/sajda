import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { SolatTracker } from '@/components/ibadah/SolatTracker'

export const metadata = { title: 'Waktu Solat & Streak' }

export default async function SolatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AppShell title="Solat"><SolatTracker /></AppShell>
}
