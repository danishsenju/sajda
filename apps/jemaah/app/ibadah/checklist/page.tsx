import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { DeenChecklist } from '@/components/ibadah/DeenChecklist'

export const metadata = { title: 'Senarai Semak Harian' }

export default async function ChecklistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AppShell title="Checklist Deen"><DeenChecklist /></AppShell>
}
