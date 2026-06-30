import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getAssignmentReturnReceiptById } from '@/server/queries/assignments.queries'
import { PrintButton } from '@/components/features/assignments/PrintButton'

const ROLE_LABELS: Record<string, string> = {
  admin_ti: 'Administrador TI',
  usuario_final: 'Usuario Final',
}

const STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

function fmt(d: Date | null | undefined, withTime = false): string {
  if (!d) return '—'
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
  if (withTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return d.toLocaleDateString('es-MX', opts)
}

function getAccessoriesText(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'text' in (raw as object)) {
    const text = (raw as { text: unknown }).text
    return typeof text === 'string' && text.trim() ? text : null
  }
  return null
}

type Props = { params: Promise<{ id: string }> }

export default async function AssignmentReturnReceiptPage({ params }: Props) {
  const { id } = await params
  const [session, assignment] = await Promise.all([auth(), getAssignmentReturnReceiptById(id)])

  if (!assignment) notFound()

  // usuario_final solo puede ver su propia responsiva de devolución
  if (session?.user?.role !== 'admin_ti' && assignment.userId !== session?.user?.id) {
    notFound()
  }

  const backHref = session?.user?.role === 'admin_ti' ? '/assignments' : '/my-assets'

  // La asignación aún no fue devuelta
  if (assignment.returnedAt === null) {
    return (
      <div style={{ padding: '32px', maxWidth: '600px' }}>
        <Link
          href={backHref}
          style={{
            fontSize: '13px',
            color: '#475569',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '20px',
          }}
        >
          ← Volver
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          Sin devolución registrada
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Esta asignación aún no tiene devolución registrada. La responsiva de devolución estará
          disponible una vez que el equipo sea devuelto.
        </p>
      </div>
    )
  }

  const { asset, user, assignedByUser, returnedByUser, deliveryLocation } = assignment
  const accessories = getAccessoriesText(assignment.accessories)
  const generatedAt = new Date()
  const returnDateStr = assignment.returnedAt.toISOString().slice(0, 10).replace(/-/g, '')
  const folio = `DEV-${asset.internalCode}-${returnDateStr}`

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; }
              .receipt-page { padding: 32px !important; max-width: 100% !important; }
            }
          `,
        }}
      />

      {/* Barra de acciones (no se imprime) */}
      <div
        className="no-print"
        style={{
          padding: '12px 32px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Link
          href={backHref}
          style={{
            fontSize: '13px',
            color: '#475569',
            textDecoration: 'none',
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: 'white',
          }}
        >
          ← Volver
        </Link>
        <PrintButton />
      </div>

      {/* Documento */}
      <div
        className="receipt-page"
        style={{
          padding: '48px',
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#0f172a',
          lineHeight: '1.6',
        }}
      >
        {/* Encabezado del documento */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '20px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: '#475569',
              margin: '0 0 6px',
              fontFamily: 'sans-serif',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            CIPRIJAL — Gestión de Activos TI
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              margin: '0 0 8px',
              letterSpacing: '-0.01em',
            }}
          >
            Responsiva de Devolución de Equipo
          </h1>
          <p style={{ fontSize: '12px', color: '#475569', margin: 0, fontFamily: 'sans-serif' }}>
            Folio: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{folio}</strong>
          </p>
        </div>

        {/* Datos del usuario que devuelve */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              margin: '0 0 10px',
              fontFamily: 'sans-serif',
            }}
          >
            Datos del usuario que devuelve
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              fontFamily: 'sans-serif',
            }}
          >
            <tbody>
              {[
                ['Nombre completo', `${user.firstName} ${user.lastName}`],
                ['Puesto / Rol', user.position ?? ROLE_LABELS[user.role] ?? user.role],
                ['Correo electrónico', user.email],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td
                    style={{
                      padding: '7px 0',
                      color: '#475569',
                      width: '180px',
                      verticalAlign: 'top',
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ padding: '7px 0', fontWeight: '500' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Datos del equipo */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              margin: '0 0 10px',
              fontFamily: 'sans-serif',
            }}
          >
            Datos del equipo
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              fontFamily: 'sans-serif',
            }}
          >
            <tbody>
              {[
                ['Código interno', asset.internalCode],
                ['Tipo', asset.assetType.name],
                ['Nombre / Descripción', asset.name],
                ['Marca', asset.brand],
                ['Modelo', asset.model],
                ['Número de parte', asset.partNumber],
                ['Número de serie', asset.serialNumber],
                ['Estado actual', STATUS_LABELS[asset.status] ?? asset.status],
                ['Ubicación actual', asset.location?.name],
              ].map(([label, value]) =>
                value ? (
                  <tr key={label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td
                      style={{
                        padding: '7px 0',
                        color: '#475569',
                        width: '180px',
                        verticalAlign: 'top',
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        padding: '7px 0',
                        fontWeight:
                          label === 'Número de serie' || label === 'Código interno' ? '600' : '500',
                        fontFamily:
                          label === 'Número de serie' || label === 'Código interno'
                            ? 'monospace'
                            : 'sans-serif',
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </section>

        {/* Datos de devolución */}
        <section style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              margin: '0 0 10px',
              fontFamily: 'sans-serif',
            }}
          >
            Datos de devolución
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              fontFamily: 'sans-serif',
            }}
          >
            <tbody>
              {[
                ['Fecha de asignación', fmt(assignment.assignedAt)],
                ['Fecha de devolución', fmt(assignment.returnedAt)],
                ['Ubicación de entrega original', deliveryLocation?.name],
                [
                  'Responsable TI que asignó',
                  `${assignedByUser.firstName} ${assignedByUser.lastName} (${assignedByUser.email})`,
                ],
                [
                  'Responsable TI que recibió',
                  returnedByUser
                    ? `${returnedByUser.firstName} ${returnedByUser.lastName} (${returnedByUser.email})`
                    : null,
                ],
                ['Accesorios devueltos', accessories],
                ['Notas', assignment.notes],
              ].map(([label, value]) =>
                value ? (
                  <tr key={label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td
                      style={{
                        padding: '7px 0',
                        color: '#475569',
                        width: '180px',
                        verticalAlign: 'top',
                      }}
                    >
                      {label}
                    </td>
                    <td style={{ padding: '7px 0', fontWeight: '500', whiteSpace: 'pre-line' }}>
                      {value}
                    </td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </section>

        {/* Texto formal */}
        <section
          style={{
            marginBottom: '28px',
            padding: '16px',
            background: '#f8fafc',
            borderLeft: '3px solid #0f172a',
            borderRadius: '0 4px 4px 0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontFamily: 'sans-serif',
              color: '#1e293b',
              lineHeight: '1.7',
            }}
          >
            Por medio de la presente, se hace constar que el usuario devuelve al área de TI el
            equipo descrito en este documento. El área de TI recibe el equipo para su revisión,
            resguardo o reasignación conforme a las políticas internas de la empresa.
          </p>
        </section>

        {/* Firma de devolución */}
        <section style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              margin: '0 0 14px',
              fontFamily: 'sans-serif',
            }}
          >
            Firma de devolución
          </h2>

          {assignment.returnSignatureData ? (
            <div style={{ fontFamily: 'sans-serif' }}>
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px',
                  background: '#fafafa',
                  display: 'inline-block',
                  marginBottom: '10px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assignment.returnSignatureData}
                  alt="Firma de devolución"
                  style={{ display: 'block', maxWidth: '320px', height: 'auto' }}
                />
              </div>
              <p style={{ margin: '4px 0 2px', fontSize: '13px', fontWeight: '600' }}>
                {assignment.returnSignedByName ?? `${user.firstName} ${user.lastName}`}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                Firmado el {fmt(assignment.returnSignedAt, true)}
              </p>
            </div>
          ) : (
            <div style={{ fontFamily: 'sans-serif' }}>
              <div
                style={{
                  borderBottom: '1px solid #0f172a',
                  width: '300px',
                  marginBottom: '8px',
                  height: '60px',
                }}
              />
              <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '500' }}>
                {user.firstName} {user.lastName}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Sin firma de devolución registrada
              </p>
            </div>
          )}
        </section>

        {/* Pie del documento */}
        <div
          style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontFamily: 'sans-serif' }}
        >
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8' }}>
            Documento generado el {fmt(generatedAt, true)}.
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
            Documento generado por el sistema CIPRIJAL Activos TI.
          </p>
        </div>
      </div>
    </>
  )
}
