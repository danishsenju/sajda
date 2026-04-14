import type { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Daftar Akaun',
}

export default function DaftarPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 safe-top safe-bottom"
      style={{ background: 'var(--surface)' }}
    >
      {/* Background radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(18,77,84,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #0d3326 100%)',
              border: '1px solid var(--border-accent)',
              boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 6 7 6 12.5C6 15.81 8.69 18.5 12 18.5C15.31 18.5 18 15.81 18 12.5C18 7 12 2 12 2Z"
                fill="var(--primary-soft)"
                stroke="var(--accent)"
                strokeWidth="1.2"
              />
              <path
                d="M4 23V20H20V23M1 20H23"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="16" cy="5" r="1.2" fill="var(--accent)" />
            </svg>
          </div>
          <div className="text-center">
            <h1
              className="text-2xl font-bold tracking-widest"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-playfair)' }}
            >
              SAJDA
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Komuniti Masjid Digital
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Buat Akaun Baru
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Sertai komuniti masjid digital Malaysia
          </p>

          <RegisterForm />
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Sudah ada akaun?{' '}
          <a href="/login" style={{ color: 'var(--accent)' }} className="font-medium">
            Log masuk
          </a>
        </p>
      </div>
    </main>
  )
}
