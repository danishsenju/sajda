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
        <nav
          className="fixed bottom-0 inset-x-0 z-50 md:hidden"
          style={{
            backgroundColor: 'var(--surface-raised)',
            borderTop: '1px solid var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
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
                className="flex items-center justify-center min-h-[44px]"
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className="flex items-center gap-1 transition-all"
                  style={active ? {
                    backgroundColor: 'var(--primary-muted)',
                    borderRadius: '12px',
                    padding: '6px 14px',
                  } : {
                    padding: '6px 14px',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2 : 1.6}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: active ? 'var(--primary)' : 'var(--text-disabled)' }}
                  />
                  <span
                    className={active ? 'text-[10px] font-semibold whitespace-nowrap' : 'hidden'}
                    style={active ? { color: 'var(--primary)' } : {}}
                  >
                    {label}
                  </span>
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
