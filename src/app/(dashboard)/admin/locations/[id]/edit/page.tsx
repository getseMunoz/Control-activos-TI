import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocationById } from '@/server/queries/locations.queries'
import { LocationEditForm } from '@/components/features/locations/LocationEditForm'

export const metadata: Metadata = { title: 'Editar ubicación — CIPRIJAL' }

type Props = { params: Promise<{ id: string }> }

export default async function EditLocationPage({ params }: Props) {
  const { id } = await params
  const location = await getLocationById(id)

  if (!location) notFound()

  return (
    <div style={{ padding: '32px', maxWidth: '560px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/locations"
          style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
        >
          ← Volver a ubicaciones
        </Link>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#1a2332',
            marginTop: '8px',
            marginBottom: '4px',
          }}
        >
          {location.name}
        </h1>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '28px',
        }}
      >
        <LocationEditForm location={location} />
      </div>
    </div>
  )
}
