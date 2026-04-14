export type { Database } from './types/database'

export type MosqueTier = 'surau' | 'kariah' | 'komuniti'

export interface Mosque {
  id: string
  name: string
  tier: MosqueTier
  theme?: MosqueTheme
  created_at: string
}

export interface MosqueTheme {
  primary: string
  accent: string
  logo_url?: string
}

export interface JemaahProfile {
  id: string
  user_id: string
  display_name: string
  avatar_url?: string
  created_at: string
}