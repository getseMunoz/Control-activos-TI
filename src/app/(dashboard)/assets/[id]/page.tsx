import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdminTI } from '@/lib/auth'
import { getAssetDetailById } from '@/server/queries/assets.queries'
import { getCredentialsByAssetId } from '@/server/queries/credentials.queries'
import { getTechnicalInfoByAssetId } from '@/server/queries/technical-info.queries'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CredentialsPanel } from '@/components/features/assets/CredentialsPanel'
import { formatDate } from '@/lib/dates'

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

const INCIDENT_STATUS_LABELS: Record<string, string> = {
  open: 'Abierta',
  in_review: 'En revisión',
  in_progress: 'En proceso',
  resolved: 'Resuelta',
  closed: 'Cerrada',
}

const INCIDENT_STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  open: 'default',
  in_review: 'secondary',
  in_progress: 'outline',
  resolved: 'secondary',
  closed: 'outline',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'default',
  critical: 'destructive',
}

const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventivo',
  corrective: 'Correctivo',
  warranty_repair: 'Garantía',
}

const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  waiting_parts: 'Esperando piezas',
  waiting_supplier: 'Esperando proveedor',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const MAINTENANCE_STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'outline',
  in_progress: 'default',
  waiting_parts: 'secondary',
  waiting_supplier: 'secondary',
  completed: 'secondary',
  cancelled: 'destructive',
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

const rowStyle = {
  display: 'flex' as const,
  gap: '8px',
  padding: '7px 0',
  borderBottom: '1px solid #f1f5f9',
  fontSize: '13px',
}

const labelStyle = {
  color: '#94a3b8',
  width: '170px',
  flexShrink: 0 as const,
}

const valueStyle = {
  color: '#1e293b',
  fontWeight: '400' as const,
}

function fmt(d: Date | null | undefined, time = false): string {
  if (!d) return '—'
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  if (time) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return d.toLocaleDateString('es-MX', opts)
}

type Props = { params: Promise<{ id: string }> }

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params
  const [asset] = await Promise.all([getAssetDetailById(id), requireAdminTI()])

  if (!asset) notFound()

  const isAdmin = true
  const [credentials, technicalInfo] = isAdmin
    ? await Promise.all([getCredentialsByAssetId(id), getTechnicalInfoByAssetId(id)])
    : [[], null]

  const activeAssignment = asset.assignments.find((a) => a.returnedAt === null) ?? null
  const canAssign = asset.status === 'in_storage' && asset.deletedAt === null
  const totalExpenses = asset.expenses.reduce((sum, e) => sum + Number(e.cost), 0)
  const openIncidents = asset.incidents.filter(
    (inc) => inc.status === 'open' || inc.status === 'in_review' || inc.status === 'in_progress',
  ).length
  const activeMaintenanceOrders = asset.maintenanceOrders.filter(
    (m) =>
      m.status === 'pending' ||
      m.status === 'in_progress' ||
      m.status === 'waiting_parts' ||
      m.status === 'waiting_supplier',
  ).length

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '20px' }}>
        <Link
          href="/assets"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Activos
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
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  background: '#f1f5f9',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: '#475569',
                }}
              >
                {asset.internalCode}
              </span>
              <Badge variant={STATUS_VARIANTS[asset.status] ?? 'outline'}>
                {STATUS_LABELS[asset.status] ?? asset.status}
              </Badge>
              <Badge variant={asset.deletedAt ? 'outline' : 'default'}>
                {asset.deletedAt ? 'Archivado' : 'Activo'}
              </Badge>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0, color: '#0f172a' }}>
              {asset.name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {canAssign && (
              <Link href="/assignments/new" className={buttonVariants({ size: 'sm' })}>
                + Asignar
              </Link>
            )}
            <Link
              href={`/assets/${asset.id}/edit`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Editar
            </Link>
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:[grid-template-columns:1fr_1fr]"
        style={{
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Información general */}
        <div style={cardStyle}>
          <p style={sectionTitle}>Información general</p>
          {[
            ['Tipo de activo', asset.assetType.name],
            ['Marca', asset.brand],
            ['Modelo', asset.model],
            ['Número de serie', asset.serialNumber],
            ['Número de parte', asset.partNumber],
            ['N.º activo CIPRIJAL', asset.companyAssetNumber],
            ['Modelo interno', asset.companyModel],
            ['Etiqueta inventario', asset.inventoryTag],
            ['Ubicación actual', asset.location?.name],
            ['Fecha de compra', formatDate(asset.purchaseDate)],
            [
              'Precio de compra',
              asset.purchasePrice
                ? `$${Number(asset.purchasePrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                : null,
            ],
            ['Proveedor', asset.supplierName],
            ['Factura', asset.invoiceNumber],
            ['Vencimiento garantía', fmt(asset.warrantyExpiryDate)],
            ['Vida útil (años)', asset.usefulLifeYears?.toString()],
          ].map(([label, value]) => (
            <div key={label} style={rowStyle}>
              <span style={labelStyle}>{label}</span>
              <span style={valueStyle}>{value ?? '—'}</span>
            </div>
          ))}
          {asset.notes && (
            <div style={{ ...rowStyle, borderBottom: 'none', flexDirection: 'column', gap: '4px' }}>
              <span style={labelStyle}>Notas</span>
              <span style={{ ...valueStyle, whiteSpace: 'pre-line', color: '#475569' }}>
                {asset.notes}
              </span>
            </div>
          )}
        </div>

        {/* Control del sistema */}
        <div>
          <div style={cardStyle}>
            <p style={sectionTitle}>Control del sistema</p>
            {[
              ['Creado por', `${asset.createdByUser.firstName} ${asset.createdByUser.lastName}`],
              ['Fecha de creación', fmt(asset.createdAt, true)],
              [
                'Actualizado por',
                asset.updatedByUser
                  ? `${asset.updatedByUser.firstName} ${asset.updatedByUser.lastName}`
                  : null,
              ],
              ['Última actualización', fmt(asset.updatedAt, true)],
            ].map(([label, value]) => (
              <div key={label} style={rowStyle}>
                <span style={labelStyle}>{label}</span>
                <span style={valueStyle}>{value ?? '—'}</span>
              </div>
            ))}
          </div>

          {/* Asignación actual */}
          <div style={cardStyle}>
            <p style={sectionTitle}>Asignación actual</p>
            {activeAssignment ? (
              <>
                {[
                  [
                    'Usuario',
                    `${activeAssignment.user.firstName} ${activeAssignment.user.lastName}`,
                  ],
                  [
                    'Puesto',
                    activeAssignment.user.position ??
                      ROLE_LABELS[activeAssignment.user.role] ??
                      activeAssignment.user.role,
                  ],
                  ['Correo', activeAssignment.user.email],
                  ['Fecha de asignación', formatDate(activeAssignment.assignedAt)],
                  ['Ubicación de entrega', activeAssignment.deliveryLocation?.name],
                  [
                    'Firma de recepción',
                    activeAssignment.deliverySignedAt ? 'Registrada' : 'Sin firma',
                  ],
                  ['Firmante', activeAssignment.deliverySignedByName],
                  ['Fecha de firma', fmt(activeAssignment.deliverySignedAt)],
                ].map(([label, value]) => (
                  <div key={label} style={rowStyle}>
                    <span style={labelStyle}>{label}</span>
                    <span style={valueStyle}>{value ?? '—'}</span>
                  </div>
                ))}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    href={`/assignments/${activeAssignment.id}/receipt`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    Ver responsiva
                  </Link>
                  <Link
                    href={`/assignments/${activeAssignment.id}/return`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                  >
                    Registrar devolución
                  </Link>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Sin asignación activa.{' '}
                {canAssign && (
                  <Link href="/assignments/new" style={{ color: '#3b82f6' }}>
                    Asignar ahora
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Historial de asignaciones */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Historial de asignaciones ({asset.assignments.length})</p>

        {asset.assignments.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Este activo no ha sido asignado aún.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    'Usuario',
                    'F. Asignación',
                    'F. Devolución',
                    'Ubicación entrega',
                    'Asignado por',
                    'Devuelto por',
                    'Estado',
                    'Firma entrega',
                    'Firma devol.',
                    '',
                  ].map((h) => (
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
                {asset.assignments.map((a, i) => {
                  const isActive = a.returnedAt === null
                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom:
                          i < asset.assignments.length - 1 ? '1px solid #f1f5f9' : undefined,
                        opacity: isActive ? 1 : 0.75,
                      }}
                    >
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'block', fontWeight: '500' }}>
                          {a.user.firstName} {a.user.lastName}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>
                          {a.user.position ?? ROLE_LABELS[a.user.role] ?? a.user.role}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{a.user.email}</span>
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {formatDate(a.assignedAt)}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.returnedAt ? formatDate(a.returnedAt) : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.deliveryLocation?.name ?? '—'}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.assignedByUser.firstName} {a.assignedByUser.lastName}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.returnedByUser
                          ? `${a.returnedByUser.firstName} ${a.returnedByUser.lastName}`
                          : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <Badge variant={isActive ? 'default' : 'outline'}>
                          {isActive ? 'Activa' : 'Devuelta'}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        {a.deliverySignedAt ? (
                          <span style={{ fontSize: '12px', color: '#16a34a' }}>Registrada</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sin firma</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        {a.returnedAt === null ? (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Pendiente</span>
                        ) : a.returnSignedAt ? (
                          <span style={{ fontSize: '12px', color: '#16a34a' }}>Registrada</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#ef4444' }}>Sin firma</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Link
                            href={`/assignments/${a.id}/receipt`}
                            style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
                          >
                            Responsiva
                          </Link>
                          {a.returnedAt !== null && (
                            <Link
                              href={`/assignments/${a.id}/return-receipt`}
                              style={{ fontSize: '12px', color: '#7c3aed', textDecoration: 'none' }}
                            >
                              Resp. devolución
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incidencias del activo */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div>
            <p style={{ ...sectionTitle, marginBottom: '4px' }}>
              Incidencias ({asset.incidents.length})
            </p>
            {asset.incidents.length > 0 && (
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                {openIncidents === 0
                  ? 'Sin incidencias abiertas'
                  : `${openIncidents} incidencia${openIncidents > 1 ? 's' : ''} abierta${openIncidents > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          {!asset.deletedAt && (
            <Link
              href={`/assets/${asset.id}/incidents/new`}
              className={buttonVariants({ size: 'sm' })}
            >
              + Registrar incidencia
            </Link>
          )}
        </div>

        {asset.incidents.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Este activo no tiene incidencias registradas.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    'Folio',
                    'Fecha',
                    'Título',
                    'Prioridad',
                    'Estado',
                    'Reportado por',
                    'Resuelto por',
                    'F. Resolución',
                    'Descripción',
                    '',
                  ].map((h) => (
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
                {asset.incidents.map((inc, i) => (
                  <tr
                    key={inc.id}
                    style={{
                      borderBottom:
                        i < asset.incidents.length - 1 ? '1px solid #f1f5f9' : undefined,
                      opacity: inc.status === 'closed' ? 0.7 : 1,
                    }}
                  >
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {inc.incidentNumber}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(inc.createdAt)}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: '200px' }}>
                      <span style={{ fontWeight: '500', color: '#0f172a' }}>{inc.title}</span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={PRIORITY_VARIANTS[inc.priority] ?? 'outline'}>
                        {PRIORITY_LABELS[inc.priority] ?? inc.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={INCIDENT_STATUS_VARIANTS[inc.status] ?? 'outline'}>
                        {INCIDENT_STATUS_LABELS[inc.status] ?? inc.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {inc.reportedByUser.firstName} {inc.reportedByUser.lastName}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {inc.resolvedByUser
                        ? `${inc.resolvedByUser.firstName} ${inc.resolvedByUser.lastName}`
                        : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {inc.resolvedAt ? formatDate(inc.resolvedAt) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        color: '#64748b',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={inc.description}
                    >
                      {inc.description}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {inc.status !== 'closed' && (
                        <Link
                          href={`/assets/${asset.id}/incidents/${inc.id}/edit`}
                          style={{ color: '#3b82f6', fontSize: '13px' }}
                        >
                          Actualizar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gastos del activo */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div>
            <p style={{ ...sectionTitle, marginBottom: '4px' }}>
              Gastos del activo ({asset.expenses.length})
            </p>
            {asset.expenses.length > 0 && (
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                Total acumulado:{' '}
                <strong>
                  $
                  {totalExpenses.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  MXN
                </strong>
              </p>
            )}
          </div>
          {!asset.deletedAt && (
            <Link
              href={`/assets/${asset.id}/expenses/new`}
              className={buttonVariants({ size: 'sm' })}
            >
              + Registrar gasto
            </Link>
          )}
        </div>

        {asset.expenses.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Este activo no tiene gastos registrados.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    'Fecha',
                    'Descripción',
                    'Monto (MXN)',
                    'Proveedor',
                    'Factura',
                    'Registrado por',
                    'Notas',
                  ].map((h) => (
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
                {asset.expenses.map((e, i) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: i < asset.expenses.length - 1 ? '1px solid #f1f5f9' : undefined,
                    }}
                  >
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {formatDate(e.purchaseDate)}
                    </td>
                    <td style={{ padding: '8px 10px' }}>{e.name}</td>
                    <td
                      style={{
                        padding: '8px 10px',
                        whiteSpace: 'nowrap',
                        fontWeight: '500',
                        color: '#0f172a',
                      }}
                    >
                      $
                      {Number(e.cost).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {e.supplierName ?? '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {e.invoiceNumber ?? '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {e.createdByUser.firstName} {e.createdByUser.lastName}
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        color: '#64748b',
                        maxWidth: '200px',
                      }}
                    >
                      {e.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información técnica — solo admin_ti */}
      {isAdmin && (
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div>
              <p style={{ ...sectionTitle, marginBottom: '4px' }}>Información técnica</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Visible solo para Administradores TI. No se incluye en responsivas ni exportaciones.
              </p>
            </div>
            {!asset.deletedAt && (
              <Link
                href={`/assets/${asset.id}/technical-info/edit`}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                {technicalInfo ? 'Editar' : 'Agregar info técnica'}
              </Link>
            )}
          </div>

          {technicalInfo ? (
            <div>
              {[
                ['Hostname', technicalInfo.hostname],
                ['Dirección IP local', technicalInfo.ipAddress],
                ['IP pública', technicalInfo.publicIpAddress],
                ['MAC ETH0 (cable)', technicalInfo.macAddressEth0],
                ['MAC Wi-Fi', technicalInfo.macAddressWifi],
                ['Sistema operativo', technicalInfo.operatingSystem],
                ['Versión de Office', technicalInfo.officeVersion],
                ['Versión de firmware', technicalInfo.firmwareVersion],
                ['Número de modelo', technicalInfo.modelNumber],
                ['Orden de compra', technicalInfo.orderNumber],
                ['BYOD', technicalInfo.byod ? 'Sí (equipo del empleado)' : 'No'],
                ['Prestable', technicalInfo.requestable ? 'Sí' : 'No'],
              ].map(([label, value]) => (
                <div key={label as string} style={rowStyle}>
                  <span style={labelStyle}>{label}</span>
                  <span style={valueStyle}>{value ?? '—'}</span>
                </div>
              ))}
              {technicalInfo.additionalNotes && (
                <div
                  style={{ ...rowStyle, borderBottom: 'none', flexDirection: 'column', gap: '4px' }}
                >
                  <span style={labelStyle}>Notas técnicas</span>
                  <span style={{ ...valueStyle, whiteSpace: 'pre-line', color: '#475569' }}>
                    {technicalInfo.additionalNotes}
                  </span>
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', marginBottom: 0 }}>
                Actualizado:{' '}
                {technicalInfo.updatedByUser
                  ? `${technicalInfo.updatedByUser.firstName} ${technicalInfo.updatedByUser.lastName} · `
                  : ''}
                {fmt(technicalInfo.updatedAt, true)}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Sin información técnica registrada.{' '}
              {!asset.deletedAt && (
                <Link href={`/assets/${asset.id}/technical-info/edit`} style={{ color: '#3b82f6' }}>
                  Agregar ahora
                </Link>
              )}
            </p>
          )}
        </div>
      )}

      {/* Credenciales del activo — solo admin_ti */}
      {isAdmin && (
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div>
              <p style={{ ...sectionTitle, marginBottom: '4px' }}>
                Credenciales del activo ({credentials.length})
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Usuarios de acceso, contraseñas, SSID Wi-Fi, credenciales originales, panel de
                módem/router, acceso administrador. Solo para Administradores TI.
              </p>
            </div>
          </div>
          <CredentialsPanel
            assetId={asset.id}
            credentials={credentials}
            isArchived={asset.deletedAt !== null}
          />
        </div>
      )}

      {/* Mantenimiento del activo */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div>
            <p style={{ ...sectionTitle, marginBottom: '4px' }}>
              Mantenimiento ({asset.maintenanceOrders.length})
            </p>
            {asset.maintenanceOrders.length > 0 && (
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                {activeMaintenanceOrders === 0
                  ? 'Sin órdenes activas'
                  : `${activeMaintenanceOrders} orden${activeMaintenanceOrders > 1 ? 'es' : ''} activa${activeMaintenanceOrders > 1 ? 's' : ''}`}
              </p>
            )}
          </div>
          {!asset.deletedAt && (
            <Link
              href={`/assets/${asset.id}/maintenance/new`}
              className={buttonVariants({ size: 'sm' })}
            >
              + Registrar mantenimiento
            </Link>
          )}
        </div>

        {asset.maintenanceOrders.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Este activo no tiene mantenimientos registrados.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    'Folio',
                    'Fecha',
                    'Título',
                    'Tipo',
                    'Estado',
                    'Costo (MXN)',
                    'F. Programada',
                    'F. Completado',
                    'Creado por',
                    'Notas',
                    '',
                  ].map((h) => (
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
                {asset.maintenanceOrders.map((m, i) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom:
                        i < asset.maintenanceOrders.length - 1 ? '1px solid #f1f5f9' : undefined,
                      opacity: m.status === 'cancelled' ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {m.orderNumber}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(m.createdAt)}
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: '180px' }}>
                      <span style={{ fontWeight: '500', color: '#0f172a' }}>{m.title}</span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {MAINTENANCE_TYPE_LABELS[m.type] ?? m.type}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={MAINTENANCE_STATUS_VARIANTS[m.status] ?? 'outline'}>
                        {MAINTENANCE_STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        whiteSpace: 'nowrap',
                        fontWeight: '500',
                        color: m.cost ? '#0f172a' : '#94a3b8',
                      }}
                    >
                      {m.cost
                        ? `$${Number(m.cost).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {formatDate(m.scheduledDate)}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(m.completedAt)}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {m.createdByUser.firstName} {m.createdByUser.lastName}
                    </td>
                    <td
                      style={{
                        padding: '8px 10px',
                        color: '#64748b',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={m.description ?? undefined}
                    >
                      {m.description ?? '—'}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {m.status !== 'completed' && m.status !== 'cancelled' && (
                        <Link
                          href={`/assets/${asset.id}/maintenance/${m.id}/edit`}
                          style={{ color: '#3b82f6', fontSize: '13px' }}
                        >
                          Actualizar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
