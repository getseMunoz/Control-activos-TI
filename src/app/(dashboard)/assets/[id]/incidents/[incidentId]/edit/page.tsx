import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getIncidentForEdit } from '@/server/queries/assets.queries'
import { IncidentEditForm } from '@/components/features/incidents/IncidentEditForm'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ id: string; incidentId: string }> }

export default async function EditIncidentPage({ params }: Props) {
  const { id, incidentId } = await params
  const incident = await getIncidentForEdit(id, incidentId)

  if (!incident) notFound()

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href={`/assets/${id}`}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Volver al activo
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Actualizar incidencia</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Actualiza el estado y resolución de la incidencia {incident.incidentNumber}.
        </p>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
        }}
      >
        <IncidentEditForm incident={incident} />
      </div>
    </div>
  )
}
