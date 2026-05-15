import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HomeShell } from '@/components/home/HomeShell'
import type { FeedItem } from '@/components/home/FeedCard'
import type { FollowedMosque } from '@/components/home/MosqueSwitcher'
import { getTodayTazkirah } from '@/app/actions/tazkirah'
import { getQuranBookmark } from '@/app/actions/quran'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = supabase as any

  const [profileRes, followsRes] = await Promise.all([
    db.from('jemaah_profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single(),
    db.from('jemaah_follows')
      .select('mosque_id, is_primary, masjid(id, name, slug, theme, jemaah_count)')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false }),
  ])

  const follows: any[] = followsRes.data ?? []
  const profileData: { display_name: string | null; avatar_url: string | null } | null =
    profileRes.data ?? null

  const mosques: FollowedMosque[] = follows.flatMap((f) => {
    const m = f.masjid as {
      id: string; name: string; slug: string
      theme: Record<string, string>; jemaah_count: number
    } | null
    if (!m) return []
    return [{
      id: m.id,
      name: m.name,
      slug: m.slug,
      theme: {
        primary:  m.theme?.primary  ?? '#1E6B45',
        accent:   m.theme?.accent   ?? '#B8860B',
        logo_url: m.theme?.logo_url ?? null,
      },
      is_primary:   f.is_primary   ?? false,
      jemaah_count: m.jemaah_count ?? 0,
    }]
  })

  const feedItems: FeedItem[] = []
  const mosqueIds = mosques.map((m) => m.id)

  if (mosqueIds.length > 0) {
    const { data: announcements } = await db
      .from('announcements')
      .select('id, mosque_id, title, body, is_pinned, published_at, masjid(name, theme)')
      .in('mosque_id', mosqueIds)
      .is('deleted_at', null)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(20)

    for (const ann of (announcements ?? []) as any[]) {
      const mosque = ann.masjid as { name: string; theme: Record<string, string> } | null
      feedItems.push({
        kind:        'announcement',
        id:          ann.id,
        mosqueId:    ann.mosque_id,
        mosqueName:  mosque?.name ?? '',
        mosqueColor: mosque?.theme?.primary ?? '#1E6B45',
        title:       ann.title,
        body:        ann.body,
        isPinned:    ann.is_pinned    ?? false,
        publishedAt: ann.published_at!,
      })
    }
  }

  const [tazkirah, quranBookmark] = await Promise.all([
    getTodayTazkirah(),
    getQuranBookmark(),
  ])

  return (
    <HomeShell
      userProfile={{
        display_name: profileData?.display_name ?? null,
        avatar_url:   profileData?.avatar_url   ?? null,
      }}
      mosques={mosques}
      feed={feedItems}
      tazkirah={tazkirah}
      quranBookmark={quranBookmark}
    />
  )
}
