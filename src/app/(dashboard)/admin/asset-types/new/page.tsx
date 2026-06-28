import type { Metadata } from 'next'
import Link from 'next/link'
import { AssetTypeCreateForm } from '@/components/features/asset-types/AssetTypeCreateForm'

export const metadata: Metadata = { title: 'Nuevo tipo de activo — CIPRIJAL' }

export default function NewAssetTypePage() {
  return (
    <div style={{ padding: '32px', maxWidth: '560px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/admin/asset-types"
          style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
        >
          ← Volver a tipos de activo
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
          Nuevo tipo de activo
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Define una categoría de hardware administrable sin modificar código.
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
        <AssetTypeCreateForm />
      </div>
    </div>
  )
}
