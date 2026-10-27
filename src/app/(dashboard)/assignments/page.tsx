import Link from 'next/link'
import { getAssignments, getAssignmentFilterOptions } from '@/server/queries/assignments.queries'
import type { AssignmentListFilters } from '@/server/queries/assignments.queries'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/dates'

const ROLE_LABELS: Record<string, string> = {
  admin_ti: 'Administrador TI',
  usuario_final: 'Usuario Final',
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activas' },
  { value: 'returned', label: 'Devueltas' },
  { value: 'returned_with_signature', label: 'Devueltas con firma' },
  { value: 'returned_without_signature', label: 'Devueltas sin firma' },
]

const inputClass =
  'border border-[#e2e8f0] rounded-md px-2.5 py-1.5 text-sm bg-white text-[#0f172a] outline-none focus:ring-2 focus:ring-[#3b82f6]/40 h-8'

const selectClass =
  'border border-[#e2e8f0] rounded-md px-2 py-1.5 text-sm bg-white text-[#0f172a] outline-none focus:ring-2 focus:ring-[#3b82f6]/40 h-8'

type Props = {
  searchParams: Promise<{
    q?: string
    status?: string
    userId?: string
    assetId?: string
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function AssignmentsPage({ searchParams }: Props) {
  const raw = await searchParams

  const filters: AssignmentListFilters = {
    q: raw.q?.trim() || undefined,
    status: raw.status || undefined,
    userId: raw.userId?.trim() || undefined,
    assetId: raw.assetId?.trim() || undefined,
    dateFrom: raw.dateFrom?.trim() || undefined,
    dateTo: raw.dateTo?.trim() || undefined,
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const exportParams = new URLSearchParams()
  if (raw.q) exportParams.set('q', raw.q)
  if (raw.status) exportParams.set('status', raw.status)
  if (raw.userId) exportParams.set('userId', raw.userId)
  if (raw.assetId) exportParams.set('assetId', raw.assetId)
  if (raw.dateFrom) exportParams.set('dateFrom', raw.dateFrom)
  if (raw.dateTo) exportParams.set('dateTo', raw.dateTo)
  const exportHref = `/assignments/export${exportParams.toString() ? `?${exportParams.toString()}` : ''}`

  const [assignments, { users, assets }] = await Promise.all([
    getAssignments(filters),
    getAssignmentFilterOptions(),
  ])

  const active = assignments.filter((a) => a.returnedAt === null)
  const returned = assignments.filter((a) => a.returnedAt !== null)

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
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Asignaciones</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {active.length} activa{active.length !== 1 ? 's' : ''} · {returned.length} devuelta
            {returned.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={exportHref} className={buttonVariants({ variant: 'outline' })}>
            Exportar CSV
          </Link>
          <Link href="/assignments/new" className={buttonVariants()}>
            + Nueva asignación
          </Link>
        </div>
      </div>

      {/* Formulario de filtros */}
      <form
        method="GET"
        action="/assignments"
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'flex-end',
        }}
      >
        {/* Búsqueda libre */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Búsqueda
          </label>
          <input
            name="q"
            type="text"
            defaultValue={raw.q ?? ''}
            placeholder="Código, nombre, serie, usuario…"
            className={inputClass}
            style={{ minWidth: '200px' }}
          />
        </div>

        {/* Estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          <select name="status" defaultValue={raw.status ?? ''} className={selectClass}>
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Usuario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Usuario
          </label>
          <select name="userId" defaultValue={raw.userId ?? ''} className={selectClass}>
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Activo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Activo
          </label>
          <select name="assetId" defaultValue={raw.assetId ?? ''} className={selectClass}>
            <option value="">Todos</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.internalCode} — {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desde */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Desde
          </label>
          <input
            name="dateFrom"
            type="date"
            defaultValue={raw.dateFrom ?? ''}
            className={inputClass}
          />
        </div>

        {/* Hasta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Hasta
          </label>
          <input name="dateTo" type="date" defaultValue={raw.dateTo ?? ''} className={inputClass} />
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '8px', paddingBottom: '1px' }}>
          <button type="submit" className={buttonVariants({ variant: 'default', size: 'sm' })}>
            Filtrar
          </button>
          <Link href="/assignments" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Limpiar
          </Link>
        </div>
      </form>

      {/* Contador y estado de filtros */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#64748b',
        }}
      >
        <span>
          Mostrando {assignments.length} asignación{assignments.length !== 1 ? 'es' : ''}
        </span>
        {hasFilters && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              background: '#eff6ff',
              color: '#3b82f6',
              padding: '2px 8px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Filtros activos
          </span>
        )}
      </div>

      {/* Tabla */}
      {assignments.length === 0 ? (
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
            {hasFilters
              ? 'No se encontraron asignaciones con los filtros seleccionados.'
              : 'No hay asignaciones registradas aún.'}
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
                    'Activo',
                    'Código interno',
                    'Nº Serie',
                    'Usuario',
                    'Ubicación entrega',
                    'F. Asignación',
                    'F. Devolución',
                    'Estado',
                    'Firma entrega',
                    'Firma devol.',
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
                {assignments.map((a, i) => {
                  const isActive = a.returnedAt === null
                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: i < assignments.length - 1 ? '1px solid #f1f5f9' : undefined,
                        opacity: isActive ? 1 : 0.7,
                      }}
                    >
                      <td style={{ padding: '10px 12px', maxWidth: '180px' }}>
                        <span
                          style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={a.asset.name}
                        >
                          {a.asset.name}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {a.asset.internalCode}
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {a.asset.serialNumber}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'block', fontWeight: '500' }}>
                          {a.user.firstName} {a.user.lastName}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>
                          {a.user.position ?? ROLE_LABELS[a.user.role] ?? a.user.role}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{a.user.email}</span>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.deliveryLocation?.name ?? '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {formatDate(a.assignedAt)}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.returnedAt ? formatDate(a.returnedAt) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <Badge variant={isActive ? 'default' : 'outline'}>
                          {isActive ? 'Activa' : 'Devuelta'}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {a.deliverySignedAt ? (
                          <span style={{ fontSize: '12px', color: '#16a34a' }}>Registrada</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sin firma</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {a.returnedAt === null ? (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Pendiente</span>
                        ) : a.returnSignedAt ? (
                          <span style={{ fontSize: '12px', color: '#16a34a' }}>Firmada</span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#ef4444' }}>Sin firma</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <Link
                            href={`/assignments/${a.id}/receipt`}
                            style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}
                          >
                            Responsiva
                          </Link>
                          {!isActive && (
                            <Link
                              href={`/assignments/${a.id}/return-receipt`}
                              style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none' }}
                            >
                              Resp. devolución
                            </Link>
                          )}
                          {isActive && (
                            <Link
                              href={`/assignments/${a.id}/return`}
                              style={{ fontSize: '13px', color: '#ef4444', textDecoration: 'none' }}
                            >
                              Devolver
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
        </div>
      )}
    </div>
  )
}
