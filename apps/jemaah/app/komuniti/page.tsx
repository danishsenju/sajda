import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { KomunitiContent } from '@/components/komuniti/KomunitiContent'

export const metadata = { title: 'Komuniti' }

export default async function KomunitiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  /* ── Followed mosques ── */
  const { data: follows } = await (supabase as any)
    .from('jemaah_follows')
    .select('mosque_id, mosques(id, name, theme_color)')
    .eq('user_id', user.id)

  const mosques = ((follows ?? []) as any[])
    .map((f: any) => f.mosques)
    .filter(Boolean)

  /* ── Keperluan feed ── */
  const mosqueIds: string[] = mosques.map((m: any) => m.id)

  const baseQuery = (supabase as any)
    .from('keperluan')
    .select('id, author_name, mosque_id, category, title, description, status, helpers_count, created_at')
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: requests } = mosqueIds.length > 0
    ? await baseQuery.in('mosque_id', mosqueIds)
    : await baseQuery

  /* ── User's bantu records ── */
  const requestIds: string[] = ((requests ?? []) as any[]).map((r: any) => r.id)

  const { data: myHelps } =
    requestIds.length > 0
      ? await (supabase as any)
          .from('keperluan_helpers')
          .select('keperluan_id')
          .eq('user_id', user.id)
          .in('keperluan_id', requestIds)
      : { data: [] }

  const myHelpIds: string[] = ((myHelps ?? []) as any[]).map((h: any) => h.keperluan_id)

  /* ── Enrich with mosque name/color ── */
  const mosqueMap = Object.fromEntries(mosques.map((m: any) => [m.id, m]))
  const enriched = ((requests ?? []) as any[]).map((r: any) => ({
    ...r,
    mosque_name:  r.mosque_id ? (mosqueMap[r.mosque_id]?.name ?? null)        : null,
    mosque_color: r.mosque_id ? (mosqueMap[r.mosque_id]?.theme_color ?? null) : null,
  }))

  return (
    <AppShell title="Komuniti">
      <KomunitiContent
        mosques={mosques}
        initialRequests={enriched}
        myHelpIds={myHelpIds}
      />
    </AppShell>
  )
}
