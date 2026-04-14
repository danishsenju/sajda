'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { createProfile } from '@/app/actions/auth'

type Step = 'form' | 'verify-email'

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Kata laluan tidak sepadan.')
      return
    }
    if (password.length < 8) {
      setError('Kata laluan mestilah sekurang-kurangnya 8 aksara.')
      return
    }
    if (displayName.trim().length < 2) {
      setError('Nama mestilah sekurang-kurangnya 2 aksara.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (signUpError) {
        setError(
          signUpError.message.includes('already registered')
            ? 'E-mel ini sudah didaftarkan. Sila log masuk.'
            : signUpError.message
        )
        return
      }

      // Session is immediately available (email confirmation disabled in Supabase dashboard)
      if (data.session) {
        const { error: profileError } = await createProfile(displayName)
        if (profileError) {
          setError(profileError)
          return
        }
        router.push('/')
        router.refresh()
        return
      }

      // Email confirmation required — show verify step
      setStep('verify-email')
    })
  }

  function handleGoogleRegister() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) setError(error.message)
    })
  }

  // ── Email verification pending screen ─────────────────────────────────
  if (step === 'verify-email') {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'var(--primary)', border: '1px solid var(--border-accent)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--accent)" strokeWidth="1.8"/>
            <polyline points="22,6 12,13 2,6" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Semak E-mel Anda
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Kami telah menghantar pautan pengesahan ke{' '}
            <span style={{ color: 'var(--accent)' }}>{email}</span>.
            Klik pautan tersebut untuk mengaktifkan akaun anda.
          </p>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
          Tidak terima e-mel?{' '}
          <button
            type="button"
            className="underline"
            style={{ color: 'var(--accent)' }}
            onClick={() => setStep('form')}
          >
            Cuba semula
          </button>
        </p>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Google SSO */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={isPending}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
        style={{
          background: 'var(--surface-3)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Daftar dengan Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>atau e-mel</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        {/* Display name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Nama Paparan
          </label>
          <input
            type="text"
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nama anda"
            maxLength={60}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            E-mel
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Kata Laluan
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 aksara"
              minLength={8}
              className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              aria-label={showPassword ? 'Sembunyikan' : 'Tunjukkan'}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--text-dim)" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="3" stroke="var(--text-dim)" strokeWidth="1.8"/>
                </svg>
              )}
            </button>
          </div>

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-colors"
                  style={{
                    background: i < passwordStrength(password)
                      ? strengthColor(passwordStrength(password))
                      : 'var(--border)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Sahkan Kata Laluan
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulang kata laluan"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${
                confirmPassword && confirmPassword !== password
                  ? 'var(--error)'
                  : 'var(--border)'
              }`,
              color: 'var(--text)',
            }}
            onFocus={(e) => {
              if (!confirmPassword || confirmPassword === password)
                e.currentTarget.style.borderColor = 'var(--border-accent)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                confirmPassword && confirmPassword !== password ? 'var(--error)' : 'var(--border)'
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: 'rgba(231,76,60,0.1)', color: 'var(--error)', border: '1px solid rgba(231,76,60,0.2)' }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !email || !password || !displayName}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%)',
            color: '#0F1923',
            boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
          }}
        >
          {isPending ? 'Mendaftar…' : 'Daftar Akaun'}
        </button>

        <p className="text-[11px] text-center mt-1" style={{ color: 'var(--text-dim)' }}>
          Dengan mendaftar, anda bersetuju dengan{' '}
          <a href="/terma" style={{ color: 'var(--accent)' }}>Terma Perkhidmatan</a>
          {' '}dan{' '}
          <a href="/privasi" style={{ color: 'var(--accent)' }}>Dasar Privasi</a> kami.
        </p>
      </form>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function passwordStrength(pwd: string): number {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9!@#$%^&*]/.test(pwd)) score++
  return score
}

function strengthColor(score: number): string {
  if (score <= 1) return 'var(--error)'
  if (score === 2) return 'var(--warning)'
  if (score === 3) return 'var(--accent)'
  return 'var(--success)'
}
