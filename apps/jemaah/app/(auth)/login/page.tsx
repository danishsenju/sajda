import type { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Log Masuk',
}

export default function LoginPage() {
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
        <div className="mb-10 flex flex-col items-center gap-3">
          <Image
            src="/sajda-logo.png"
            alt="SAJDA"
            width={140}
            height={56}
            className="object-contain"
            priority
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
            Selamat Kembali
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Log masuk ke akaun SAJDA anda
          </p>

          <LoginForm />
        </div>

        {/* Register link */}
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Belum ada akaun?{' '}
          <a href="/daftar" style={{ color: 'var(--accent)' }} className="font-medium">
            Daftar sekarang
          </a>
        </p>
      </div>
    </main>
  )
}
