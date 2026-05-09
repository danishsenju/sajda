'use client'

import { motion } from 'framer-motion'
import { Bell, ChevronRight, Globe, Moon, Sun, User, Landmark, LogOut } from 'lucide-react'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
import { useTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getInitials(email: string, name?: string): string {
  if (name) {
    const parts = name.trim().split(' ')
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  }
  return email.slice(0, 2).toUpperCase()
}

function formatJoinYear(dateStr: string): string {
  try {
    return new Date(dateStr).getFullYear().toString()
  } catch {
    return '2023'
  }
}

/* ─── Settings row ───────────────────────────────────────────────────────── */

function SettingsRow({
  icon: Icon,
  label,
  value,
  href,
  badge,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
  label: string
  value?: string
  href?: string
  badge?: number
}) {
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--surface-3)' }}
      >
        <Icon size={16} strokeWidth={1.5} color="var(--text-dim)" />
      </div>
      <span className="flex-1 text-[14px] font-medium" style={{ color: 'var(--text)' }}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-full mr-1"
          style={{ background: 'var(--surface-3)', color: 'var(--text)' }}
        >
          {badge}
        </span>
      )}
      {value && (
        <span className="text-[13px] mr-1" style={{ color: 'var(--text-dim)' }}>{value}</span>
      )}
      <ChevronRight size={16} strokeWidth={1.5} color="var(--text-dim)" />
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block transition-colors" style={{ background: 'transparent' }}
         onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
         onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        {inner}
      </a>
    )
  }
  return <div className="transition-colors">{inner}</div>
}

/* ─── ProfilContent ──────────────────────────────────────────────────────── */

type Props = {
  email: string
  name?: string
  joinedAt: string
  mosqueCount?: number
  doaCount?: number
  streak?: number
}

export function ProfilContent({
  email,
  name,
  joinedAt,
  mosqueCount = 0,
  doaCount = 0,
  streak = 0,
}: Props) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const initials = getInitials(email, name)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }
  const displayName = name ?? email.split('@')[0] ?? 'Pengguna'
  const joinYear = formatJoinYear(joinedAt)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface)' }}>
      <Sidebar mosques={[]} selectedId={null} onMosqueSelect={() => {}} />

      <div className="flex-1 flex flex-col md:ml-[240px]">

        {/* ── Avatar ────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center safe-top pt-16">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-[28px] font-bold text-white shadow-lg"
            style={{
              background: 'var(--primary)',
              border: '4px solid var(--warning)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.40)',
            }}
          >
            {initials}
          </div>

          {/* Name + email */}
          <div className="text-center mt-3 px-6">
            <h1 className="text-[20px] font-bold capitalize" style={{ color: 'var(--text)' }}>
              {displayName}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {email} · Sertai sejak {joinYear}
            </p>
          </div>

          {/* Gold dot */}
          <div className="w-1.5 h-1.5 rounded-full mt-3" style={{ background: 'var(--warning)' }} />
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="mx-5 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex divide-x rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {[
              { value: mosqueCount, label: 'MASJID' },
              { value: doaCount,    label: 'DOA',   accent: false },
              { value: streak,      label: 'STREAK', gold: true },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-4" style={{ borderRight: '1px solid var(--border)' }}>
                <span
                  className="text-[22px] font-bold"
                  style={{ color: s.gold ? 'var(--warning)' : 'var(--text)' }}
                >
                  {s.value}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── AKAUN section ─────────────────────────────────────────── */}
        <div className="mx-5 mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 px-1" style={{ color: 'var(--text-dim)' }}>
            Akaun
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <SettingsRow icon={User} label="Maklumat Peribadi" href="/profil/maklumat" />
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <SettingsRow icon={Landmark} label="Masjid Saya" badge={mosqueCount} href="/profil/masjid" />
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <SettingsRow icon={Bell} label="Notifikasi" value="Aktif" href="/profil/notifikasi" />
            </div>
          </div>
        </div>

        {/* ── KEUTAMAAN section ─────────────────────────────────────── */}
        <div className="mx-5 mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 px-1" style={{ color: 'var(--text-dim)' }}>
            Keutamaan
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <SettingsRow icon={Globe} label="Bahasa" value="Bahasa Melayu" />
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-3)' }}
                >
                  {theme === 'dark'
                    ? <Moon size={16} strokeWidth={1.5} color="var(--text-dim)" />
                    : <Sun size={16} strokeWidth={1.5} color="var(--text-dim)" />
                  }
                </div>
                <span className="flex-1 text-[14px] font-medium" style={{ color: 'var(--text)' }}>
                  Mod Paparan
                </span>
                {/* Pill toggle */}
                <div
                  className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200"
                  style={{ background: theme === 'dark' ? 'var(--primary)' : 'var(--warning)' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200 shadow-sm"
                    style={{
                      background: '#fff',
                      transform: theme === 'dark' ? 'translateX(1px)' : 'translateX(21px)',
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <div className="mx-5 mt-4 mb-6">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[14px] font-semibold transition-colors active:opacity-80"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--error)' }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            Daftar Keluar
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
