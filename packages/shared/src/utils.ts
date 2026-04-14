/**
 * Format a number as Malaysian Ringgit.
 * e.g. 4900 → "RM 49.00"
 */
export function formatMYR(cents: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(cents / 100)
}

/**
 * Naive check — replace with proper prayer time lib later.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
