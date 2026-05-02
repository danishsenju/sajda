import type { Metadata } from 'next'
import Image from 'next/image'
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
          <Image
            src="/sajda-logo.png"
            alt="SAJDA"
            width={120}
            height={48}
            className="object-contain"
            priority
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Komuniti Masjid Digital
          </p>
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
