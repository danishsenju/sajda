'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Landmark, BookOpen, Heart, User } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Utama', Icon: Home },
  { href: '/masjid', label: 'Masjid', Icon: Landmark },
  { href: '/ibadah', label: 'Ibadah', Icon: BookOpen },
  { href: '/doa', label: 'Doa', Icon: Heart },
  { href: '/profil', label: 'Profil', Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden glass-surface safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === href : pathname.startsWith(href)
          return (
            <motion.div
              key={href}
              className="flex-1 flex justify-center"
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                href={href}
                className="relative flex items-center justify-center min-h-[44px]"
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative flex items-center gap-1.5 px-3 py-2">
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'var(--primary-muted)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={active ? 2 : 1.6}
                    className="relative z-10 flex-shrink-0 transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-secondary)' }}
                  />
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, maxWidth: 0 }}
                      animate={{ opacity: 1, maxWidth: '5rem' }}
                      className="relative z-10 text-[12px] font-semibold overflow-hidden whitespace-nowrap"
                      style={{ color: 'var(--primary)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {label}
                    </motion.span>
                  )}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
