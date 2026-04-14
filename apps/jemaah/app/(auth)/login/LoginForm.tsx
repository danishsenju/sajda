'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'E-mel atau kata laluan tidak betul.'
            : error.message
        )
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  function handleGoogleLogin() {
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

  return (
    <div className="flex flex-col gap-4">
      {/* Google SSO */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
        style={{
          background: 'var(--surface-3)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        {/* Google icon */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Teruskan dengan Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>atau e-mel</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Email + password form */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
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
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Kata Laluan
            </label>
            <a href="/lupa-kata-laluan" className="text-xs" style={{ color: 'var(--accent)' }}>
              Lupa kata laluan?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-colors"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}
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
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(231,76,60,0.1)', color: 'var(--error)', border: '1px solid rgba(231,76,60,0.2)' }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !email || !password}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%)',
            color: '#0F1923',
            boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
          }}
        >
          {isPending ? 'Sedang log masuk…' : 'Log Masuk'}
        </button>
      </form>
    </div>
  )
}
