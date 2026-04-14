'use server'

import { createClient } from '@/lib/supabase/server'

export async function toggleAamiin(
  doaWishId: string
): Promise<{ aamiin: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sila log masuk.' }

  const { data: existing } = await supabase
    .from('doa_aamiin')
    .select('id')
    .eq('doa_wish_id', doaWishId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('doa_aamiin').delete().eq('id', existing.id)
    return { aamiin: false }
  }

  await supabase.from('doa_aamiin').insert({ doa_wish_id: doaWishId, user_id: user.id })
  return { aamiin: true }
}

export async function postDoa({
  doaText,
  isAnonymous,
  mosqueId,
}: {
  doaText: string
  isAnonymous: boolean
  mosqueId: string | null
}): Promise<{ id: string; authorName: string | null } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sila log masuk.' }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Jemaah'

  const authorName = isAnonymous ? null : displayName

  const { data, error } = await supabase
    .from('doa_wishes')
    .insert({
      user_id: user.id,
      doa_text: doaText.trim(),
      is_anonymous: isAnonymous,
      author_name: authorName,
      mosque_id: mosqueId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: data.id, authorName }
}
