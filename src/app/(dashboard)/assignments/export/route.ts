import { type NextRequest } from 'next/server'
import { requireAdminTI } from '@/lib/auth'
import { getAssignments } from '@/server/queries/assignments.queries'
import type { AssignmentListFilters } from '@/server/queries/assignments.queries'

const CSV_HEADERS = [
  'ID asignación',
  'Estado',
  'Código activo',
  'Nombre activo',
  'Número de serie',
  'Usuario asignado',
  'Correo usuario',
  'Puesto / Rol usuario',
  'Fecha asignación',
  'Fecha devolución',
  'Firma entrega',
  'Firmado entrega por',
  'Fecha firma entrega',
  'Firma devolución',
  'Firmado devolución por',
  'Fecha firma devolución',
  'Responsable TI asignó',
  'Responsable TI recibió devolución',
  'Ubicación entrega',
  'Accesorios',
  'Notas',
]

const ROLE_LABELS: Record<string, string> = {
  admin_ti: 'Administrador TI',
  usuario_final: 'Usuario Final',
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

function accessoriesToString(value: unknown): string {
  if (!value) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export async function GET(request: NextRequest) {
  await requireAdminTI()

  const { searchParams } = new URL(request.url)

  const filters: AssignmentListFilters = {
    q: searchParams.get('q')?.trim() || undefined,
    status: searchParams.get('status') || undefined,
    userId: searchParams.get('userId')?.trim() || undefined,
    assetId: searchParams.get('assetId')?.trim() || undefined,
    dateFrom: searchParams.get('dateFrom')?.trim() || undefined,
    dateTo: searchParams.get('dateTo')?.trim() || undefined,
  }

  const assignments = await getAssignments(filters)

  const rows = assignments.map((a) => {
    const isActive = a.returnedAt === null
    const userPosition = a.user.position ?? ROLE_LABELS[a.user.role] ?? a.user.role
    const assignedBy = a.assignedByUser
      ? `${a.assignedByUser.firstName} ${a.assignedByUser.lastName}`
      : null
    const returnedBy = a.returnedByUser
      ? `${a.returnedByUser.firstName} ${a.returnedByUser.lastName}`
      : null

    return [
      a.id,
      isActive ? 'Activa' : 'Devuelta',
      a.asset.internalCode,
      a.asset.name,
      a.asset.serialNumber,
      `${a.user.firstName} ${a.user.lastName}`,
      a.user.email,
      userPosition,
      a.assignedAt,
      a.returnedAt,
      a.deliverySignedAt ? 'Registrada' : 'Sin firma',
      a.deliverySignedByName,
      a.deliverySignedAt,
      a.returnSignedAt ? 'Registrada' : 'Sin firma',
      a.returnSignedByName,
      a.returnSignedAt,
      assignedBy,
      returnedBy,
      a.deliveryLocation?.name,
      accessoriesToString(a.accessories),
      a.notes,
    ]
      .map(csvEscape)
      .join(',')
  })

  const csv = '\uFEFF' + CSV_HEADERS.map(csvEscape).join(',') + '\n' + rows.join('\n')

  const today = new Date().toISOString().slice(0, 10)
  const filename = `assignments-export-${today}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
