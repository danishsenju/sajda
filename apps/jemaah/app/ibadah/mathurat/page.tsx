import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { MathuratReader } from '@/components/ibadah/MathuratReader'

export const metadata = { title: 'Al-Mathurat' }

export default async function MathuratPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AppShell title="Al-Mathurat"><MathuratReader /></AppShell>
}
