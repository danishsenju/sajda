'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Landmark, BookOpen, Heart, User, Users, Settings, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { useTheme } from './ThemeProvider'

const MAIN_NAV = [
  { href: '/', label: 'Utama', Icon: Home },
  { href: '/masjid', label: 'Masjid', Icon: Landmark },
  { href: '/ibadah', label: 'Ibadah', Icon: BookOpen },
  { href: '/doa', label: 'Doa', Icon: Heart },
  { href: '/profil', label: 'Profil', Icon: User },
]

const SECONDARY_NAV = [
  { href: '/komuniti', label: 'Komuniti', Icon: Users },
  { href: '/tetapan', label: 'Tetapan', Icon: Settings },
]

type UserProfile = {
  display_name: string | null
  avatar_url: string | null
  mosque_name: string | null
}

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile>({
    display_name: null,
    avatar_url: null,
    mosque_name: null,
  })

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: followData }] = await Promise.all([
        supabase
          .from('jemaah_profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single(),
        supabase
          .from('jemaah_follows')
          .select('masjid:masjid_id(name)')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle(),
      ])

      setProfile({
        display_name: profileData?.display_name ?? null,
        avatar_url: profileData?.avatar_url ?? null,
        mosque_name: (followData?.masjid as { name?: string } | null)?.name ?? null,
      })
    }

    fetchProfile()
  }, [])

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 z-40"
      style={{ background: '#1C2B22' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(184,134,11,0.12)',
            border: '1px solid rgba(184,134,11,0.28)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 2 6 7 6 12.5C6 15.81 8.69 18.5 12 18.5C15.31 18.5 18 15.81 18 12.5C18 7 12 2 12 2Z"
              fill="rgba(184,134,11,0.25)"
              stroke="#B8860B"
              strokeWidth="1.5"
            />
            <path
              d="M4 22V20H20V22"
              stroke="#B8860B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          className="text-[22px] font-semibold tracking-[0.12em]"
          style={{ color: '#B8860B', fontFamily: 'var(--font-cormorant)' }}
        >
          SAJDA
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {MAIN_NAV.map(({ href, label, Icon }) => {
            const active = href === '/' ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.6}
                  className="relative z-10 flex-shrink-0"
                />
                <span className="relative z-10 text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div
          className="my-3 mx-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        />

        {/* Secondary nav */}
        <div className="flex flex-col gap-0.5">
          {SECONDARY_NAV.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={1.6} className="flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User profile */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.12)',
            }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={16} className="text-white/40" />
              </div>
            )}
          </div>

          {/* Name + mosque */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-semibold truncate"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {profile.display_name ?? 'Pengguna'}
            </p>
            {profile.mosque_name && (
              <p
                className="text-[11px] truncate"
                style={{ color: 'rgba(255,255,255,0.40)' }}
              >
                {profile.mosque_name}
              </p>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
            aria-label={theme === 'dark' ? 'Tukar ke tema cerah' : 'Tukar ke tema gelap'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
