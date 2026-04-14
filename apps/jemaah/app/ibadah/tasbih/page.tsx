import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { TasbihCounter } from '@/components/ibadah/TasbihCounter'

export const metadata = { title: 'Tasbih & Zikir' }

export default async function TasbihPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AppShell title="Tasbih"><TasbihCounter /></AppShell>
}
