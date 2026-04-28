'use server'

import { createClient } from '@/lib/supabase/server'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type DailyHadis = {
  id: string
  number: number
  theme: string
  source: string
  arabic_text: string
  malay_text: string
  english_text: string
}

/* ─── getDailyHadis ──────────────────────────────────────────────────────── */
/**
 * Returns today's hadith for the current authenticated user.
 * Uses get_hadith_harian() which assigns a unique daily hadith per user
 * based on a deterministic rotation: (hash(user_id) + days_since_epoch) % 50.
 */
export async function getDailyHadis(): Promise<DailyHadis | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_hadith_harian')
    if (error) throw error
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return null
    return row as DailyHadis
  } catch {
    return null
  }
}
