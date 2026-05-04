'use server'

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

type PrayerKey = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak'

function todayKL(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })
}

async function recalcStreak(supabase: SupabaseClient, userId: string) {
  // Fetch all dates where user logged all 5 prayers
  const { data } = await supabase
    .from('solat_logs')
    .select('log_date')
    .eq('user_id', userId)

  if (!data) return

  // Count prayers per date
  const countByDate: Record<string, number> = {}
  for (const row of data) {
    countByDate[row.log_date] = (countByDate[row.log_date] ?? 0) + 1
  }

  // Sort complete days (5/5) descending
  const completeDays = Object.entries(countByDate)
    .filter(([, count]) => count === 5)
    .map(([date]) => date)
    .sort((a, b) => b.localeCompare(a))

  const today = todayKL()
  const todayComplete = completeDays[0] === today

  // Count consecutive days ending yesterday (or today if complete)
  let streak = todayComplete ? 1 : 0
  const startIdx = todayComplete ? 1 : 0

  for (let i = startIdx; i < completeDays.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - (todayComplete ? i : i + 1))
    const expectedStr = expected.toISOString().slice(0, 10)
    if (completeDays[i] === expectedStr) {
      streak++
    } else {
      break
    }
  }

  // Fetch existing longest streak
  const { data: existing } = await supabase
    .from('solat_streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .maybeSingle()

  const longest = Math.max(streak, existing?.longest_streak ?? 0)

  await supabase.from('solat_streaks').upsert(
    {
      user_id: userId,
      current_streak: streak,
      longest_streak: longest,
      last_logged_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
}

export async function logSolat(
  prayer: PrayerKey,
  isJemaah: boolean
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sila log masuk.' }

  const { error } = await supabase.from('solat_logs').upsert(
    {
      user_id: user.id,
      prayer,
      is_jemaah: isJemaah,
      log_date: todayKL(),
      logged_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,prayer,log_date', ignoreDuplicates: false }
  )

  if (error) return { error: error.message }

  await recalcStreak(supabase, user.id)
  return { ok: true }
}

export async function removeSolatLog(
  prayer: PrayerKey
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sila log masuk.' }

  const { error } = await supabase
    .from('solat_logs')
    .delete()
    .eq('user_id', user.id)
    .eq('prayer', prayer)
    .eq('log_date', todayKL())

  if (error) return { error: error.message }

  await recalcStreak(supabase, user.id)
  return { ok: true }
}

export async function getSolatStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { currentStreak: 0, longestStreak: 0 }

  const { data } = await supabase
    .from('solat_streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    currentStreak: data?.current_streak ?? 0,
    longestStreak: data?.longest_streak ?? 0,
  }
}
