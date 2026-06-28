import Link from 'next/link'
import { getAssets } from '@/server/queries/assets.queries'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

export default async function AssetsPage() {
  const assets = await getAssets()

  return (
    <div style={{ padding: '32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Activos TI</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {assets.length} {assets.length === 1 ? 'activo registrado' : 'activos registrados'}
          </p>
        </div>
        <Link href="/assets/new" className={buttonVariants()}>
          + Nuevo activo
        </Link>
      </div>

      {assets.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            No hay activos registrados. Registra el primer activo.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {[
                    'Código interno',
                    'Nombre',
                    'Tipo',
                    'Marca / Modelo',
                    'Nº Serie',
                    'Ubicación',
                    'Estado',
                    'Asignado a',
                    'Alertas',
                    'Gastos',
                    'F. Compra',
                    'Registro',
                    '',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px',
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
                {assets.map((asset, i) => {
                  const activeAssignment = asset.assignments[0] ?? null
                  const openIncidents = asset.incidents.length
                  const activeMaintenance = asset.maintenanceOrders.length
                  const totalExpenses = asset.expenses.reduce((sum, e) => sum + Number(e.cost), 0)

                  return (
                    <tr
                      key={asset.id}
                      style={{
                        borderBottom: i < assets.length - 1 ? '1px solid #f1f5f9' : undefined,
                        opacity: asset.deletedAt ? 0.6 : 1,
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.internalCode}
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: '180px' }}>
                        <span
                          style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={asset.name}
                        >
                          {asset.name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {asset.assetType.name}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {[asset.brand, asset.model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {asset.serialNumber}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {asset.location?.name ?? '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <Badge variant={STATUS_VARIANTS[asset.status] ?? 'outline'}>
                          {STATUS_LABELS[asset.status] ?? asset.status}
                        </Badge>
                      </td>
                      {/* Asignado a */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {activeAssignment
                          ? `${activeAssignment.user.firstName} ${activeAssignment.user.lastName}`
                          : '—'}
                      </td>
                      {/* Alertas */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {openIncidents === 0 && activeMaintenance === 0 ? (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin alertas</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {openIncidents > 0 && (
                              <Badge variant="destructive">Inc: {openIncidents}</Badge>
                            )}
                            {activeMaintenance > 0 && (
                              <Badge variant="outline">Mant: {activeMaintenance}</Badge>
                            )}
                          </div>
                        )}
                      </td>
                      {/* Gastos */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {totalExpenses === 0
                          ? '—'
                          : `$${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {asset.purchaseDate
                          ? asset.purchaseDate.toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <Badge variant={asset.deletedAt ? 'outline' : 'default'}>
                          {asset.deletedAt ? 'Archivado' : 'Activo'}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <Link
                          href={`/assets/${asset.id}`}
                          style={{
                            fontSize: '13px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            marginRight: '12px',
                          }}
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/assets/${asset.id}/edit`}
                          style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
