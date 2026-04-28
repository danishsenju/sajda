import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/ui/AppShell'
import { QuranPageReader } from '@/components/ibadah/QuranPageReader'
import { getQuranBookmark } from '@/app/actions/quran'

export const metadata = { title: 'Al-Quran' }

export default async function QuranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // URL param takes priority over saved bookmark
  const urlPage = params.page ? Number(params.page) : null
  const bookmark = urlPage ? null : await getQuranBookmark()

  const initialPage =
    (urlPage && urlPage >= 1 && urlPage <= 604 ? urlPage : null) ??
    bookmark?.page_number ??
    1

  return (
    <AppShell title="Al-Quran">
      <QuranPageReader initialPage={initialPage} />
    </AppShell>
  )
}
