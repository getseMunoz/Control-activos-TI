import type { Metadata } from 'next'
import Link from 'next/link'
import { getAssetTypes } from '@/server/queries/asset-types.queries'
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

export const metadata: Metadata = { title: 'Tipos de activo — CIPRIJAL' }

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default async function AssetTypesPage() {
  const assetTypes = await getAssetTypes()

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
            Tipos de activo
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {assetTypes.length} {assetTypes.length === 1 ? 'tipo registrado' : 'tipos registrados'}
          </p>
        </div>
        <Link href="/admin/asset-types/new" className={buttonVariants()}>
          Nuevo tipo
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
            {assetTypes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}
                >
                  No hay tipos de activo registrados.
                </TableCell>
              </TableRow>
            )}
            {assetTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell style={{ fontWeight: '500', color: '#1a2332' }}>{type.name}</TableCell>
                <TableCell style={{ color: '#475569', fontSize: '13px' }}>
                  {type.description ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={type.isActive ? 'default' : 'outline'}>
                    {type.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: '#64748b', fontSize: '13px' }}>
                  {formatDate(type.createdAt)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/asset-types/${type.id}/edit`}
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
