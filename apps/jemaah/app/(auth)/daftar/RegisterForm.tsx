'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { SajdaLogo } from '@/components/icons/sajda-logo'

/* ─── Animations ─────────────────────────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 30 },
  },
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Mosque silhouette ──────────────────────────────────────────────────── */

function MosqueSilhouette() {
  return (
    <svg viewBox="0 0 800 200" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <rect x="0" y="188" width="800" height="12" />
      <rect x="120" y="45" width="14" height="143" />
      <polygon points="127,18 113,48 141,48" />
      <rect x="123" y="8" width="8" height="12" />
      <path d="M210 115 Q255 78 300 115 Z" />
      <rect x="210" y="115" width="90" height="73" />
      <rect x="666" y="45" width="14" height="143" />
      <polygon points="673,18 659,48 687,48" />
      <rect x="669" y="8" width="8" height="12" />
      <path d="M500 115 Q545 78 590 115 Z" />
      <rect x="500" y="115" width="90" height="73" />
      <path d="M295 115 Q400 28 505 115 Z" />
      <rect x="270" y="115" width="260" height="73" />
      <path d="M365 188 L365 158 Q400 133 435 158 L435 188" fill="rgba(15,61,38,0.6)" />
    </svg>
  )
}

/* ─── Input wrapper ──────────────────────────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-[12px] font-semibold mb-1.5"
        style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

/* ─── RegisterForm ───────────────────────────────────────────────────────── */

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = (field: string): React.CSSProperties => ({
    background: 'var(--surface-input)',
    border: `1px solid ${focusedField === field ? 'var(--primary)' : 'var(--border)'}`,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-jakarta)',
    transition: 'border-color 0.15s ease',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')

    if (password !== confirmPassword) {
      setError('Kata laluan tidak sepadan.')
      return
    }
    if (password.length < 6) {
      setError('Kata laluan mestilah sekurang-kurangnya 6 aksara.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? 'Emel ini sudah didaftarkan.'
          : 'Pendaftaran gagal. Cuba semula.'
      )
      setLoading(false)
      return
    }

    if (data.user) {
      await (supabase as any)
        .from('jemaah_profiles')
        .insert({ user_id: data.user.id, display_name: name })
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--surface)' }}>

      {/* ── Left branded panel (desktop only) ── */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-between py-14 px-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E6B45 0%, #0F3D26 100%)' }}
      >
        <div />

        <div className="flex flex-col items-center gap-6 z-10">
          <SajdaLogo width={96} height={40} className="text-white" />
          <p
            className="text-[19px] text-center leading-loose"
            style={{ fontFamily: 'var(--font-amiri)', color: 'rgba(201,168,76,0.90)' }}
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>
          <p
            className="text-[15px] text-center max-w-[260px] leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'rgba(255,255,255,0.60)' }}
          >
            Rancang ibadah. Berhubung dengan jemaah.
          </p>
        </div>

        <div className="w-full" style={{ opacity: 0.07 }}>
          <MosqueSilhouette />
        </div>
      </div>

      {/* ── Right auth panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">

        {/* Mobile logo */}
        <div className="md:hidden flex flex-col items-center gap-2 mb-8">
          <SajdaLogo width={80} height={34} className="text-[--text-primary]" />
          <p
            className="text-[17px]"
            style={{ fontFamily: 'var(--font-amiri)', color: 'var(--gold)' }}
            dir="rtl"
          >
            بِسْمِ اللَّهِ
          </p>
        </div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div
            className="rounded-3xl p-6"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h1
              className="text-[28px] font-bold leading-tight mb-1"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--text-primary)' }}
            >
              Buat Akaun
            </h1>
            <p
              className="text-[13px] mb-6"
              style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-secondary)' }}
            >
              Sertai komuniti jemaah SAJDA
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nama */}
              <Field label="Nama Penuh">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ahmad bin Ibrahim"
                  required
                  autoComplete="name"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none placeholder:text-[--text-disabled]"
                  style={inputStyle('name')}
                />
              </Field>

              {/* Email */}
              <Field label="Emel">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@emel.com"
                  required
                  autoComplete="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none placeholder:text-[--text-disabled]"
                  style={inputStyle('email')}
                />
              </Field>

              {/* Password */}
              <Field label="Kata Laluan">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 aksara"
                    required
                    autoComplete="new-password"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full rounded-xl px-4 py-3 pr-11 text-[14px] outline-none placeholder:text-[--text-disabled]"
                    style={inputStyle('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center"
                    aria-label={showPass ? 'Sembunyikan kata laluan' : 'Tunjuk kata laluan'}
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              {/* Confirm password */}
              <Field label="Sahkan Kata Laluan">
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ulang kata laluan"
                    required
                    autoComplete="new-password"
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full rounded-xl px-4 py-3 pr-11 text-[14px] outline-none placeholder:text-[--text-disabled]"
                    style={inputStyle('confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center"
                    aria-label={showConfirm ? 'Sembunyikan kata laluan' : 'Tunjuk kata laluan'}
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              {/* Error */}
              {error && (
                <p
                  className="text-[12px]"
                  style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--error)' }}
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2 mt-1"
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </motion.button>
            </form>
          </div>

          {/* Bottom link */}
          <p
            className="mt-5 text-center text-[13px]"
            style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-secondary)' }}
          >
            Sudah ada akaun?{' '}
            <Link
              href="/login"
              className="font-semibold"
              style={{ color: 'var(--primary)' }}
            >
              Log masuk →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
