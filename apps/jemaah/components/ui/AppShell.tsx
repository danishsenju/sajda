'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

const ROOT_PATHS = new Set(['/', '/masjid', '/ibadah', '/doa', '/profil'])

type Props = {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function AppShell({ title, children, action }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const isRoot = ROOT_PATHS.has(pathname)

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--surface)' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">

        {/* Mobile top bar — hidden on desktop */}
        <header className="md:hidden sticky top-0 z-30 glass-surface safe-top">
          <div className="flex items-center h-14 px-2">

            {/* Left: back button or empty spacer */}
            <div className="w-11 flex justify-start">
              {!isRoot && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => router.back()}
                  className="w-10 h-10 flex items-center justify-center rounded-full"
                  aria-label="Kembali"
                >
                  <ChevronLeft
                    size={22}
                    strokeWidth={2.2}
                    style={{ color: 'var(--text-primary)' }}
                  />
                </motion.button>
              )}
            </div>

            {/* Center: page title */}
            <h1
              className="flex-1 text-center text-[20px] font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h1>

            {/* Right: optional action slot */}
            <div className="w-11 flex justify-end">
              {action ?? null}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-24 md:pb-0">
          <div className="md:p-8 md:max-w-5xl md:mx-auto">
            {children}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
