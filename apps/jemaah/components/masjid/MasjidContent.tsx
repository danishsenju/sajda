'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Navigation, ChevronRight } from 'lucide-react'
import { BottomNav } from '@/components/ui/BottomNav'
import { Sidebar } from '@/components/ui/Sidebar'
import Image from 'next/image'
import { Bell } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Mosque = {
  id: string
  name: string
  initials: string
  color: string
}

type SuggestedMosque = {
  id: string
  name: string
  address: string
  distance: string
  followers: string
  tag?: string
  tagColor?: string
}

/* ─── Tab filter pills ───────────────────────────────────────────────────── */

const TABS = ['Berdekatan', 'Diikuti', 'Semua']

/* ─── Mock map placeholder ───────────────────────────────────────────────── */

function MapPlaceholder() {
  return (
    <div
      className="w-full h-[180px] rounded-2xl relative overflow-hidden flex items-end justify-end p-3"
      style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #3B8C63 100%)' }}
    >
      {/* Decorative dots simulating map pins */}
      <div className="absolute inset-0">
        <div
          className="absolute w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#C9A84C', top: '40%', left: '38%', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 6.5 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6.5 12 2 12 2Z" fill="white" stroke="white" strokeWidth="1.5" />
            <path d="M5 22V19H19V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div
          className="absolute w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#2D6A4F', top: '25%', left: '62%', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 6.5 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6.5 12 2 12 2Z" fill="white" />
          </svg>
        </div>
        <div
          className="absolute w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: '#2D6A4F', top: '55%', left: '70%', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 6.5 7 11C7 13.76 9.24 16 12 16C14.76 16 17 13.76 17 11C17 6.5 12 2 12 2Z" fill="white" />
          </svg>
        </div>
        {/* Subtle grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 360 180">
          <line x1="0" y1="60" x2="360" y2="60" stroke="white" strokeWidth="0.8" />
          <line x1="0" y1="120" x2="360" y2="120" stroke="white" strokeWidth="0.8" />
          <line x1="90" y1="0" x2="90" y2="180" stroke="white" strokeWidth="0.8" />
          <line x1="180" y1="0" x2="180" y2="180" stroke="white" strokeWidth="0.8" />
          <line x1="270" y1="0" x2="270" y2="180" stroke="white" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Buka peta button */}
      <button
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
        style={{ background: 'rgba(255,255,255,0.90)', color: '#1A1916' }}
      >
        <Navigation size={12} strokeWidth={2} />
        Buka peta
      </button>
    </div>
  )
}

/* ─── MasjidContent ──────────────────────────────────────────────────────── */

type Props = {
  followedMosques?: Mosque[]
  suggestedMosques?: SuggestedMosque[]
}

const DEFAULT_FOLLOWED: Mosque[] = [
  { id: '1', name: 'Masjid Wilayah', initials: 'W', color: '#2D6A4F' },
  { id: '2', name: 'Masjid Negara',  initials: 'N', color: '#C9A84C' },
  { id: '3', name: 'Masjid Jamek',   initials: 'J', color: '#4B6CB7' },
]

const DEFAULT_SUGGESTED: SuggestedMosque[] = [
  {
    id: 's1',
    name: 'Masjid Al-Bukhary',
    address: 'Jalan Hang Tuah · KL',
    distance: '1.2 km',
    followers: '12,420 pengikut',
    tag: 'Masjid Negeri',
    tagColor: '#2D6A4F',
  },
  {
    id: 's2',
    name: 'Masjid As-Syakirin',
    address: 'KLCC · Kuala Lumpur',
    distance: '2.4 km',
    followers: '8,750 pengikut',
    tag: 'Wakaf',
    tagColor: '#C9A84C',
  },
]

export function MasjidContent({ followedMosques = DEFAULT_FOLLOWED, suggestedMosques = DEFAULT_SUGGESTED }: Props) {
  const [activeTab, setActiveTab] = useState('Berdekatan')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F6F3' }}>
      <Sidebar mosques={[]} selectedId={null} onMosqueSelect={() => {}} />

      <div className="flex-1 flex flex-col md:ml-[240px]">
        {/* Mobile header */}
        <header
          className="md:hidden sticky top-0 z-30 safe-top"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E5DF' }}
        >
          <div className="flex items-center justify-between px-5 h-14">
            <Image src="/sajda-logo.png" alt="SAJDA" width={80} height={32} className="object-contain" priority />
            <span className="text-[13px] font-semibold" style={{ color: '#1A1916' }}>Masjid</span>
            <button className="w-11 h-11 flex items-center justify-center" aria-label="Pemberitahuan">
              <Bell size={20} strokeWidth={1.5} color="#1A1916" />
            </button>
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-10">
          <div className="px-5 pt-6 md:max-w-[900px] md:mx-auto md:px-8 md:py-6">

            {/* Page heading */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: '#C9A84C' }}>
              Masjid
            </p>
            <h1
              className="text-[26px] font-bold leading-tight mb-5"
              style={{ color: '#1A1916', fontFamily: 'var(--font-playfair)' }}
            >
              Temui rumah Allah<br />berdekatan anda
            </h1>

            {/* Search bar */}
            <div
              className="flex items-center gap-3 px-4 h-12 rounded-2xl mb-4"
              style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
            >
              <Search size={16} strokeWidth={1.5} color="#A8A49E" />
              <input
                type="text"
                placeholder="Cari masjid berdekatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-[14px] bg-transparent outline-none"
                style={{ color: '#1A1916' }}
              />
              <button
                className="flex items-center gap-1 text-[12px] font-semibold"
                style={{ color: '#2D6A4F' }}
              >
                <MapPin size={12} strokeWidth={2} />
                Lokasi
              </button>
            </div>

            {/* Tab pills */}
            <div className="flex gap-2 mb-5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
                  style={
                    activeTab === tab
                      ? { background: '#1A1916', color: '#FFFFFF' }
                      : { background: '#FFFFFF', color: '#6B6860', border: '1px solid #E8E5DF' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Map */}
            <div className="mb-6">
              <MapPlaceholder />
            </div>

            {/* Followed mosques */}
            {followedMosques.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold" style={{ color: '#1A1916' }}>Diikuti</p>
                  <span className="text-[12px]" style={{ color: '#A8A49E' }}>{followedMosques.length} masjid</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {followedMosques.map((m) => (
                    <button
                      key={m.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-full flex-shrink-0"
                      style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ background: m.color }}
                      >
                        {m.initials}
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: '#1A1916' }}>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested mosques */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-semibold" style={{ color: '#1A1916' }}>Cadangan</p>
                <span className="text-[12px]" style={{ color: '#A8A49E' }}>{suggestedMosques.length} jumpa</span>
              </div>
              <div className="flex flex-col gap-3">
                {suggestedMosques.map((mosque, i) => (
                  <motion.a
                    key={mosque.id}
                    href={`/masjid/${mosque.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="block rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                    style={{ background: '#FFFFFF', border: '1px solid #E8E5DF' }}
                  >
                    {/* Card image / dark header area */}
                    <div
                      className="relative h-[110px] flex flex-col justify-between p-4"
                      style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
                    >
                      {/* Distance badge */}
                      <div className="flex justify-end">
                        <span
                          className="text-[12px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.20)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)' }}
                        >
                          {mosque.distance}
                        </span>
                      </div>

                      {/* Decorative star */}
                      <svg className="absolute right-8 top-3 opacity-15" width="50" height="50" viewBox="0 0 24 24" fill="white">
                        <polygon points="12,2 14.4,9.2 22,9.2 16,13.8 18.4,21 12,16.4 5.6,21 8,13.8 2,9.2 9.6,9.2" />
                      </svg>

                      {/* Mosque name */}
                      <div>
                        <h3 className="text-[16px] font-bold text-white leading-snug">{mosque.name}</h3>
                        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.70)' }}>
                          <MapPin size={10} className="inline mr-1" />{mosque.address}
                        </p>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        {mosque.tag && (
                          <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: '#EAF4EE', color: mosque.tagColor ?? '#2D6A4F' }}
                          >
                            {mosque.tag}
                          </span>
                        )}
                        <span className="text-[12px]" style={{ color: '#A8A49E' }}>{mosque.followers}</span>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} color="#A8A49E" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
