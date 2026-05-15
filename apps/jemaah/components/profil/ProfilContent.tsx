'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { useTheme } from '@/components/ui/ThemeProvider'
import { motion } from 'framer-motion'
import {
  User,
  Building2,
  Bell,
  Globe,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react'

interface Props {
  email: string
  name?: string
  joinedAt: string
  mosqueCount?: number
  doaCount?: number
  streak?: number
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

function formatJoinYear(joinedAt: string): string {
  return new Date(joinedAt).getFullYear().toString()
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 500, damping: 35 },
  },
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

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = getInitials(name)
  const joinYear = formatJoinYear(joinedAt)
  const displayName = name ?? email.split('@')[0]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-[--surface]"
    >
      <div>
        <div className="md:grid md:grid-cols-[1fr_2fr] md:gap-6 md:items-start">

          {/* ── LEFT COLUMN (desktop) / TOP (mobile) ── */}
          <div className="flex flex-col gap-3">

            {/* Section 1 — Profile Hero */}
            <motion.div
              variants={item}
              className="bg-[--surface-raised] border border-[--border] rounded-2xl mx-4 mt-4 p-5 md:mx-0 md:mt-0 flex flex-col items-center gap-3"
            >
              <div
                className="w-20 h-20 rounded-full bg-[--primary] flex items-center justify-center text-white font-cormorant text-2xl font-semibold shrink-0"
                style={{ boxShadow: '0 0 0 3px var(--gold)' }}
              >
                {initials}
              </div>

              <div className="text-center space-y-0.5">
                <p className="font-cormorant text-[24px] font-bold leading-tight text-[--text-primary]">
                  {displayName}
                </p>
                <p className="font-jakarta text-xs text-[--text-secondary]">{email}</p>
                <p className="font-jakarta text-xs text-[--text-secondary]">
                  Sertai sejak {joinYear}
                </p>
              </div>
            </motion.div>

            {/* Section 2 — Stats Row */}
            <motion.div
              variants={item}
              className="bg-[--surface-raised] border border-[--border] rounded-2xl mx-4 md:mx-0"
            >
              <div className="grid grid-cols-3">
                <div className="flex flex-col items-center py-4 px-2 border-r border-[--border]">
                  <span className="font-cormorant text-[28px] font-bold leading-none text-[--text-primary]">
                    {mosqueCount}
                  </span>
                  <span className="font-jakarta text-[10px] font-medium tracking-widest uppercase text-[--text-secondary] mt-1">
                    Masjid
                  </span>
                </div>

                <div className="flex flex-col items-center py-4 px-2 border-r border-[--border]">
                  <span className="font-cormorant text-[28px] font-bold leading-none text-[--text-primary]">
                    {doaCount}
                  </span>
                  <span className="font-jakarta text-[10px] font-medium tracking-widest uppercase text-[--text-secondary] mt-1">
                    Doa
                  </span>
                </div>

                <div className="flex flex-col items-center py-4 px-2">
                  <span className="font-cormorant text-[28px] font-bold leading-none text-[--gold]">
                    {streak}
                  </span>
                  <span className="font-jakarta text-[10px] font-medium tracking-widest uppercase text-[--text-secondary] mt-1">
                    Streak
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT COLUMN (desktop) / BOTTOM (mobile) ── */}
          <div className="flex flex-col gap-3 mt-3 md:mt-0">

            {/* Group — AKAUN */}
            <motion.div variants={item} className="mx-4 md:mx-0">
              <p className="font-jakarta text-[10px] font-semibold tracking-widest uppercase text-[--text-secondary] mb-2 px-1">
                Akaun
              </p>
              <div className="bg-[--surface-raised] border border-[--border] rounded-2xl overflow-hidden">

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/profil/maklumat')}
                  className="w-full flex items-center gap-3 py-3.5 px-4 border-b border-[--border] text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[--primary-muted] flex items-center justify-center shrink-0">
                    <User size={16} className="text-[--primary]" />
                  </div>
                  <span className="font-jakarta text-sm text-[--text-primary] flex-1">
                    Maklumat Peribadi
                  </span>
                  <ChevronRight size={16} className="text-[--text-secondary]" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/masjid')}
                  className="w-full flex items-center gap-3 py-3.5 px-4 border-b border-[--border] text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[--primary-muted] flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-[--primary]" />
                  </div>
                  <span className="font-jakarta text-sm text-[--text-primary] flex-1">
                    Masjid Saya
                  </span>
                  <span className="font-jakarta text-xs text-[--text-secondary] mr-2">
                    {mosqueCount}
                  </span>
                  <ChevronRight size={16} className="text-[--text-secondary]" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/profil/notifikasi')}
                  className="w-full flex items-center gap-3 py-3.5 px-4 text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[--primary-muted] flex items-center justify-center shrink-0">
                    <Bell size={16} className="text-[--primary]" />
                  </div>
                  <span className="font-jakarta text-sm text-[--text-primary] flex-1">
                    Notifikasi
                  </span>
                  <ChevronRight size={16} className="text-[--text-secondary]" />
                </motion.button>

              </div>
            </motion.div>

            {/* Group — KEUTAMAAN */}
            <motion.div variants={item} className="mx-4 md:mx-0">
              <p className="font-jakarta text-[10px] font-semibold tracking-widest uppercase text-[--text-secondary] mb-2 px-1">
                Keutamaan
              </p>
              <div className="bg-[--surface-raised] border border-[--border] rounded-2xl overflow-hidden">

                <div className="flex items-center gap-3 py-3.5 px-4 border-b border-[--border]">
                  <div className="w-9 h-9 rounded-full bg-[--primary-muted] flex items-center justify-center shrink-0">
                    <Globe size={16} className="text-[--primary]" />
                  </div>
                  <span className="font-jakarta text-sm text-[--text-primary] flex-1">
                    Bahasa
                  </span>
                  <span className="font-jakarta text-xs text-[--text-secondary]">
                    Bahasa Melayu
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 py-3.5 px-4 text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[--primary-muted] flex items-center justify-center shrink-0">
                    {theme === 'dark'
                      ? <Moon size={16} className="text-[--primary]" />
                      : <Sun size={16} className="text-[--primary]" />
                    }
                  </div>
                  <span className="font-jakarta text-sm text-[--text-primary] flex-1">
                    Mod Paparan
                  </span>
                  <div
                    className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
                    style={{
                      backgroundColor: theme === 'dark'
                        ? 'var(--primary)'
                        : 'var(--border-strong)',
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{
                        transform: theme === 'dark'
                          ? 'translateX(20px)'
                          : 'translateX(2px)',
                      }}
                    />
                  </div>
                </motion.button>

              </div>
            </motion.div>

            {/* Section 4 — Daftar Keluar */}
            <motion.div variants={item} className="mx-4 md:mx-0 mt-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className="w-full h-12 rounded-2xl border border-[--error]/30 text-[--error] font-jakarta text-sm font-medium"
              >
                Daftar Keluar
              </motion.button>
            </motion.div>

          </div>
        </div>
      </div>
    </motion.div>
  )
}
