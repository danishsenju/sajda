import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'

export const metadata = { title: 'Masjid' }

export default async function MasjidPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <AppShell title="Masjid">
      <div className="px-4 py-6 md:px-0">
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Cari Masjid
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Segera hadir — carian & profil masjid.
        </p>
      </div>
    </AppShell>
  )
}
