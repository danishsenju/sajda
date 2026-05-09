import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Cormorant_Garamond, Amiri } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
  themeColor: '#0C0C14',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      className={`${jakarta.variable} ${cormorant.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
