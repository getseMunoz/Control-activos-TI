import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAssetTypeById } from '@/server/queries/asset-types.queries'
import { AssetTypeEditForm } from '@/components/features/asset-types/AssetTypeEditForm'

export const metadata: Metadata = { title: 'Editar tipo de activo — CIPRIJAL' }

type Props = { params: Promise<{ id: string }> }

export default async function EditAssetTypePage({ params }: Props) {
  const { id } = await params
  const assetType = await getAssetTypeById(id)

  if (!assetType) notFound()

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
          {assetType.name}
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
        <AssetTypeEditForm assetType={assetType} />
      </div>
    </div>
  )
}
