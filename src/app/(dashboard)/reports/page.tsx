import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdminTI } from '@/lib/auth'
import { getReportsSummary } from '@/server/queries/reports.queries'
import { formatDate } from '@/lib/dates'

export const metadata: Metadata = { title: 'Reportes — CIPRIJAL' }

const STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

const INCIDENT_STATUS_LABELS: Record<string, string> = {
  open: 'Abierta',
  in_review: 'En revisión',
  in_progress: 'En progreso',
}

const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  waiting_parts: 'Esperando piezas',
  waiting_supplier: 'Esperando proveedor',
}

const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventivo',
  corrective: 'Correctivo',
  warranty_repair: 'Garantía',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px 24px',
      }}
    >
      <p
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#64748b',
          margin: '0 0 8px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </p>
      <p
        style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1 }}
      >
        {value}
      </p>
      {sub && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a2332',
        margin: '0 0 12px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      {children}
    </h2>
  )
}

function SimpleTable({
  headers,
  rows,
  emptyText = 'Sin datos',
}: {
  headers: string[]
  rows: React.ReactNode[][]
  emptyText?: string
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#475569',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((cells, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : undefined }}
              >
                {cells.map((cell, j) => (
                  <td key={j} style={{ padding: '8px 12px', color: '#334155' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default async function ReportsPage() {
  await requireAdminTI()
  const data = await getReportsSummary()

  const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
  const totalExpensesFormatted = money.format(data.totalExpenses)

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px' }}>Reportes</h1>
      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px' }}>
        Resumen operativo de activos, incidencias, mantenimientos y gastos.
      </p>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCard label="Total activos" value={data.totalAssets} />
        <StatCard label="Asignados" value={data.assignedAssets} />
        <StatCard label="En almacén" value={data.inStorageAssets} />
        <StatCard label="En mantenimiento" value={data.inMaintenanceAssets} />
        <StatCard label="Incidencias activas" value={data.activeIncidents} />
        <StatCard
          label="OT activas"
          value={data.activeMaintenanceOrders}
          sub="Órdenes de mantenimiento"
        />
        <StatCard label="Total gastos adicionales" value={totalExpensesFormatted} />
      </div>

      {/* Groupings grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Por estado */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <SectionTitle>Activos por estado</SectionTitle>
          <SimpleTable
            headers={['Estado', 'Cantidad']}
            rows={data.byStatus
              .sort((a, b) => b.count - a.count)
              .map((s) => [STATUS_LABELS[s.status] ?? s.status, s.count])}
            emptyText="Sin activos"
          />
        </div>

        {/* Por tipo */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <SectionTitle>Activos por tipo</SectionTitle>
          <SimpleTable
            headers={['Tipo', 'Cantidad']}
            rows={data.byType
              .filter((t) => t.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((t) => [t.name, t.count])}
            emptyText="Sin tipos registrados"
          />
        </div>

        {/* Por ubicación */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <SectionTitle>Activos por ubicación</SectionTitle>
          <SimpleTable
            headers={['Ubicación', 'Cantidad']}
            rows={[...data.byLocation]
              .sort((a, b) => b.count - a.count)
              .filter((l) => l.count > 0)
              .map((l) => [l.name, l.count])}
            emptyText="Sin ubicaciones con activos"
          />
        </div>
      </div>

      {/* Top 10 activos con mayores gastos */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <SectionTitle>Top 10 activos con mayores gastos adicionales</SectionTitle>
        <SimpleTable
          headers={['#', 'Código', 'Nombre', 'Nº Serie', 'Total gastos']}
          rows={data.topByExpenses.map((e, i) => [
            i + 1,
            <span key="code" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {e.asset.internalCode}
            </span>,
            <Link
              key="link"
              href={`/assets/${e.asset.id}`}
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              {e.asset.name}
            </Link>,
            <span key="serial" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {e.asset.serialNumber}
            </span>,
            money.format(e.totalExpenses),
          ])}
          emptyText="Sin gastos adicionales registrados"
        />
      </div>

      {/* Incidencias abiertas recientes */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <SectionTitle>Incidencias abiertas recientes</SectionTitle>
        <SimpleTable
          headers={['Número', 'Activo', 'Título', 'Estado', 'Prioridad', 'Fecha']}
          rows={data.recentOpenIncidents.map((inc) => [
            <span key="num" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {inc.incidentNumber}
            </span>,
            <Link
              key="asset"
              href={`/assets/${inc.asset.id}`}
              style={{ color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              {inc.asset.internalCode}
            </Link>,
            <span
              key="title"
              style={{
                maxWidth: '260px',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {inc.title}
            </span>,
            INCIDENT_STATUS_LABELS[inc.status] ?? inc.status,
            PRIORITY_LABELS[inc.priority] ?? inc.priority,
            inc.createdAt.toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          ])}
          emptyText="Sin incidencias abiertas"
        />
      </div>

      {/* Órdenes de mantenimiento activas recientes */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <SectionTitle>Órdenes de mantenimiento activas recientes</SectionTitle>
        <SimpleTable
          headers={['Número', 'Activo', 'Título', 'Tipo', 'Estado', 'Prioridad', 'Programado']}
          rows={data.recentActiveMaintenance.map((ot) => [
            <span key="num" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {ot.orderNumber}
            </span>,
            <Link
              key="asset"
              href={`/assets/${ot.asset.id}`}
              style={{ color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              {ot.asset.internalCode}
            </Link>,
            <span
              key="title"
              style={{
                maxWidth: '220px',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {ot.title}
            </span>,
            MAINTENANCE_TYPE_LABELS[ot.type] ?? ot.type,
            MAINTENANCE_STATUS_LABELS[ot.status] ?? ot.status,
            PRIORITY_LABELS[ot.priority] ?? ot.priority,
            ot.scheduledDate ? formatDate(ot.scheduledDate) : '—',
          ])}
          emptyText="Sin órdenes de mantenimiento activas"
        />
      </div>
    </div>
  )
}
