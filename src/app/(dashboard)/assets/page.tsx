import Link from 'next/link'
import { getAssets, getAssetFilterOptions } from '@/server/queries/assets.queries'
import type { AssetListFilters } from '@/server/queries/assets.queries'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const VALID_STATUSES = ['in_storage', 'assigned', 'in_maintenance', 'decommissioned']

const inputClass =
  'border border-[#e2e8f0] rounded-md px-2.5 py-1.5 text-sm bg-white text-[#0f172a] outline-none focus:ring-2 focus:ring-[#3b82f6]/40 h-8'

const selectClass =
  'border border-[#e2e8f0] rounded-md px-2 py-1.5 text-sm bg-white text-[#0f172a] outline-none focus:ring-2 focus:ring-[#3b82f6]/40 h-8'

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  )
}

type Props = {
  searchParams: Promise<{
    q?: string
    status?: string
    assetTypeId?: string
    locationId?: string
    assigned?: string
    hasAlerts?: string
  }>
}

export default async function AssetsPage({ searchParams }: Props) {
  const raw = await searchParams

  // Normalizar y validar filtros
  const filters: AssetListFilters = {
    q: raw.q?.trim() || undefined,
    status: raw.status && VALID_STATUSES.includes(raw.status) ? raw.status : undefined,
    assetTypeId: isUuid(raw.assetTypeId?.trim()) ? raw.assetTypeId!.trim() : undefined,
    locationId: isUuid(raw.locationId?.trim()) ? raw.locationId!.trim() : undefined,
    assigned:
      raw.assigned === 'assigned' || raw.assigned === 'unassigned' ? raw.assigned : undefined,
    hasAlerts: raw.hasAlerts === 'yes' || raw.hasAlerts === 'no' ? raw.hasAlerts : undefined,
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const exportParams = new URLSearchParams()
  if (raw.q) exportParams.set('q', raw.q)
  if (raw.status) exportParams.set('status', raw.status)
  if (raw.assetTypeId) exportParams.set('assetTypeId', raw.assetTypeId)
  if (raw.locationId) exportParams.set('locationId', raw.locationId)
  if (raw.assigned) exportParams.set('assigned', raw.assigned)
  if (raw.hasAlerts) exportParams.set('hasAlerts', raw.hasAlerts)
  const exportHref = `/assets/export${exportParams.toString() ? '?' + exportParams.toString() : ''}`

  const [assets, { assetTypes, locations }] = await Promise.all([
    getAssets(filters),
    getAssetFilterOptions(),
  ])

  return (
    <div style={{ padding: '32px' }}>
      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Activos TI</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href={exportHref}
            style={{
              height: '36px',
              padding: '0 14px',
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#475569',
              textDecoration: 'none',
              background: 'white',
            }}
          >
            Exportar CSV
          </Link>
          <Link href="/assets/new" className={buttonVariants()}>
            + Nuevo activo
          </Link>
        </div>
      </div>

      {/* Formulario de filtros */}
      <form
        method="GET"
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        {/* Búsqueda libre */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '180px',
            flex: '1 1 180px',
          }}
        >
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Buscar
          </label>
          <input
            name="q"
            type="text"
            defaultValue={filters.q ?? ''}
            placeholder="Nombre, serie, código, usuario…"
            className={inputClass}
            style={{ width: '100%' }}
          />
        </div>

        {/* Estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Estado
          </label>
          <select name="status" defaultValue={filters.status ?? ''} className={selectClass}>
            <option value="">Todos</option>
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Tipo
          </label>
          <select
            name="assetTypeId"
            defaultValue={filters.assetTypeId ?? ''}
            className={selectClass}
          >
            <option value="">Todos</option>
            {assetTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ubicación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Ubicación
          </label>
          <select name="locationId" defaultValue={filters.locationId ?? ''} className={selectClass}>
            <option value="">Todas</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Asignación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Asignación
          </label>
          <select name="assigned" defaultValue={filters.assigned ?? ''} className={selectClass}>
            <option value="">Todos</option>
            <option value="assigned">Asignados</option>
            <option value="unassigned">Sin asignar</option>
          </select>
        </div>

        {/* Alertas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Incidencias y mantenimiento
          </label>
          <select name="hasAlerts" defaultValue={filters.hasAlerts ?? ''} className={selectClass}>
            <option value="">Todos</option>
            <option value="yes">Con incidencias o mantenimiento</option>
            <option value="no">Sin incidencias ni mantenimiento</option>
          </select>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingBottom: '0' }}>
          <button
            type="submit"
            style={{
              height: '32px',
              padding: '0 14px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Filtrar
          </button>
          {hasFilters && (
            <Link
              href="/assets"
              style={{
                height: '32px',
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#475569',
                textDecoration: 'none',
                background: 'white',
              }}
            >
              Limpiar
            </Link>
          )}
        </div>
      </form>

      {/* Contador */}
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
        Mostrando {assets.length} activo{assets.length !== 1 ? 's' : ''}
        {hasFilters ? ' con los filtros aplicados' : ''}
      </p>

      {/* Tabla o mensaje vacío */}
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
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {hasFilters
              ? 'No se encontraron activos con los filtros seleccionados.'
              : 'No hay activos registrados. Registra el primer activo.'}
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
                    'Incidencias / Mant.',
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
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {activeAssignment
                          ? `${activeAssignment.user.firstName} ${activeAssignment.user.lastName}`
                          : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {openIncidents === 0 && activeMaintenance === 0 ? (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin pendientes</span>
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
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {totalExpenses === 0
                          ? '—'
                          : `$${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {asset.purchaseDate ? formatDate(asset.purchaseDate) : '—'}
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
