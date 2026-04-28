'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Landmark, BookOpen, Users, User } from 'lucide-react'

const NAV = [
  { href: '/',        label: 'Utama',    Icon: Home },
  { href: '/masjid',  label: 'Masjid',   Icon: Landmark },
  { href: '/doa',     label: 'Doa',      Icon: BookOpen },
  { href: '/komuniti',label: 'Komuniti', Icon: Users },
  { href: '/profil',  label: 'Profil',   Icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 safe-bottom md:hidden"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E8E5DF',
      }}
    >
      <ul className="flex items-stretch justify-around h-16">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 h-full w-full relative"
                aria-current={active ? 'page' : undefined}
              >
                {/* Active dot above icon */}
                <div className="flex flex-col items-center gap-1 relative">
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: '#2D6A4F' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <motion.span
                    animate={{ scale: active ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <item.Icon
                      size={20}
                      strokeWidth={1.5}
                      color={active ? '#2D6A4F' : '#A8A49E'}
                    />
                  </motion.span>
                </div>
                <span
                  className="text-[11px]"
                  style={{
                    color: active ? '#2D6A4F' : '#A8A49E',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
