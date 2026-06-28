import type { Metadata } from 'next'
import Link from 'next/link'
import { getUsers } from '@/server/queries/users.queries'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = { title: 'Usuarios — CIPRIJAL' }

const roleLabel: Record<string, string> = {
  admin_ti: 'Admin TI',
  usuario_final: 'Usuario Final',
}

const modalityLabel: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div style={{ padding: '32px' }}>
      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{ fontSize: '22px', fontWeight: '600', color: '#1a2332', marginBottom: '4px' }}
          >
            Usuarios
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
          </p>
        </div>
        <Link href="/admin/users/new" className={buttonVariants()}>
          Nuevo usuario
        </Link>
      </div>

      {/* Tabla */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}
                >
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell style={{ fontWeight: '500', color: '#1a2332' }}>
                  {user.firstName} {user.lastName}
                  {user.position && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '400',
                      }}
                    >
                      {user.position}
                    </span>
                  )}
                </TableCell>
                <TableCell style={{ color: '#475569', fontSize: '13px' }}>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin_ti' ? 'default' : 'secondary'}>
                    {roleLabel[user.role] ?? user.role}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: '#475569', fontSize: '13px' }}>
                  {user.location?.name ?? '—'}
                </TableCell>
                <TableCell style={{ color: '#475569', fontSize: '13px' }}>
                  {user.modality ? (modalityLabel[user.modality] ?? user.modality) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'outline'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: '#64748b', fontSize: '13px' }}>
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    style={{
                      fontSize: '13px',
                      color: '#2d6a4f',
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    Editar
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
