import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { QiblaCompass } from '@/components/ibadah/QiblaCompass'

export const metadata = { title: 'Penentu Kiblat' }

export default async function QiblaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AppShell title="Kiblat"><QiblaCompass /></AppShell>
}
