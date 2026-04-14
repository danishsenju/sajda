import type { Metadata, Viewport } from 'next'
import { Lexend_Deca, Playfair_Display, Amiri } from 'next/font/google'
import './globals.css'

const lexendDeca = Lexend_Deca({
  variable: '--font-lexend',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
})

const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SAJDA',
    template: '%s · SAJDA',
  },
  description: 'Penghubung Muslim dengan masjid dan komuniti mereka.',
  applicationName: 'SAJDA',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SAJDA',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'SAJDA',
    title: 'SAJDA — Komuniti Masjid',
    description: 'Penghubung Muslim dengan masjid dan komuniti mereka.',
  },
}

export const viewport: Viewport = {
  themeColor: '#102937',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      className={`${lexendDeca.variable} ${playfair.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface text-foreground">
        {children}
      </body>
    </html>
  )
}
