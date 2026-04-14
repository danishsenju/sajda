import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert profile — handles both Google OAuth and email confirmation flows
      const displayName =
        data.user.user_metadata?.display_name ||
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0] ||
        'Pengguna'

      await supabase
        .from('jemaah_profiles')
        .upsert(
          {
            user_id: data.user.id,
            display_name: displayName,
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
            is_public: true,
          },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
