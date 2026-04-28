import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { HadisHarian } from '@/components/ibadah/HadisHarian'
import { getDailyHadis } from '@/app/actions/hadis'

export const metadata = { title: 'Hadis Harian' }

export default async function HadisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hadis = await getDailyHadis()

  return <AppShell title="Hadis Harian"><HadisHarian data={hadis} /></AppShell>
}
