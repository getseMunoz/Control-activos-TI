import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminTI } from '@/lib/auth'
import { getUserById, getActiveLocations } from '@/server/queries/users.queries'
import { UserEditForm } from '@/components/features/users/UserEditForm'
import { DeactivateUserButton } from '@/components/features/users/DeactivateUserButton'
import { ResetUserPasswordForm } from '@/components/features/users/ResetUserPasswordForm'

export const metadata: Metadata = { title: 'Editar usuario — CIPRIJAL' }

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ passwordReset?: string }>
}

export default async function EditUserPage({ params, searchParams }: Props) {
  const [{ id }, { passwordReset }] = await Promise.all([params, searchParams])
  const [admin, user, locations] = await Promise.all([
    requireAdminTI(),
    getUserById(id),
    getActiveLocations(),
  ])

  if (!user) notFound()

  const isSelf = admin.id === user.id

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
          {user.firstName} {user.lastName}
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>{user.email}</p>
      </div>

      {/* Formulario */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '28px',
          marginBottom: '16px',
        }}
      >
        <UserEditForm user={user} locations={locations} />
      </div>

      {/* Confirmación de contraseña restablecida */}
      {passwordReset === 'success' && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#166534',
            fontWeight: '500',
          }}
        >
          Contraseña restablecida correctamente.
        </div>
      )}

      {/* Sección de restablecer contraseña — no mostrar al propio admin */}
      {!isSelf && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}
          >
            Restablecer contraseña
          </h2>
          <ResetUserPasswordForm
            userId={user.id}
            userName={`${user.firstName} ${user.lastName}`}
            userEmail={user.email}
          />
        </div>
      )}

      {/* Sección de desactivación */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          padding: '20px',
        }}
      >
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '8px' }}>
          {user.isActive ? 'Desactivar usuario' : 'Reactivar usuario'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
          {user.isActive
            ? 'Al desactivar, el usuario perderá acceso inmediatamente. Esta acción requiere que no tenga equipos asignados.'
            : 'Al reactivar, el usuario recuperará acceso al sistema con su contraseña anterior.'}
        </p>
        <DeactivateUserButton userId={user.id} isActive={user.isActive} />
      </div>
    </div>
  )
}
