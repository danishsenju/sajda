// Word-boundary profanity filter for Malay (mencarut) + English.
// Normalises leet-speak substitutions before matching.

const MALAY_WORDS = [
  'babi', 'anjing', 'puki', 'celaka', 'sial', 'sundal', 'bangsat',
  'bodoh', 'lancau', 'pantat', 'butoh', 'butuh', 'pukimak', 'kimak',
  'keparat', 'haram jadah', 'haramjadah', 'jadah', 'setan', 'syaitan',
  'bongok', 'goblok', 'pundek', 'kontol', 'pepek', 'bongok', 'tolol',
  'monyet', 'babi buta', 'anak haram', 'perampok', 'pelacur', 'pelahap',
]

const ENGLISH_WORDS = [
  'fuck', 'fucker', 'fucking', 'fck', 'f u c k',
  'shit', 'shite', 'bullshit',
  'bitch', 'bastard', 'asshole', 'arsehole',
  'cunt', 'cock', 'dick', 'prick',
  'pussy', 'whore', 'slut', 'nigger', 'nigga',
  'motherfucker', 'motherfuck',
]

const ALL_WORDS = [...MALAY_WORDS, ...ENGLISH_WORDS]

function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/@/g, 'a')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/4/g, 'a')
}

export function containsProfanity(text: string): boolean {
  const normalised = normalise(text)
  for (const word of ALL_WORDS) {
    // word-boundary: must be surrounded by non-alphanumeric or string edge
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i')
    if (pattern.test(normalised)) return true
  }
  return false
}

export const PROFANITY_ERROR_MSG =
  'Mengandungi perkataan tidak sesuai. Sila gunakan bahasa yang sopan.'
