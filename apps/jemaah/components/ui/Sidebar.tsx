'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MosqueSwitcher } from '@/components/home/MosqueSwitcher'
import type { FollowedMosque } from '@/components/home/MosqueSwitcher'

/* ─── Nav items ──────────────────────────────────────────────────────────── */

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
    href: '/ibadah',
    label: 'Ibadah',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" />
        <path d="M12 7V12L15 15" stroke={active ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="4" r="1.5" fill={active ? 'var(--accent)' : 'var(--text-dim)'} />
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

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

type Props = {
  mosques: FollowedMosque[]
  selectedId: string | null
  onMosqueSelect: (id: string | null) => void
}

export function Sidebar({ mosques, selectedId, onMosqueSelect }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] z-40"
      style={{
        background: 'var(--surface-2)',
        borderRight: '1px solid var(--border-strong)',
      }}
    >
      {/* ── Logo ────────────────────────────────────────────────────── */}
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
          style={{
            color: 'var(--primary)',
            fontFamily: 'var(--font-playfair)',
            letterSpacing: '0.1em',
          }}
        >
          SAJDA
        </span>
      </div>

      {/* ── Mosque Switcher ──────────────────────────────────────────── */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-dim)' }}>
          Masjid Aktif
        </p>
        <MosqueSwitcher
          mosques={mosques}
          selectedId={selectedId}
          onSelect={onMosqueSelect}
          variant="sidebar"
        />
      </div>

      {/* ── Nav items ────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative group"
                style={{
                  background: active ? 'var(--accent-soft)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {/* Active indicator */}
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

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          SAJDA v1.0 · Malaysia
        </p>
      </div>
    </aside>
  )
}
