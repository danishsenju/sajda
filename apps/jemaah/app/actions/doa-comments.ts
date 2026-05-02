'use server'

import { createClient } from '@/lib/supabase/server'
import { containsProfanity, PROFANITY_ERROR_MSG } from '@/lib/utils/profanity'

export type DoaComment = {
  id: string
  doaWishId: string
  authorName: string | null
  isAnonymous: boolean
  commentText: string
  createdAt: string
  isOwn: boolean
}

export async function getComments(
  doaWishId: string
): Promise<DoaComment[] | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sila log masuk.' }

  const { data, error } = await supabase
    .from('doa_comments')
    .select('id, doa_wish_id, author_name, is_anonymous, comment_text, created_at, user_id')
    .eq('doa_wish_id', doaWishId)
    .is('deleted_at', null)
    .eq('is_flagged', false)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message }

  return (data ?? []).map((row) => ({
    id: row.id,
    doaWishId: row.doa_wish_id,
    authorName: row.is_anonymous ? null : row.author_name,
    isAnonymous: row.is_anonymous,
    commentText: row.comment_text,
    createdAt: row.created_at,
    isOwn: row.user_id === user.id,
  }))
}

export async function postComment({
  doaWishId,
  commentText,
  isAnonymous,
}: {
  doaWishId: string
  commentText: string
  isAnonymous: boolean
}): Promise<{ id: string; authorName: string | null; createdAt: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sila log masuk.' }

  const trimmed = commentText.trim()
  if (trimmed.length === 0) return { error: 'Komen tidak boleh kosong.' }
  if (trimmed.length > 200) return { error: 'Komen terlalu panjang (maks 200 huruf).' }
  if (containsProfanity(trimmed)) return { error: PROFANITY_ERROR_MSG }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Jemaah'

  const authorName = isAnonymous ? null : displayName

  const { data, error } = await supabase
    .from('doa_comments')
    .insert({
      doa_wish_id: doaWishId,
      user_id: user.id,
      comment_text: trimmed,
      is_anonymous: isAnonymous,
      author_name: authorName,
    })
    .select('id, created_at')
    .single()

  if (error) return { error: error.message }
  return { id: data.id, authorName, createdAt: data.created_at }
}

export async function deleteComment(
  commentId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sila log masuk.' }

  const { error } = await supabase
    .from('doa_comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { ok: true }
}
