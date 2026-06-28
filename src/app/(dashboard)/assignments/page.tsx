import Link from 'next/link'
import { getAssignments } from '@/server/queries/assignments.queries'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function AssignmentsPage() {
  const assignments = await getAssignments()

  const active = assignments.filter((a) => a.returnedAt === null)
  const returned = assignments.filter((a) => a.returnedAt !== null)

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
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Asignaciones</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {active.length} activa{active.length !== 1 ? 's' : ''} · {returned.length} devuelta
            {returned.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/assignments/new" className={buttonVariants()}>
          + Nueva asignación
        </Link>
      </div>

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
          <p style={{ color: '#64748b', fontSize: '14px' }}>No hay asignaciones registradas aún.</p>
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
                      <td
                        style={{
                          padding: '10px 12px',
                          maxWidth: '180px',
                        }}
                      >
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
                        <span style={{ display: 'block' }}>
                          {a.user.firstName} {a.user.lastName}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{a.user.email}</span>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.deliveryLocation?.name ?? '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.assignedAt.toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#475569' }}>
                        {a.returnedAt
                          ? a.returnedAt.toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <Badge variant={isActive ? 'default' : 'outline'}>
                          {isActive ? 'Activa' : 'Devuelta'}
                        </Badge>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {isActive && (
                          <Link
                            href={`/assignments/${a.id}/return`}
                            style={{
                              fontSize: '13px',
                              color: '#ef4444',
                              textDecoration: 'none',
                            }}
                          >
                            Devolver
                          </Link>
                        )}
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
