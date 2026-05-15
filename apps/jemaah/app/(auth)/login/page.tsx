import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Log Masuk' }

export default function LoginPage() {
  return <LoginForm />
}
