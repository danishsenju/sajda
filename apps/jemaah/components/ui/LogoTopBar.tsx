'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, ChevronRight, Landmark } from 'lucide-react'
import Link from 'next/link'
import { SajdaLogo } from '@/components/icons/sajda-logo'
import { createClient } from '@/lib/supabase/browser'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationPanel } from './NotificationPanel'

type Mosque = {
  id: string
  name: string
  slug: string
}

export function LogoTopBar() {
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [visible, setVisible] = useState(true)
  const { notifications, hasUnread, isLoading: notifLoading, readIds, markRead } = useNotifications()
  const lastScrollY = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY
      if (currentY > 20 && currentY > lastScrollY.current) {
        setVisible(false)
      } else {
        setVisible(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('jemaah_follows')
        .select('masjid:masjid_id(id, name, slug)')
        .eq('user_id', user.id)

      if (data) {
        setMosques(
          data
            .map((r) => r.masjid as Mosque | null)
            .filter((m): m is Mosque => m !== null)
        )
      }
    }

    load()
  }, [])

  return (
    <>
      {/* Top bar — mobile only, hides on scroll down */}
      <motion.header
        className="md:hidden fixed top-0 left-0 right-0 z-30 glass-surface safe-top"
        style={{ willChange: 'transform' }}
        animate={{ y: visible ? 0 : -64 }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      >
        <div className="flex items-center h-14 px-3">
          {/* Left slot — symmetry placeholder */}
          <div className="w-11 flex justify-start" />

          {/* Center — logo + mosque switcher */}
          <div className="flex-1 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1"
              aria-expanded={open}
              aria-haspopup="listbox"
            >
              <SajdaLogo width={72} height={30} className="text-[--text-primary]" />
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <ChevronDown size={13} style={{ color: 'var(--text-secondary)' }} />
              </motion.span>
            </motion.button>
          </div>

          {/* Right slot — notification bell */}
          <div className="w-11 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl glass-surface"
              aria-label="Pemberitahuan"
            >
              <Bell size={20} style={{ color: 'var(--primary)' }} />
              {hasUnread && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"
                  aria-hidden="true"
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mosque bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[55]"
              style={{ background: 'rgba(0,0,0,0.40)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl overflow-hidden"
              style={{
                background: 'var(--surface-raised)',
                maxHeight: '72vh',
                display: 'flex',
                flexDirection: 'column',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
              </div>

              {/* Sheet header */}
              <div
                className="px-5 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cormorant)' }}
                >
                  Masjid Saya
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {mosques.length} masjid diikuti
                </p>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {mosques.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Landmark size={28} style={{ color: 'var(--text-disabled)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Belum ikuti mana-mana masjid
                    </p>
                  </div>
                ) : (
                  mosques.map((mosque) => (
                    <Link
                      key={mosque.id}
                      href={`/masjid/${mosque.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-5 py-3.5"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-xs"
                        style={{ background: 'var(--primary)' }}
                      >
                        {mosque.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-medium flex-1 truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {mosque.name}
                      </span>
                      <ChevronRight size={15} style={{ color: 'var(--text-disabled)' }} />
                    </Link>
                  ))
                )}

                <div className="p-4">
                  <Link
                    href="/masjid"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    <Landmark size={15} />
                    Cari Masjid Baru
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        isLoading={notifLoading}
        readIds={readIds}
        onMarkRead={markRead}
        variant="sheet"
      />
    </>
  )
}
