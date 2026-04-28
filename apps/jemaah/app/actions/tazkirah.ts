'use server'

import { getTodayTazkirahFromData } from '@/lib/tazkirah-data'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type TazkirahItem = {
  id: string
  title: string
  content_malay: string
  theme: string | null
  category: string
  color: string
  arabic_text: string | null
  arabic_ref: string | null
  muhasabah: string
  hadis_ref: string | null
  display_date: string
}

/* ─── getTodayTazkirah ───────────────────────────────────────────────────── */

export async function getTodayTazkirah(): Promise<TazkirahItem | null> {
  return getTodayTazkirahFromData()
}
