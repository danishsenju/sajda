'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Upsert a jemaah_profiles row for the currently authenticated user.
 * Called after email/password signup (when session is immediately available)
 * and after OAuth callback.
 */
export async function createProfile(displayName: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesi tidak dijumpai.' }

  const { error } = await supabase
    .from('jemaah_profiles')
    .upsert(
      {
        user_id: user.id,
        display_name: displayName.trim(),
        is_public: true,
      },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )

  if (error) return { error: error.message }
  return {}
}
