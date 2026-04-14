'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type PostKeperluan = {
  title: string
  description: string | null
  category: string
  mosqueId: string | null
  isAnonymous: boolean
}

export async function postKeperluan({ title, description, category, mosqueId, isAnonymous }: PostKeperluan) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sila log masuk' }

  const displayName = isAnonymous
    ? null
    : (
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split('@')[0] ??
        'Jemaah'
      )

  const { data, error } = await (supabase as any)
    .from('keperluan')
    .insert({
      author_id: user.id,
      author_name: displayName,
      mosque_id: mosqueId || null,
      category,
      title,
      description: description || null,
    })
    .select('id, author_name')
    .single()

  if (error) return { error: error.message as string }
  revalidatePath('/komuniti')
  return { id: data.id as string, authorName: data.author_name as string | null }
}

export async function toggleBantu(keperluanId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sila log masuk' }

  const { data: existing } = await (supabase as any)
    .from('keperluan_helpers')
    .select('keperluan_id')
    .eq('keperluan_id', keperluanId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await (supabase as any)
      .from('keperluan_helpers')
      .delete()
      .eq('keperluan_id', keperluanId)
      .eq('user_id', user.id)
    return { action: 'removed' as const }
  } else {
    await (supabase as any)
      .from('keperluan_helpers')
      .insert({ keperluan_id: keperluanId, user_id: user.id })
    return { action: 'added' as const }
  }
}
