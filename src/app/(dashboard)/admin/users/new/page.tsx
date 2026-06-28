import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveLocations } from '@/server/queries/users.queries'
import { UserCreateForm } from '@/components/features/users/UserCreateForm'

export const metadata: Metadata = { title: 'Nuevo usuario — CIPRIJAL' }

export default async function NewUserPage() {
  const locations = await getActiveLocations()

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/users"
          style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
        >
          ← Volver a usuarios
        </Link>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#1a2332',
            marginTop: '8px',
            marginBottom: '4px',
          }}
        >
          Nuevo usuario
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Completa los datos para registrar un nuevo colaborador en el sistema.
        </p>
      </div>

      {/* Formulario */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '28px',
        }}
      >
        <UserCreateForm locations={locations} />
      </div>
    </div>
  )
}
