'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV = [
  {
    href: '/',
    label: 'Utama',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/masjid',
    label: 'Masjid',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C12 2 7 6.5 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6.5 12 2 12 2Z"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
        />
        <path
          d="M5 22V19H19V22M2 19H22M8 19V16M16 19V16"
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/ibadah',
    label: 'Ibadah',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="12" r="9"
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
        />
        <path
          d="M12 7V12L15 15"
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12" cy="4" r="1.5" fill={active ? 'var(--accent)' : '#A8A49E'} />
      </svg>
    ),
  },
  {
    href: '/doa',
    label: 'Doa',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3C12 3 6 7 6 13C6 16.31 8.69 19 12 19C15.31 19 18 16.31 18 13C18 7 12 3 12 3Z"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M9 21H15M12 19V21" stroke={active ? 'var(--accent)' : '#A8A49E'} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profil',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12" cy="8" r="4"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
        />
        <path
          d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
          stroke={active ? 'var(--accent)' : '#A8A49E'}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 safe-bottom md:hidden"
      style={{ background: '#FFFFFF', borderTop: '1px solid #E8E5DF' }}
    >
      <ul className="flex items-stretch justify-around h-16">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 h-full w-full relative"
                aria-current={active ? 'page' : undefined}
              >
                <div className="flex flex-col items-center gap-1 relative">
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'var(--accent)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <motion.span
                    animate={{ scale: active ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {item.icon(active)}
                  </motion.span>
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: active ? 'var(--accent)' : '#A8A49E', fontWeight: active ? 600 : 400 }}
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
