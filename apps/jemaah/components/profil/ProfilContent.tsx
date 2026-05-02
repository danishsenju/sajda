'use client'

import { motion } from 'framer-motion'
import { Bell, ChevronRight, Globe, User, Landmark, LogOut } from 'lucide-react'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
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
        style={{ background: '#F0EEE9' }}
      >
        <Icon size={16} strokeWidth={1.5} color="#6B6860" />
      </div>
      <span className="flex-1 text-[14px] font-medium" style={{ color: '#1A1916' }}>
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-full mr-1"
          style={{ background: '#EAF4EE', color: '#2D6A4F' }}
        >
          {badge}
        </span>
      )}
      {value && (
        <span className="text-[13px] mr-1" style={{ color: '#A8A49E' }}>{value}</span>
      )}
      <ChevronRight size={16} strokeWidth={1.5} color="#A8A49E" />
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block active:bg-[#F7F6F3] transition-colors">
        {inner}
      </a>
    )
  }
  return <div className="active:bg-[#F7F6F3] transition-colors">{inner}</div>
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
  const initials = getInitials(email, name)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }
  const displayName = name ?? email.split('@')[0] ?? 'Pengguna'
  const joinYear = formatJoinYear(joinedAt)

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F6F3' }}>
      <Sidebar mosques={[]} selectedId={null} onMosqueSelect={() => {}} />

      <div className="flex-1 flex flex-col md:ml-[240px]">

        {/* ── Dark green hero header ─────────────────────────────────── */}
        <div
          className="relative safe-top"
          style={{ background: '#1B4332', paddingBottom: '64px' }}
        >
          {/* Bell */}
          <div className="flex justify-end px-5 pt-4 pb-0">
            <button className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} aria-label="Pemberitahuan">
              <Bell size={18} strokeWidth={1.5} color="rgba(255,255,255,0.80)" />
            </button>
          </div>

          {/* Decorative star */}
          <svg className="absolute top-4 left-5 opacity-10" width="60" height="60" viewBox="0 0 24 24" fill="white">
            <polygon points="12,2 14.4,9.2 22,9.2 16,13.8 18.4,21 12,16.4 5.6,21 8,13.8 2,9.2 9.6,9.2" />
          </svg>
        </div>

        {/* ── Avatar (overlapping hero + content) ───────────────────── */}
        <div className="flex flex-col items-center" style={{ marginTop: '-56px' }}>
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-[28px] font-bold text-white shadow-lg"
            style={{
              background: '#2D6A4F',
              border: '4px solid #C9A84C',
              boxShadow: '0 4px 20px rgba(0,0,0,0.20)',
            }}
          >
            {initials}
          </div>

          {/* Name + email */}
          <div className="text-center mt-3 px-6">
            <h1 className="text-[20px] font-bold capitalize" style={{ color: '#1A1916' }}>
              {displayName}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: '#A8A49E' }}>
              {email} · Sertai sejak {joinYear}
            </p>
          </div>

          {/* Gold dot */}
          <div className="w-1.5 h-1.5 rounded-full mt-3" style={{ background: '#C9A84C' }} />
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="mx-5 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex divide-x rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
          >
            {[
              { value: mosqueCount, label: 'MASJID' },
              { value: doaCount,    label: 'DOA',   accent: false },
              { value: streak,      label: 'STREAK', gold: true },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-4" style={{ borderRight: '1px solid #E8E5DF' }}>
                <span
                  className="text-[22px] font-bold"
                  style={{ color: s.gold ? '#C9A84C' : '#1A1916' }}
                >
                  {s.value}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] mt-0.5" style={{ color: '#A8A49E' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── AKAUN section ─────────────────────────────────────────── */}
        <div className="mx-5 mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 px-1" style={{ color: '#A8A49E' }}>
            Akaun
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
            <SettingsRow icon={User} label="Maklumat Peribadi" href="/profil/maklumat" />
            <div style={{ borderTop: '1px solid #E8E5DF' }}>
              <SettingsRow icon={Landmark} label="Masjid Saya" badge={mosqueCount} href="/profil/masjid" />
            </div>
            <div style={{ borderTop: '1px solid #E8E5DF' }}>
              <SettingsRow icon={Bell} label="Notifikasi" value="Aktif" href="/profil/notifikasi" />
            </div>
          </div>
        </div>

        {/* ── KEUTAMAAN section ─────────────────────────────────────── */}
        <div className="mx-5 mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 px-1" style={{ color: '#A8A49E' }}>
            Keutamaan
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}>
            <SettingsRow icon={Globe} label="Bahasa" value="Bahasa Melayu" />
          </div>
        </div>

        {/* ── Sign out ──────────────────────────────────────────────── */}
        <div className="mx-5 mt-4 mb-6">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl text-[14px] font-semibold transition-colors active:opacity-80"
            style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', color: '#C0392B' }}
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
