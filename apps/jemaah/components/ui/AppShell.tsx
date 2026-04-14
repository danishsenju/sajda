'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BottomNav } from './BottomNav'

/* ─── Nav items (mirrors BottomNav) ─────────────────────────────────────── */

const NAV = [
  {
    href: '/',
    label: 'Utama',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : 'var(--text-dim)'}
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C12 2 7 6 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6 12 2 12 2Z"
          fill={active ? 'var(--accent)' : 'none'}
          stroke={active ? 'var(--accent)' : 'var(--text-dim)'}
          strokeWidth="1.8"
        />
        <path
          d="M5 22V18H19V22M2 18H22M8 18V16M16 18V16"
          stroke={active ? 'var(--accent)' : 'var(--text-dim)'}
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 6.5C8 5.12 9.12 4 10.5 4C11.88 4 13 5.12 13 6.5V12"
          stroke={active ? 'var(--accent)' : 'var(--text-dim)'}
          strokeWidth="1.8" strokeLinecap="round"
        />
        <path
          d="M13 7.5C13 6.12 14.12 5 15.5 5C16.88 5 18 6.12 18 7.5V13C18 16.87 14.87 20 11 20C7.13 20 4 16.87 4 13V10.5C4 9.12 5.12 8 6.5 8C7.88 8 9 9.12 9 10.5"
          stroke={active ? 'var(--accent)' : 'var(--text-dim)'}
          strokeWidth="1.8" strokeLinecap="round"
        />
        <path
          d="M9 10.5V7.5C9 6.12 10.12 5 11.5 5C12.88 5 14 6.12 14 7.5"
          stroke={active ? 'var(--accent)' : 'var(--text-dim)'}
          strokeWidth="1.8" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/komuniti',
    label: 'Komuniti',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" />
        <circle cx="17" cy="9" r="2.5" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" />
        <path d="M3 20C3 17.24 5.69 15 9 15C10.07 15 11.07 15.27 11.93 15.73" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13 20C13 17.79 14.79 16 17 16C19.21 16 21 17.79 21 20" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profil',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill={active ? 'var(--accent)' : 'none'} stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" />
        <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

/* ─── AppShell ───────────────────────────────────────────────────────────── */

type Props = {
  title: string
  children: React.ReactNode
}

export function AppShell({ title, children }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface)' }}>

      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] z-40"
        style={{ background: 'var(--surface-2)', borderRight: '1px solid var(--border-strong)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 6 7 6 12.5C6 15.81 8.69 18.5 12 18.5C15.31 18.5 18 15.81 18 12.5C18 7 12 2 12 2Z"
                fill="rgba(255,255,255,0.25)"
                stroke="rgba(255,255,255,0.70)"
                strokeWidth="1.2"
              />
              <path d="M4 22V20H20V22" stroke="rgba(255,255,255,0.70)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="16" cy="5" r="1.2" fill="var(--accent)" />
            </svg>
          </div>
          <span
            className="text-xl font-bold"
            style={{ color: 'var(--primary)', fontFamily: 'var(--font-playfair)', letterSpacing: '0.1em' }}
          >
            SAJDA
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative"
                  style={{
                    background: active ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                  <span className="flex-shrink-0">{item.icon(active)}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>SAJDA v1.0 · Malaysia</p>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-[240px]">

        {/* Mobile header */}
        <header
          className="md:hidden sticky top-0 z-30 safe-top"
          style={{ background: 'var(--primary)' }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 2 6 7 6 12.5C6 15.81 8.69 18.5 12 18.5C15.31 18.5 18 15.81 18 12.5C18 7 12 2 12 2Z"
                  fill="rgba(255,255,255,0.20)"
                  stroke="rgba(255,255,255,0.60)"
                  strokeWidth="1.2"
                />
                <path d="M4 23V20H20V23M1 20H23" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="5" r="1.2" fill="var(--accent)" />
              </svg>
              <span
                className="text-lg font-bold"
                style={{ color: '#fff', fontFamily: 'var(--font-playfair)', letterSpacing: '0.12em' }}
              >
                SAJDA
              </span>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>
              {title}
            </span>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-label="Pemberitahuan"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke="rgba(255,255,255,0.70)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-24 md:pb-10">
          <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-6">
            {children}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
