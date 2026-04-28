'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type QuranBookmark = {
  page_number: number
  verse_key: string | null
}

/* ─── saveQuranBookmark ──────────────────────────────────────────────────── */

export async function saveQuranBookmark({
  pageNumber,
  verseKey,
}: {
  pageNumber: number
  verseKey?: string
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sila log masuk' }

  const { error } = await (supabase as any)
    .from('quran_bookmarks')
    .upsert(
      {
        user_id:     user.id,
        page_number: pageNumber,
        verse_key:   verseKey ?? null,
        updated_at:  new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) return { error: error.message as string }

  revalidatePath('/')
  return { success: true }
}

/* ─── getQuranBookmark ───────────────────────────────────────────────────── */

export async function getQuranBookmark(): Promise<QuranBookmark | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await (supabase as any)
    .from('quran_bookmarks')
    .select('page_number, verse_key')
    .eq('user_id', user.id)
    .maybeSingle()

  return (data as QuranBookmark | null) ?? null
}
