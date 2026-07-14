import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdminTI } from '@/lib/auth'
import { getLocationDetail } from '@/server/queries/locations.queries'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Detalle de ubicación — CIPRIJAL' }

const STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_storage: 'default',
  assigned: 'secondary',
  in_maintenance: 'outline',
  decommissioned: 'destructive',
  stolen: 'destructive',
  lost: 'destructive',
}

const ROLE_LABELS: Record<string, string> = {
  admin_ti: 'Administrador TI',
  usuario_final: 'Usuario Final',
}

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px 24px',
  marginBottom: '16px',
}

const sectionTitle = {
  fontSize: '13px',
  fontWeight: '600' as const,
  color: '#475569',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '14px',
}

function fmt(d: Date): string {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

type Props = { params: Promise<{ id: string }> }

export default async function LocationDetailPage({ params }: Props) {
  await requireAdminTI()
  const { id } = await params
  const location = await getLocationDetail(id)

  if (!location) notFound()

  const totalAssets = location.assets.length
  const totalUsers = location.users.length
  const assetsByStatus = location.assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})
  const openIncidentsTotal = location.assets.reduce((sum, a) => sum + a._count.incidents, 0)
  const activeMaintenanceTotal = location.assets.reduce(
    (sum, a) => sum + a._count.maintenanceOrders,
    0,
  )

  const statuses = Object.entries(assetsByStatus).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div style={{ padding: '32px', maxWidth: '1080px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          href="/admin/locations"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Ubicaciones
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '4px',
                flexWrap: 'wrap',
              }}
            >
              <Badge variant={location.isActive ? 'default' : 'outline'}>
                {location.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
              {location.deletedAt && <Badge variant="destructive">Eliminada</Badge>}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, color: '#0f172a' }}>
              {location.name}
            </h1>
            {location.description && (
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
                {location.description}
              </p>
            )}
          </div>

          <Link
            href={`/admin/locations/${location.id}/edit`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'Usuarios', value: totalUsers, color: '#2d6a4f' },
          { label: 'Activos totales', value: totalAssets, color: '#1d4ed8' },
          {
            label: 'Incidencias abiertas',
            value: openIncidentsTotal,
            color: openIncidentsTotal > 0 ? '#dc2626' : '#64748b',
          },
          {
            label: 'Mantenimientos activos',
            value: activeMaintenanceTotal,
            color: activeMaintenanceTotal > 0 ? '#d97706' : '#64748b',
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
            }}
          >
            <p style={{ fontSize: '28px', fontWeight: '700', color: s.color, margin: '0 0 4px' }}>
              {s.value}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{s.label}</p>
          </div>
        ))}
        {statuses.map(([status, count]) => (
          <div
            key={status}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
            }}
          >
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
              {count}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              {STATUS_LABELS[status] ?? status}
            </p>
          </div>
        ))}
      </div>

      {/* Activos en esta ubicación */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Activos en esta ubicación ({totalAssets})</p>

        {totalAssets === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            No hay activos registrados en esta ubicación.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Código', 'Nombre', 'Serie', 'Tipo', 'Estado', 'Asignado a', 'Alertas', ''].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          background: '#f8fafc',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {location.assets.map((asset, i) => {
                  const assignee = asset.assignments[0]?.user
                  const alerts = asset._count.incidents + asset._count.maintenanceOrders
                  return (
                    <tr
                      key={asset.id}
                      style={{
                        borderBottom:
                          i < location.assets.length - 1 ? '1px solid #f1f5f9' : undefined,
                      }}
                    >
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            background: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            color: '#475569',
                          }}
                        >
                          {asset.internalCode}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '500', color: '#0f172a' }}>
                        {asset.name}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          whiteSpace: 'nowrap',
                          fontFamily: 'monospace',
                          color: '#64748b',
                          fontSize: '12px',
                        }}
                      >
                        {asset.serialNumber}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {asset.assetType.name}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <Badge variant={STATUS_VARIANTS[asset.status] ?? 'outline'}>
                          {STATUS_LABELS[asset.status] ?? asset.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {assignee ? (
                          `${assignee.firstName} ${assignee.lastName}`
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        {alerts > 0 ? (
                          <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                            {alerts} alerta{alerts > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <Link
                          href={`/assets/${asset.id}`}
                          style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usuarios en esta ubicación */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Usuarios en esta ubicación ({totalUsers})</p>

        {totalUsers === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            No hay usuarios registrados en esta ubicación.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Nombre', 'Correo', 'Puesto', 'Rol', 'Estado', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        background: '#f8fafc',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {location.users.map((user, i) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: i < location.users.length - 1 ? '1px solid #f1f5f9' : undefined,
                      opacity: user.isActive ? 1 : 0.6,
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontWeight: '500', color: '#0f172a' }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>{user.email}</td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>
                      {user.position ?? '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={user.role === 'admin_ti' ? 'default' : 'secondary'}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={user.isActive ? 'default' : 'outline'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Link
                        href={`/admin/users/${user.id}`}
                        style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Metadatos */}
      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 0' }}>
        Alta: {fmt(location.createdAt)} · Última actualización: {fmt(location.updatedAt)}
      </p>
    </div>
  )
}
