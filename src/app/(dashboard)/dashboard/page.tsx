import type { Metadata } from 'next'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a2332', marginBottom: '4px' }}>
        Bienvenido, {session?.user?.name ?? session?.user?.email}
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px' }}>
        Panel de control — CIPRIJAL Gestión de Activos TI
      </p>
    </div>
  )
}
