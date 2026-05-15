'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

export type NotificationType =
  | 'solat_reminder'
  | 'checklist_reminder'
  | 'streak_milestone'
  | 'doa_reminder'

export type PrayerKey = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  description: string
  timeBadge?: string
  actionLabel?: string
  actionHref?: string
  priority: number
}

export interface UseNotificationsResult {
  notifications: NotificationItem[]
  hasUnread: boolean
  isLoading: boolean
  readIds: Set<string>
  markRead: (id: string) => void
}

interface CachedPrayerTimes {
  date: string
  prayers: Array<{ name: string; label: string; labelAr: string; time: string }>
  district?: string
  zone?: string
}

interface PahalaChecklistRow {
  subuh_done: boolean
  zohor_done: boolean
  asar_done: boolean
  maghrib_done: boolean
  isyak_done: boolean
  quran_done: boolean
  zikir_done: boolean
}

const LS_PRAYER_KEY = 'sajda_prayer_times_banner'
const LS_READ_KEY = () => `sajda_notif_read_${todayKL()}`

const PRAYER_KEYS: PrayerKey[] = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak']
const CHECKLIST_KEYS: (keyof PahalaChecklistRow)[] = [
  'subuh_done', 'zohor_done', 'asar_done', 'maghrib_done',
  'isyak_done', 'quran_done', 'zikir_done',
]

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function getCurrentKLMinutes(): number {
  const klTime = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })
  )
  return klTime.getHours() * 60 + klTime.getMinutes()
}

function todayKL(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })
}

function getPrayerTimesFromCache(): CachedPrayerTimes | null {
  try {
    const raw = localStorage.getItem(LS_PRAYER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedPrayerTimes
    if (parsed.date !== todayKL()) return null
    return parsed
  } catch {
    return null
  }
}

function getStreakMessage(n: number): string {
  if (n >= 100) return `${n} hari berturut-turut — luar biasa! SubhanAllah.`
  if (n >= 30)  return `${n} hari penuh — sebulan solat berjamaah! MasyaAllah.`
  if (n >= 14)  return `${n} hari — dua minggu! Solat sudah jadi tabiat mulia.`
  if (n >= 7)   return `${n} hari — satu minggu penuh! Teruskan momentum.`
  if (n >= 3)   return `${n} hari berturut-turut — teruskan streak anda!`
  return `${n} hari berturut-turut — bagus, jangan putus!`
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const cached = getPrayerTimesFromCache()
      const currentMinutes = getCurrentKLMinutes()
      const today = todayKL()

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || cancelled) {
        setIsLoading(false)
        return
      }

      const [logsResult, checklistResult, streakResult] = await Promise.all([
        supabase
          .from('solat_logs')
          .select('prayer')
          .eq('user_id', user.id)
          .eq('log_date', today),
        supabase
          .from('pahala_checklist')
          .select('subuh_done,zohor_done,asar_done,maghrib_done,isyak_done,quran_done,zikir_done')
          .eq('user_id', user.id)
          .eq('checklist_date', today)
          .maybeSingle(),
        supabase
          .from('solat_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])

      if (cancelled) return

      const loggedPrayers = new Set<PrayerKey>(
        (logsResult.data ?? []).map((r) => r.prayer as PrayerKey)
      )

      const items: NotificationItem[] = []

      if (cached?.prayers) {
        for (const prayer of cached.prayers) {
          const key = prayer.name as PrayerKey
          if (!PRAYER_KEYS.includes(key)) continue
          if (currentMinutes >= toMinutes(prayer.time) && !loggedPrayers.has(key)) {
            items.push({
              id: `solat-${key}`,
              type: 'solat_reminder',
              title: `Waktu ${prayer.label}`,
              description: `Belum log solat ${prayer.label} anda hari ini`,
              timeBadge: prayer.time,
              actionLabel: 'Log Sekarang',
              actionHref: '/ibadah',
              priority: 0,
            })
          }
        }
      }

      const checklist = checklistResult.data as PahalaChecklistRow | null
      const undoneCount = checklist
        ? CHECKLIST_KEYS.filter((k) => !checklist[k]).length
        : 7
      if (undoneCount > 0) {
        items.push({
          id: 'checklist',
          type: 'checklist_reminder',
          title: 'Senarai Semak Deen',
          description: `${undoneCount} amalan belum selesai hari ini`,
          actionLabel: 'Semak Checklist',
          actionHref: '/ibadah',
          priority: 1,
        })
      }

      const streak = (streakResult.data as { current_streak: number } | null)?.current_streak ?? 0
      if (streak > 0) {
        items.push({
          id: 'streak',
          type: 'streak_milestone',
          title: `Streak Solat ${streak} Hari 🔥`,
          description: getStreakMessage(streak),
          priority: 2,
        })
      }

      items.push({
        id: 'doa',
        type: 'doa_reminder',
        title: 'Jangan Lupa Berdoa',
        description: 'Luangkan masa untuk bermunajat kepada Allah hari ini.',
        actionLabel: 'Buka Doa',
        actionHref: '/doa',
        priority: 3,
      })

      items.sort((a, b) => a.priority - b.priority)

      // Load persisted read state for today
      let storedReadIds = new Set<string>()
      try {
        const stored: string[] = JSON.parse(localStorage.getItem(LS_READ_KEY()) ?? '[]')
        storedReadIds = new Set(stored)
      } catch { /* ignore */ }

      if (!cancelled) {
        setNotifications(items)
        setReadIds(storedReadIds)
        setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem(LS_READ_KEY(), JSON.stringify([...next]))
      } catch { /* ignore */ }
      return next
    })
  }, [])

  return {
    notifications,
    hasUnread: notifications.some(n => !readIds.has(n.id)),
    isLoading,
    readIds,
    markRead,
  }
}
