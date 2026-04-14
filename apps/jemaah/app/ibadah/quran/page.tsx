import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { QuranBrowser } from '@/components/ibadah/QuranBrowser'

export const metadata = { title: 'Al-Quran' }

export default async function QuranPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AppShell title="Al-Quran"><QuranBrowser /></AppShell>
}
