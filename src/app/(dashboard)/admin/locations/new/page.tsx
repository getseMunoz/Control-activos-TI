import type { Metadata } from 'next'
import Link from 'next/link'
import { LocationCreateForm } from '@/components/features/locations/LocationCreateForm'

export const metadata: Metadata = { title: 'Nueva ubicación — CIPRIJAL' }

export default function NewLocationPage() {
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
          Nueva ubicación
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Registra una sede, ciudad o región operativa de CIPRIJAL.
        </p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '28px',
        }}
      >
        <LocationCreateForm />
      </div>
    </div>
  )
}
