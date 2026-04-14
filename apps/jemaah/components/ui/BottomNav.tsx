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
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
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
          d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
        />
        <path
          d="M5 22V18H19V22M2 18H22M8 18V16M16 18V16"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/doa',
    label: 'Doa',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 6.5C8 5.12 9.12 4 10.5 4C11.88 4 13 5.12 13 6.5V12"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8" strokeLinecap="round"
        />
        <path
          d="M13 7.5C13 6.12 14.12 5 15.5 5C16.88 5 18 6.12 18 7.5V13C18 16.87 14.87 20 11 20C7.13 20 4 16.87 4 13V10.5C4 9.12 5.12 8 6.5 8C7.88 8 9 9.12 9 10.5"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8" strokeLinecap="round"
        />
        <path
          d="M9 10.5V7.5C9 6.12 10.12 5 11.5 5C12.88 5 14 6.12 14 7.5"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/komuniti',
    label: 'Komuniti',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
        />
        <circle cx="17" cy="9" r="2.5"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
        />
        <path
          d="M3 20C3 17.24 5.69 15 9 15C10.07 15 11.07 15.27 11.93 15.73"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M13 20C13 17.79 14.79 16 17 16C19.21 16 21 17.79 21 20"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/profil',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
        />
        <path
          d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
          stroke={active ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
          strokeWidth="1.8"
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
      style={{
        background: 'var(--primary)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
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
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full"
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
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? 'var(--accent)' : 'rgba(255,255,255,0.45)' }}
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
