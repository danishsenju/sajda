'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Send, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type KomunitiRequest = {
  id: string
  author_name: string | null
  mosque_id: string | null
  mosque_name: string | null
  mosque_color: string | null
  category: string
  title: string
  description: string | null
  status: string
  helpers_count: number
  created_at: string
}

type FollowedMosque = {
  id: string
  name: string
  theme_color?: string | null
}

type Props = {
  mosques: FollowedMosque[]
  initialRequests: KomunitiRequest[]
  myHelpIds: string[]
}

const CATEGORIES = ['Semua', 'Keperluan', 'Khidmat', 'Barangan', 'Lain-lain'] as const
type Category = (typeof CATEGORIES)[number]
type PostCategory = Exclude<Category, 'Semua'>

type FormState = {
  title: string
  description: string
  category: PostCategory
  mosque_id: string
}

/* ─── Animation variants ─────────────────────────────────────────────────── */

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 420, damping: 32 } },
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function getCategoryStyle(category: string) {
  switch (category) {
    case 'Keperluan': return { bg: 'var(--primary-muted)', color: 'var(--primary)' }
    case 'Khidmat':   return { bg: 'rgba(184, 134, 11, 0.12)', color: 'var(--gold)' }
    case 'Barangan':  return { bg: 'rgba(107, 143, 212, 0.15)', color: '#6B8FD4' }
    case 'Lain-lain': return { bg: 'var(--surface-overlay)', color: 'var(--text-disabled)' }
    default:          return { bg: 'var(--surface-overlay)', color: 'var(--text-secondary)' }
  }
}

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'baru'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}j`
  return `${Math.floor(hrs / 24)}h`
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */

function EmptyState({ category }: { category: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 py-20"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
      >
        <Users size={24} strokeWidth={1.3} style={{ color: 'var(--text-disabled)' }} />
      </div>
      <p
        className="text-[20px] font-semibold"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--text-primary)' }}
      >
        {category === 'Semua' ? 'Tiada Permintaan' : `Tiada ${category}`}
      </p>
      <p
        className="text-[13px] text-center max-w-[200px]"
        style={{ color: 'var(--text-secondary)' }}
      >
        Jadilah yang pertama meminta bantuan komuniti
      </p>
    </motion.div>
  )
}

/* ─── FormBody ───────────────────────────────────────────────────────────── */

function FormBody({
  form,
  setForm,
  mosques,
  submitting,
  onSubmit,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  mosques: FollowedMosque[]
  submitting: boolean
  onSubmit: () => void
}) {
  const inputStyle = {
    background: 'var(--surface-overlay)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-jakarta)',
  } as React.CSSProperties

  return (
    <>
      {/* Title */}
      <div>
        <label
          className="block text-[12px] font-semibold mb-1.5"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-jakarta)' }}
        >
          Tajuk
        </label>
        <input
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Contoh: Perlukan kerusi roda..."
          className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-[12px] font-semibold mb-1.5"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-jakarta)' }}
        >
          Penerangan{' '}
          <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(pilihan)</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Berikan maklumat lanjut..."
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-[14px] outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Category pills */}
      <div>
        <label
          className="block text-[12px] font-semibold mb-2"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-jakarta)' }}
        >
          Kategori
        </label>
        <div className="flex flex-wrap gap-2">
          {(['Keperluan', 'Khidmat', 'Barangan', 'Lain-lain'] as PostCategory[]).map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setForm(prev => ({ ...prev, category: cat }))}
              type="button"
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
              style={{
                fontFamily: 'var(--font-jakarta)',
                background: form.category === cat ? 'var(--primary)' : 'var(--surface-overlay)',
                color: form.category === cat ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${form.category === cat ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mosque selector */}
      {mosques.length > 0 && (
        <div>
          <label
            className="block text-[12px] font-semibold mb-1.5"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-jakarta)' }}
          >
            Masjid{' '}
            <span style={{ color: 'var(--text-disabled)', fontWeight: 400 }}>(pilihan)</span>
          </label>
          <select
            value={form.mosque_id}
            onChange={e => setForm(prev => ({ ...prev, mosque_id: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none appearance-none"
            style={inputStyle}
          >
            <option value="">Tiada masjid</option>
            {mosques.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={submitting || !form.title.trim()}
        className="w-full py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2"
        style={{
          fontFamily: 'var(--font-jakarta)',
          background: 'var(--primary)',
          color: '#ffffff',
          opacity: submitting || !form.title.trim() ? 0.5 : 1,
        }}
      >
        {submitting ? (
          <span>Menghantar...</span>
        ) : (
          <>
            <Send size={15} />
            <span>Hantar Permintaan</span>
          </>
        )}
      </motion.button>
    </>
  )
}

/* ─── KomunitiContent ────────────────────────────────────────────────────── */

export function KomunitiContent({ mosques, initialRequests, myHelpIds }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('Semua')
  const [requests, setRequests] = useState<KomunitiRequest[]>(initialRequests)
  const [myHelps, setMyHelps] = useState<Set<string>>(new Set(myHelpIds))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [helpingId, setHelpingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: 'Keperluan',
    mosque_id: '',
  })

  const filtered = useMemo(() => {
    if (activeCategory === 'Semua') return requests
    return requests.filter(r => r.category === activeCategory)
  }, [requests, activeCategory])

  async function toggleHelp(requestId: string) {
    setHelpingId(requestId)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setHelpingId(null); return }

    if (myHelps.has(requestId)) {
      await (supabase as any)
        .from('keperluan_helpers')
        .delete()
        .eq('user_id', user.id)
        .eq('keperluan_id', requestId)
      setMyHelps(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
      setRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, helpers_count: Math.max(0, r.helpers_count - 1) } : r)
      )
    } else {
      await (supabase as any)
        .from('keperluan_helpers')
        .insert({ user_id: user.id, keperluan_id: requestId })
      setMyHelps(prev => new Set([...prev, requestId]))
      setRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, helpers_count: r.helpers_count + 1 } : r)
      )
    }
    setHelpingId(null)
  }

  async function handleSubmit() {
    if (!form.title.trim() || submitting) return
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const { data: profile } = await (supabase as any)
      .from('jemaah_profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()

    const { data: newRequest, error } = await (supabase as any)
      .from('keperluan')
      .insert({
        user_id: user.id,
        author_name: profile?.display_name ?? null,
        mosque_id: form.mosque_id || null,
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: 'aktif',
        helpers_count: 0,
      })
      .select()
      .single()

    if (!error && newRequest) {
      const mosque = mosques.find(m => m.id === newRequest.mosque_id)
      setRequests(prev => [{
        ...newRequest,
        mosque_name: mosque?.name ?? null,
        mosque_color: mosque?.theme_color ?? null,
      }, ...prev])
    }

    setForm({ title: '', description: '', category: 'Keperluan', mosque_id: '' })
    setSheetOpen(false)
    setSubmitting(false)
  }

  return (
    <div className="relative min-h-full">

      {/* ── Page header ── */}
      <div className="px-4 pt-6 pb-2 md:pt-2 md:pb-4">
        <h1
          className="text-[32px] font-bold leading-none"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--text-primary)' }}
        >
          Komuniti
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Bantu sesama jemaah
        </p>
      </div>

      {/* ── Filter pills ── */}
      <div
        className="sticky top-0 z-10 py-3 overflow-x-auto"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex gap-2 px-4 min-w-max md:min-w-0 md:flex-wrap">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-jakarta)',
                background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeCategory === cat ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="md:grid md:grid-cols-[1fr_320px] md:gap-6 md:items-start">

        {/* ── Request cards ── */}
        <div className="px-4 pb-32 md:px-0 md:pb-8">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <EmptyState key="empty" category={activeCategory} />
            ) : (
              <motion.div
                key={activeCategory}
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-3 pt-1"
              >
                {filtered.map(req => {
                  const catStyle = getCategoryStyle(req.category)
                  const helped = myHelps.has(req.id)
                  const isHelping = helpingId === req.id

                  return (
                    <motion.div
                      key={req.id}
                      variants={cardVariants}
                      className="rounded-2xl p-4"
                      style={{
                        background: 'var(--surface-raised)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {/* Top: badge + time */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: catStyle.bg, color: catStyle.color }}
                        >
                          {req.category}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>
                          {formatRelativeTime(req.created_at)}
                        </span>
                      </div>

                      {/* Title */}
                      <p
                        className="text-[16px] font-semibold leading-snug mb-1"
                        style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}
                      >
                        {req.title}
                      </p>

                      {/* Description */}
                      {req.description && (
                        <p
                          className="text-[13px] leading-relaxed line-clamp-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {req.description}
                        </p>
                      )}

                      {/* Bottom: author + action */}
                      <div
                        className="flex items-center justify-between mt-3 pt-3"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                            style={{
                              background: 'var(--primary-muted)',
                              color: 'var(--primary)',
                              fontFamily: 'var(--font-cormorant)',
                            }}
                          >
                            {getInitials(req.author_name)}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="text-[12px] font-semibold truncate"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {req.author_name ?? 'Jemaah'}
                            </p>
                            {req.mosque_name && (
                              <p className="text-[11px] truncate" style={{ color: 'var(--text-disabled)' }}>
                                {req.mosque_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {req.helpers_count > 0 && (
                            <span
                              className="text-[11px] hidden sm:inline"
                              style={{ color: 'var(--text-disabled)' }}
                            >
                              {req.helpers_count} membantu
                            </span>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            onClick={() => toggleHelp(req.id)}
                            disabled={isHelping}
                            className="px-3 py-1.5 rounded-full text-[12px] font-semibold"
                            style={{
                              fontFamily: 'var(--font-jakarta)',
                              ...(helped
                                ? {
                                    background: 'var(--primary-muted)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary-muted)',
                                  }
                                : {
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                  }),
                            }}
                          >
                            {isHelping ? '···' : helped ? 'Dibantu ✓' : 'Hubungi'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Desktop sticky form panel ── */}
        <div className="hidden md:block">
          <div
            className="sticky top-4 rounded-3xl overflow-hidden"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2
                className="text-[22px] font-bold"
                style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--text-primary)' }}
              >
                Hantar Permintaan
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Minta bantuan daripada jemaah
              </p>
            </div>
            <div className="p-5 space-y-4">
              <FormBody
                form={form}
                setForm={setForm}
                mosques={mosques}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── FAB (mobile only) ── */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setSheetOpen(true)}
        className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-20"
        style={{
          background: 'var(--primary)',
          boxShadow: '0 4px 20px rgba(30, 107, 69, 0.35)',
        }}
        aria-label="Hantar permintaan"
      >
        <Plus size={24} color="#ffffff" />
      </motion.button>

      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.40)' }}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring' as const, damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl overflow-y-auto"
              style={{
                background: 'var(--surface-raised)',
                maxHeight: '80vh',
              }}
            >
              {/* Drag handle */}
              <div
                className="flex justify-center pt-3 pb-1 sticky top-0"
                style={{ background: 'var(--surface-raised)' }}
              >
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--border-strong)' }}
                />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <h2
                  className="text-[24px] font-bold"
                  style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--text-primary)' }}
                >
                  Hantar Permintaan
                </h2>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSheetOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--surface-overlay)' }}
                >
                  <X size={16} style={{ color: 'var(--text-secondary)' }} />
                </motion.button>
              </div>

              {/* Form */}
              <div className="px-5 pb-10 space-y-4">
                <FormBody
                  form={form}
                  setForm={setForm}
                  mosques={mosques}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
