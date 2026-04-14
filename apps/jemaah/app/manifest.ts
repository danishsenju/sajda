import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAJDA — Komuniti Masjid',
    short_name: 'SAJDA',
    description: 'Penghubung Muslim dengan masjid dan komuniti mereka.',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1a6b45', // Islamic green
    categories: ['lifestyle', 'social'],
    lang: 'ms',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Waktu Solat',
        url: '/solat',
        description: 'Semak waktu solat hari ini',
      },
      {
        name: 'Sedekah',
        url: '/sedekah',
        description: 'Hulurkan sedekah kepada masjid',
      },
    ],
  }
}
