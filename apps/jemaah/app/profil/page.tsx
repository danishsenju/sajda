import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'

export const metadata = { title: 'Profil' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <AppShell title="Profil">
      <div className="px-4 py-6 md:px-0">
        <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Profil Saya
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          {user.email}
        </p>
      </div>
    </AppShell>
  )
}
