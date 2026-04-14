export const APP_NAME = 'SAJDA'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sajda.app'

export const PRAYER_NAMES = ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'] as const
export type PrayerName = (typeof PRAYER_NAMES)[number]

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Utama' },
  { href: '/solat', label: 'Solat' },
  { href: '/masjid', label: 'Masjid' },
  { href: '/sedekah', label: 'Sedekah' },
] as const
