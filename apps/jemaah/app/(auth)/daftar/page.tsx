import type { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Daftar Akaun' }

export default function DaftarPage() {
  return <RegisterForm />
}
