import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IbadahHub } from '@/components/ibadah/IbadahHub'

export const metadata = { title: 'Ibadah' }

export default async function IbadahPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <IbadahHub />
}
