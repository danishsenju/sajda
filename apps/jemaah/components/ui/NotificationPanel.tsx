'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckSquare, Zap, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import type { NotificationItem, NotificationType } from '@/hooks/useNotifications'

interface Props {
  open: boolean
  onClose: () => void
  notifications: NotificationItem[]
  isLoading: boolean
  readIds: Set<string>
  onMarkRead: (id: string) => void
  variant: 'sheet' | 'dropdown'
}

type TypeConfig = {
  icon: React.ElementType
  iconColor: string
  bg: string
  accentColor: string
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  solat_reminder: {
    icon: Bell,
    iconColor: 'var(--primary)',
    bg: 'rgba(30,107,69,0.12)',
    accentColor: '#1E6B45',
  },
  checklist_reminder: {
    icon: CheckSquare,
    iconColor: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    accentColor: '#3B82F6',
  },
  streak_milestone: {
    icon: Zap,
    iconColor: 'var(--gold)',
    bg: 'rgba(184,134,11,0.12)',
    accentColor: '#B8860B',
  },
  doa_reminder: {
    icon: Sparkles,
    iconColor: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    accentColor: '#8B5CF6',
  },
}

function NotificationCard({
  item,
  isRead,
  onMarkRead,
  onClose,
}: {
  item: NotificationItem
  isRead: boolean
  onMarkRead: (id: string) => void
  onClose: () => void
}) {
  const { icon: Icon, iconColor, bg, accentColor } = TYPE_CONFIG[item.type]

  return (
    <motion.div
      animate={{ opacity: isRead ? 0.55 : 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => onMarkRead(item.id)}
      className="rounded-2xl p-4 flex gap-3 cursor-pointer glass-surface"
      style={{
        borderLeft: isRead ? 'none' : `3px solid ${accentColor}`,
        paddingLeft: isRead ? '16px' : '13px',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isRead ? 'var(--border)' : bg,
        }}
      >
        <Icon
          size={18}
          style={{ color: isRead ? 'var(--text-disabled)' : iconColor }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}
          >
            {item.title}
          </span>
          {item.timeBadge && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={
                isRead
                  ? { background: 'var(--border)', color: 'var(--text-disabled)' }
                  : { background: 'rgba(30,107,69,0.12)', color: 'var(--primary)' }
              }
            >
              {item.timeBadge}
            </span>
          )}
        </div>
        <p
          className="text-xs mt-0.5 leading-relaxed"
          style={{ color: isRead ? 'var(--text-disabled)' : 'var(--text-secondary)' }}
        >
          {item.description}
        </p>
        {item.actionLabel && item.actionHref && (
          <Link
            href={item.actionHref}
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead(item.id)
              onClose()
            }}
            className="inline-block mt-2 text-xs font-semibold"
            style={{
              color: 'var(--primary)',
              opacity: isRead ? 0.5 : 1,
            }}
          >
            {item.actionLabel} →
          </Link>
        )}
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="glass-surface rounded-2xl p-4 flex gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: 'var(--border)' }} />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 rounded-full w-2/5" style={{ background: 'var(--border)' }} />
        <div className="h-3 rounded-full w-4/5" style={{ background: 'var(--border)' }} />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--border)' }}
      >
        <Bell size={24} style={{ color: 'var(--text-disabled)' }} />
      </div>
      <p
        className="font-semibold"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '17px',
          color: 'var(--text-primary)',
        }}
      >
        Tiada Pemberitahuan
      </p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Semua amalan anda sudah selesai hari ini — MasyaAllah!
      </p>
    </div>
  )
}

function PanelContent({
  notifications,
  isLoading,
  readIds,
  onMarkRead,
  onClose,
}: {
  notifications: NotificationItem[]
  isLoading: boolean
  readIds: Set<string>
  onMarkRead: (id: string) => void
  onClose: () => void
}) {
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  return (
    <>
      {/* Header */}
      <div
        className="px-5 py-4 flex-shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h3
            className="font-semibold"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '18px',
              color: 'var(--text-primary)',
            }}
          >
            Pemberitahuan
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {isLoading
              ? 'Memuatkan…'
              : unreadCount > 0
              ? `${unreadCount} belum dibaca`
              : 'Semua sudah dibaca ✓'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}
          aria-label="Tutup"
        >
          <X size={15} />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              isRead={readIds.has(item.id)}
              onMarkRead={onMarkRead}
              onClose={onClose}
            />
          ))
        )}
      </div>
    </>
  )
}

export function NotificationPanel({
  open,
  onClose,
  notifications,
  isLoading,
  readIds,
  onMarkRead,
  variant,
}: Props) {
  const backdropOpacity = variant === 'sheet' ? 0.20 : 0.15

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55]"
            style={{ background: `rgba(0,0,0,${backdropOpacity})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {variant === 'sheet' ? (
            /* ── Mobile: slides down from top ── */
            <motion.div
              className="fixed left-0 right-0 z-[60] overflow-hidden flex flex-col"
              style={{
                top: 'calc(env(safe-area-inset-top) + 56px)',
                background: 'var(--surface-raised)',
                maxHeight: '65vh',
                borderRadius: '0 0 24px 24px',
                borderTop: '1px solid var(--border)',
              }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            >
              <PanelContent
                notifications={notifications}
                isLoading={isLoading}
                readIds={readIds}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
            </motion.div>
          ) : (
            /* ── Desktop: floating dropdown ── */
            <motion.div
              className="fixed z-[60] flex flex-col overflow-hidden"
              style={{
                left: '252px',
                top: '8px',
                width: '336px',
                maxHeight: '520px',
                borderRadius: '20px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              }}
              initial={{ opacity: 0, x: -16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            >
              <PanelContent
                notifications={notifications}
                isLoading={isLoading}
                readIds={readIds}
                onMarkRead={onMarkRead}
                onClose={onClose}
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
