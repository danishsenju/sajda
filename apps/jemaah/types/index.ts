// Re-export shared types so app code only imports from one place
export type { Database, Mosque, MosqueTheme, MosqueTier, JemaahProfile } from '@sajda/shared'

// App-specific types
export interface PrayerTime {
  name: string
  time: string // HH:mm
  isNext: boolean
}

export interface Announcement {
  id: string
  mosque_id: string
  title: string
  body: string
  created_at: string
}
