'use server'

import { createClient } from '@/lib/supabase/server'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type DailyHadis = {
  id: string
  display_date: string
  hadith_number: number | null
  arabic_text: string | null
  english_text: string
  source: string
}

/* ─── API endpoints (fawazahmed0 CDN) ────────────────────────────────────── */

const ENG_RANDOM = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/random.json'
const ARA_BASE   = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari'

/* ─── getDailyHadis ──────────────────────────────────────────────────────── */
/**
 * Returns today's hadith.
 * 1. Checks Supabase hadis_harian_cache for today's entry (best-effort).
 * 2. If missing or table unavailable, fetches from fawazahmed0 API.
 * 3. Tries to cache the result in Supabase (best-effort, never blocks).
 * 4. Returns the API result regardless of whether caching succeeded.
 */
export async function getDailyHadis(): Promise<DailyHadis | null> {
  const today = new Date().toISOString().slice(0, 10)

  /* ── Check Supabase cache (best-effort) ── */
  try {
    const supabase = await createClient()
    const { data: cached } = await (supabase as any)
      .from('hadis_harian_cache')
      .select('*')
      .eq('display_date', today)
      .maybeSingle()

    if (cached) return cached as DailyHadis
  } catch {
    // Cache table may not exist yet — proceed to API
  }

  /* ── Fetch from API ── */
  try {
    const engRes = await fetch(ENG_RANDOM, { cache: 'no-store' })
    if (!engRes.ok) throw new Error(`API ${engRes.status}`)
    const eng = await engRes.json()

    const hadithNumber: number = eng.hadithnumber
    const englishText: string  = (eng.text ?? '').trim()
    if (!englishText) throw new Error('Empty text')

    /* ── Try Arabic edition ── */
    let arabicText: string | null = null
    try {
      const arRes = await fetch(`${ARA_BASE}/${hadithNumber}.min.json`, { cache: 'no-store' })
      if (arRes.ok) {
        const ar = await arRes.json()
        arabicText = (ar.text ?? null) as string | null
      }
    } catch {
      // Arabic is optional
    }

    /* ── Build result object ── */
    const result: DailyHadis = {
      id: `api-${today}`,
      display_date: today,
      hadith_number: hadithNumber,
      arabic_text: arabicText,
      english_text: englishText,
      source: 'Sahih al-Bukhari',
    }

    /* ── Persist to Supabase (best-effort — never blocks the response) ── */
    try {
      const supabase = await createClient()
      const { data: saved } = await (supabase as any)
        .from('hadis_harian_cache')
        .insert({
          display_date:  today,
          hadith_number: hadithNumber,
          arabic_text:   arabicText,
          english_text:  englishText,
          source:        'Sahih al-Bukhari',
        })
        .select()
        .maybeSingle()

      // Return the persisted row if we got one (has real UUID id)
      if (saved) return saved as DailyHadis
    } catch {
      // Cache write failed — return the API result anyway
    }

    return result
  } catch {
    return null
  }
}
