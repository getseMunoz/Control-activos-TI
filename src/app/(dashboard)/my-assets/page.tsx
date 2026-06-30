import Link from 'next/link'
import { requireAuthenticatedUser } from '@/lib/auth'
import { getUserPortalSummary } from '@/server/queries/user-portal.queries'
import { Badge } from '@/components/ui/badge'

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

function fmt(d: Date | null | undefined): string {
  if (!d) return '—'
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '20px 24px',
  marginBottom: '20px',
}

export default async function MyAssetsPage() {
  const user = await requireAuthenticatedUser()
  const { activeAssignments, returnedAssignments, recentIncidents } = await getUserPortalSummary(
    user.id,
  )

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px' }}>Mis activos</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Consulta los equipos que tienes asignados y reporta fallas.
        </p>
      </div>

      {/* Equipos asignados */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#475569',
            margin: '0 0 16px',
          }}
        >
          Equipos asignados ({activeAssignments.length})
        </h2>

        {activeAssignments.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            No tienes activos asignados actualmente.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeAssignments.map((a) => {
              const { asset } = a
              return (
                <div
                  key={a.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
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
                        <Badge variant="secondary">{asset.assetType.name}</Badge>
                        <Badge variant="outline">
                          {STATUS_LABELS[asset.status] ?? asset.status}
                        </Badge>
                      </div>
                      <p
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          margin: '6px 0 0',
                          color: '#0f172a',
                        }}
                      >
                        {asset.name}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                      <Link
                        href={`/assignments/${a.id}/receipt`}
                        style={{
                          fontSize: '13px',
                          padding: '6px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          color: '#475569',
                          textDecoration: 'none',
                          background: 'white',
                        }}
                      >
                        Ver responsiva
                      </Link>
                      <Link
                        href={`/my-assets/${asset.id}/incidents/new`}
                        style={{
                          fontSize: '13px',
                          padding: '6px 12px',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          color: '#ef4444',
                          textDecoration: 'none',
                          background: 'white',
                        }}
                      >
                        Reportar falla
                      </Link>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '8px',
                      fontSize: '13px',
                    }}
                  >
                    {[
                      [
                        'Marca / Modelo',
                        [asset.brand, asset.model].filter(Boolean).join(' ') || null,
                      ],
                      ['Número de serie', asset.serialNumber],
                      ['Ubicación', asset.location?.name],
                      ['Asignado el', fmt(a.assignedAt)],
                      ['Firma de recepción', a.deliverySignedAt ? 'Registrada' : 'Sin firma'],
                    ].map(([label, value]) =>
                      value ? (
                        <div key={label as string}>
                          <span
                            style={{
                              color: '#94a3b8',
                              display: 'block',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              color: '#1e293b',
                              fontWeight: '500',
                              fontFamily: label === 'Número de serie' ? 'monospace' : undefined,
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Devoluciones recientes */}
      {returnedAssignments.length > 0 && (
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              margin: '0 0 16px',
            }}
          >
            Devoluciones recientes ({returnedAssignments.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {['Equipo', 'Tipo', 'F. Asignación', 'F. Devolución', 'Firma devol.', ''].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#475569',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {returnedAssignments.map((a, i) => (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom:
                        i < returnedAssignments.length - 1 ? '1px solid #f1f5f9' : undefined,
                      opacity: 0.85,
                    }}
                  >
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'block', fontWeight: '500', color: '#0f172a' }}>
                        {a.asset.name}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                        {a.asset.internalCode}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {a.asset.assetType.name}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(a.assignedAt)}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(a.returnedAt)}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {a.returnSignedAt ? (
                        <span style={{ fontSize: '12px', color: '#16a34a' }}>Registrada</span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sin firma</span>
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
                        <Link
                          href={`/assignments/${a.id}/return-receipt`}
                          style={{ fontSize: '12px', color: '#7c3aed', textDecoration: 'none' }}
                        >
                          Resp. devolución
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mis reportes de falla */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#475569',
            margin: '0 0 16px',
          }}
        >
          Mis reportes de falla ({recentIncidents.length})
        </h2>

        {recentIncidents.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>No has reportado fallas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {[
                    'Folio',
                    'Equipo',
                    'Título',
                    'Estado',
                    'Prioridad',
                    'Fecha',
                    'F. Resolución',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px 10px',
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
                {recentIncidents.map((inc, i) => (
                  <tr
                    key={inc.id}
                    style={{
                      borderBottom:
                        i < recentIncidents.length - 1 ? '1px solid #f1f5f9' : undefined,
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
                      <span style={{ display: 'block', fontWeight: '500', color: '#0f172a' }}>
                        {inc.asset.name}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                        {inc.asset.internalCode}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', maxWidth: '220px' }}>
                      <span
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#0f172a',
                        }}
                        title={inc.title}
                      >
                        {inc.title}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={INCIDENT_STATUS_VARIANTS[inc.status] ?? 'outline'}>
                        {INCIDENT_STATUS_LABELS[inc.status] ?? inc.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <Badge variant={PRIORITY_VARIANTS[inc.priority] ?? 'outline'}>
                        {PRIORITY_LABELS[inc.priority] ?? inc.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(inc.createdAt)}
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: '#475569' }}>
                      {fmt(inc.resolvedAt)}
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
