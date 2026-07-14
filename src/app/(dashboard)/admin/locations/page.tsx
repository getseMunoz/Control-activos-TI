import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocations } from '@/server/queries/locations.queries'
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

export const metadata: Metadata = { title: 'Ubicaciones — CIPRIJAL' }

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default async function LocationsPage() {
  const locations = await getLocations()

  return (
    <div style={{ padding: '32px' }}>
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
            Ubicaciones
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {locations.length}{' '}
            {locations.length === 1 ? 'ubicación registrada' : 'ubicaciones registradas'}
          </p>
        </div>
        <Link href="/admin/locations/new" className={buttonVariants()}>
          Nueva ubicación
        </Link>
      </div>

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
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}
                >
                  No hay ubicaciones registradas.
                </TableCell>
              </TableRow>
            )}
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell style={{ fontWeight: '500', color: '#1a2332' }}>{loc.name}</TableCell>
                <TableCell style={{ color: '#475569', fontSize: '13px' }}>
                  {loc.description ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={loc.isActive ? 'default' : 'outline'}>
                    {loc.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: '#64748b', fontSize: '13px' }}>
                  {formatDate(loc.createdAt)}
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Link
                      href={`/admin/locations/${loc.id}`}
                      style={{
                        fontSize: '13px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: '500',
                      }}
                    >
                      Ver detalle
                    </Link>
                    <Link
                      href={`/admin/locations/${loc.id}/edit`}
                      style={{
                        fontSize: '13px',
                        color: '#2d6a4f',
                        textDecoration: 'none',
                        fontWeight: '500',
                      }}
                    >
                      Editar
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
