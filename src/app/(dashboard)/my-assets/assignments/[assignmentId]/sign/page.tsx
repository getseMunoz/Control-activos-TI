import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAuthenticatedUser } from '@/lib/auth'
import { getAssignmentForSigning } from '@/server/queries/assignments.queries'
import { SignDeliveryForm } from '@/components/features/assignments/SignDeliveryForm'

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

type Props = { params: Promise<{ assignmentId: string }> }

export default async function SignDeliveryPage({ params }: Props) {
  const { assignmentId } = await params
  const user = await requireAuthenticatedUser()
  const assignment = await getAssignmentForSigning(assignmentId, user.id)

  if (!assignment) notFound()
  if (assignment.deliverySignedAt) redirect('/my-assets')

  const { asset } = assignment

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/my-assets"
          style={{ fontSize: '13px', color: '#475569', textDecoration: 'none' }}
        >
          ← Volver a mis equipos
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '12px 0 4px' }}>
          Firma de recepción
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Revisa los datos del equipo antes de firmar.
        </p>
      </div>

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
          Datos del equipo
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px',
            fontSize: '13px',
          }}
        >
          {[
            ['Código interno', asset.internalCode],
            ['Equipo', asset.name],
            ['Tipo', asset.assetType.name],
            ['Marca / Modelo', [asset.brand, asset.model].filter(Boolean).join(' ') || null],
            ['Número de serie', asset.serialNumber],
            ['Ubicación', asset.location?.name],
            ['Asignado el', fmt(assignment.assignedAt)],
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
          Firma
        </h2>
        <SignDeliveryForm assignmentId={assignment.id} />
      </div>
    </div>
  )
}
