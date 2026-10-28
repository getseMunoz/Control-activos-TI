import type { Metadata } from 'next'
import type React from 'react'
import Link from 'next/link'
import { auth, requireAuthenticatedUser } from '@/lib/auth'
import { getDashboardSummary, getDashboardAlerts } from '@/server/queries/dashboard.queries'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dates'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const ASSET_STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

const ASSET_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_storage: 'default',
  assigned: 'secondary',
  in_maintenance: 'outline',
  decommissioned: 'destructive',
  stolen: 'destructive',
  lost: 'destructive',
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

function fmt(d: Date | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px 24px',
}

const actionLink: React.CSSProperties = {
  fontSize: '12px',
  color: '#3b82f6',
  textDecoration: 'none',
  flexShrink: 0,
  alignSelf: 'flex-start',
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: '11px',
        background: '#f1f5f9',
        padding: '1px 5px',
        borderRadius: '3px',
        color: '#475569',
      }}
    >
      {children}
    </span>
  )
}

function AlertRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      {children}
    </div>
  )
}

function AlertCard({
  title,
  count,
  actionHref,
  actionLabel,
  danger = false,
  children,
}: {
  title: string
  count: number
  actionHref: string
  actionLabel: string
  danger?: boolean
  children: React.ReactNode
}) {
  const hasItems = count > 0
  const countColor = danger && hasItems ? '#dc2626' : hasItems ? '#d97706' : '#16a34a'
  return (
    <div style={{ ...cardStyle, padding: '16px 20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{title}</span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: countColor,
              background: hasItems ? (danger ? '#fef2f2' : '#fffbeb') : '#f0fdf4',
              padding: '1px 7px',
              borderRadius: '9999px',
            }}
          >
            {count}
          </span>
        </div>
        <Link
          href={actionHref}
          style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
        >
          {actionLabel} →
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  )
}

const sectionTitle = {
  fontSize: '13px',
  fontWeight: '600' as const,
  color: '#475569',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '14px',
  margin: '0 0 14px 0',
}

const emptyText = {
  fontSize: '13px',
  color: '#94a3b8',
  margin: 0,
}

export default async function DashboardPage() {
  // requireAuthenticatedUser() revalida la sesión contra la base de datos (cierra sesión
  // si el usuario ya no es válido); auth() se conserva solo para el saludo con nombre.
  const [session, , summary, alerts] = await Promise.all([
    auth(),
    requireAuthenticatedUser(),
    getDashboardSummary(),
    getDashboardAlerts(),
  ])

  const stats = [
    { label: 'Total de activos', value: summary.totalAssets, accent: '#0f172a' },
    { label: 'En almacén', value: summary.inStorageAssets, accent: '#2563eb' },
    { label: 'Asignados', value: summary.assignedAssets, accent: '#7c3aed' },
    { label: 'En mantenimiento', value: summary.inMaintenanceAssets, accent: '#d97706' },
    { label: 'Incidencias activas', value: summary.activeIncidents, accent: '#dc2626' },
    { label: 'Mantenimientos activos', value: summary.activeMaintenanceOrders, accent: '#059669' },
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
          Bienvenido, {session?.user?.name ?? session?.user?.email}
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Resumen operativo de activos TI de CIPRIJAL
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {stats.map(({ label, value, accent }) => (
          <div key={label} style={cardStyle}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px 0' }}>{label}</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: accent, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tarjeta de gastos acumulados */}
      <div style={{ ...cardStyle, marginBottom: '28px' }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px 0' }}>Gastos acumulados</p>
        <p style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          $
          {summary.totalExpenses.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748b' }}>MXN</span>
        </p>
      </div>

      {/* Alertas operativas */}
      <div style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 14px 0',
          }}
        >
          Alertas operativas
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {/* A — Incidencias abiertas */}
          <AlertCard
            title="Incidencias abiertas"
            count={alerts.openIncidentsCount}
            actionHref="/assets"
            actionLabel="Ver activos"
          >
            {alerts.openIncidents.length === 0 ? (
              <p style={emptyText}>Sin pendientes.</p>
            ) : (
              alerts.openIncidents.map((inc) => (
                <AlertRow key={inc.id}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '5px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Mono>{inc.incidentNumber}</Mono>
                      <Badge
                        variant={INCIDENT_STATUS_VARIANTS[inc.status] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {INCIDENT_STATUS_LABELS[inc.status] ?? inc.status}
                      </Badge>
                      <Badge
                        variant={PRIORITY_VARIANTS[inc.priority] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {PRIORITY_LABELS[inc.priority] ?? inc.priority}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: '2px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={inc.title}
                    >
                      {inc.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '1px 0 0' }}>
                      {inc.asset.internalCode} · {fmt(inc.createdAt)}
                      {inc.reportedByUser
                        ? ` · ${inc.reportedByUser.firstName} ${inc.reportedByUser.lastName}`
                        : ''}
                    </p>
                  </div>
                  <Link href={`/assets/${inc.assetId}`} style={actionLink}>
                    Ver activo
                  </Link>
                </AlertRow>
              ))
            )}
          </AlertCard>

          {/* B — Mantenimientos pendientes/en proceso */}
          <AlertCard
            title="Mantenimientos activos"
            count={alerts.activeMaintenanceCount}
            actionHref="/assets"
            actionLabel="Ver activos"
          >
            {alerts.activeMaintenanceOrders.length === 0 ? (
              <p style={emptyText}>Sin pendientes.</p>
            ) : (
              alerts.activeMaintenanceOrders.map((m) => (
                <AlertRow key={m.id}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '5px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Mono>{m.orderNumber}</Mono>
                      <Badge
                        variant={MAINTENANCE_STATUS_VARIANTS[m.status] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {MAINTENANCE_STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: '2px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={m.title}
                    >
                      {m.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '1px 0 0' }}>
                      {m.asset.internalCode} · {fmt(m.createdAt)}
                    </p>
                  </div>
                  <Link href={`/assets/${m.assetId}`} style={actionLink}>
                    Ver activo
                  </Link>
                </AlertRow>
              ))
            )}
          </AlertCard>

          {/* C — Asignaciones activas sin firma de entrega */}
          <AlertCard
            title="Sin firma de entrega"
            count={alerts.unsignedActiveAssignmentsCount}
            actionHref="/assignments?status=active"
            actionLabel="Ver asignaciones"
          >
            {alerts.unsignedActiveAssignments.length === 0 ? (
              <p style={emptyText}>Sin pendientes.</p>
            ) : (
              alerts.unsignedActiveAssignments.map((a) => (
                <AlertRow key={a.id}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.user.firstName} {a.user.lastName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '1px 0 0' }}>
                      {a.asset.internalCode} · {a.asset.name} · {formatDate(a.assignedAt)}
                    </p>
                  </div>
                  <Link href={`/assignments/${a.id}/receipt`} style={actionLink}>
                    Responsiva
                  </Link>
                </AlertRow>
              ))
            )}
          </AlertCard>

          {/* D — Devoluciones sin firma */}
          <AlertCard
            title="Devoluciones sin firma"
            count={alerts.unsignedReturnAssignmentsCount}
            actionHref="/assignments?status=returned_without_signature"
            actionLabel="Ver asignaciones"
          >
            {alerts.unsignedReturnAssignments.length === 0 ? (
              <p style={emptyText}>Sin pendientes.</p>
            ) : (
              alerts.unsignedReturnAssignments.map((a) => (
                <AlertRow key={a.id}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.user.firstName} {a.user.lastName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '1px 0 0' }}>
                      {a.asset.internalCode} · {a.asset.name} · Devuelto {formatDate(a.returnedAt)}
                    </p>
                  </div>
                  <Link href={`/assignments/${a.id}/return-receipt`} style={actionLink}>
                    Resp. devol.
                  </Link>
                </AlertRow>
              ))
            )}
          </AlertCard>
        </div>
      </div>

      {/* Listas rápidas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {/* Últimos activos */}
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <p style={{ ...sectionTitle, marginBottom: 0 }}>Últimos activos</p>
            <Link
              href="/assets"
              style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
            >
              Ver todos →
            </Link>
          </div>

          {summary.recentAssets.length === 0 ? (
            <p style={emptyText}>No hay registros para mostrar.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          background: '#f1f5f9',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          color: '#475569',
                          flexShrink: 0,
                        }}
                      >
                        {asset.internalCode}
                      </span>
                      <Badge
                        variant={ASSET_STATUS_VARIANTS[asset.status] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: '3px 0 1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={asset.name}
                    >
                      {asset.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                      {asset.assetType.name} · {fmt(asset.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/assets/${asset.id}`}
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    Ver
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incidencias recientes */}
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <p style={{ ...sectionTitle, marginBottom: 0 }}>Incidencias recientes</p>
          </div>

          {summary.recentIncidents.length === 0 ? (
            <p style={emptyText}>No hay registros para mostrar.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          background: '#f1f5f9',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          color: '#475569',
                          flexShrink: 0,
                        }}
                      >
                        {inc.incidentNumber}
                      </span>
                      <Badge
                        variant={INCIDENT_STATUS_VARIANTS[inc.status] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {INCIDENT_STATUS_LABELS[inc.status] ?? inc.status}
                      </Badge>
                      <Badge
                        variant={PRIORITY_VARIANTS[inc.priority] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {PRIORITY_LABELS[inc.priority] ?? inc.priority}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: '3px 0 1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={inc.title}
                    >
                      {inc.title}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={inc.asset.name}
                    >
                      {inc.asset.internalCode} · {inc.asset.name}
                    </p>
                  </div>
                  <Link
                    href={`/assets/${inc.assetId}`}
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    Ver activo
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mantenimientos activos */}
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <p style={{ ...sectionTitle, marginBottom: 0 }}>Mantenimientos activos</p>
          </div>

          {summary.upcomingMaintenance.length === 0 ? (
            <p style={emptyText}>No hay registros para mostrar.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.upcomingMaintenance.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '8px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          background: '#f1f5f9',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          color: '#475569',
                          flexShrink: 0,
                        }}
                      >
                        {m.orderNumber}
                      </span>
                      <Badge
                        variant={MAINTENANCE_STATUS_VARIANTS[m.status] ?? 'outline'}
                        style={{ fontSize: '10px', padding: '0 5px' }}
                      >
                        {MAINTENANCE_STATUS_LABELS[m.status] ?? m.status}
                      </Badge>
                    </div>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: '3px 0 1px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={m.title}
                    >
                      {m.title}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={m.asset.name}
                    >
                      {m.asset.internalCode} · {m.asset.name}
                    </p>
                    {m.scheduledDate && (
                      <p style={{ fontSize: '11px', color: '#f59e0b', margin: '2px 0 0' }}>
                        Programado: {formatDate(m.scheduledDate)}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/assets/${m.assetId}`}
                    style={{
                      fontSize: '12px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    Ver activo
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
