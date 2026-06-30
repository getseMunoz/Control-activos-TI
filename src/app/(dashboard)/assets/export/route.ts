import { type NextRequest } from 'next/server'
import { requireAdminTI } from '@/lib/auth'
import { getAssets } from '@/server/queries/assets.queries'
import type { AssetListFilters } from '@/server/queries/assets.queries'

const VALID_STATUSES = [
  'in_storage',
  'assigned',
  'in_maintenance',
  'decommissioned',
  'stolen',
  'lost',
]

const STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

const CSV_HEADERS = [
  'Código interno',
  'Nombre',
  'Tipo',
  'Número de serie',
  'Marca',
  'Modelo',
  'Part Number',
  'Estado',
  'Ubicación',
  'Asignado a',
  'Correo asignado',
  'Fecha asignación',
  'Incidencias abiertas',
  'Mantenimientos activos',
  'Gastos acumulados',
  'Fecha compra',
  'Precio compra',
  'Proveedor',
  'Factura',
  'Garantía vence',
  'Fecha registro',
]

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  )
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export async function GET(request: NextRequest) {
  await requireAdminTI()

  const { searchParams } = new URL(request.url)

  const filters: AssetListFilters = {
    q: searchParams.get('q')?.trim() || undefined,
    status: (() => {
      const s = searchParams.get('status') ?? ''
      return VALID_STATUSES.includes(s) ? s : undefined
    })(),
    assetTypeId: isUuid(searchParams.get('assetTypeId')?.trim() ?? undefined)
      ? searchParams.get('assetTypeId')!.trim()
      : undefined,
    locationId: isUuid(searchParams.get('locationId')?.trim() ?? undefined)
      ? searchParams.get('locationId')!.trim()
      : undefined,
    assigned: (() => {
      const a = searchParams.get('assigned') ?? ''
      return a === 'assigned' || a === 'unassigned' ? a : undefined
    })(),
    hasAlerts: (() => {
      const h = searchParams.get('hasAlerts') ?? ''
      return h === 'yes' || h === 'no' ? h : undefined
    })(),
  }

  const assets = await getAssets(filters)

  const rows = assets.map((asset) => {
    const activeAssignment = asset.assignments[0] ?? null
    const totalExpenses = asset.expenses.reduce((sum, e) => sum + Number(e.cost), 0)

    return [
      asset.internalCode,
      asset.name,
      asset.assetType.name,
      asset.serialNumber,
      asset.brand,
      asset.model,
      asset.partNumber,
      STATUS_LABELS[asset.status] ?? asset.status,
      asset.location?.name,
      activeAssignment
        ? `${activeAssignment.user.firstName} ${activeAssignment.user.lastName}`
        : null,
      activeAssignment?.user.email ?? null,
      activeAssignment?.assignedAt ?? null,
      asset.incidents.length,
      asset.maintenanceOrders.length,
      totalExpenses,
      asset.purchaseDate,
      asset.purchasePrice != null ? Number(asset.purchasePrice) : null,
      asset.supplierName,
      asset.invoiceNumber,
      asset.warrantyExpiryDate,
      asset.createdAt,
    ]
      .map(csvEscape)
      .join(',')
  })

  const csv = '\uFEFF' + CSV_HEADERS.map(csvEscape).join(',') + '\n' + rows.join('\n')

  const today = new Date().toISOString().slice(0, 10)
  const filename = `activos-ciprijal-${today}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
