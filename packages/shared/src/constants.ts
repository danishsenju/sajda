export const MOSQUE_TIERS = {
  surau: { label: 'Surau', priceMonthly: 4900 },     // RM 49
  kariah: { label: 'Kariah', priceMonthly: 14900 },  // RM 149
  komuniti: { label: 'Komuniti', priceMonthly: 34900 }, // RM 349
} as const

export const SUPPORTED_LOCALES = ['ms', 'en'] as const
export const DEFAULT_LOCALE = 'ms' as const

// Supabase realtime channels
export const REALTIME_CHANNELS = {
  MOSQUE_EVENTS: 'mosque-events',
  JEMAAH_PRESENCE: 'jemaah-presence',
} as const
