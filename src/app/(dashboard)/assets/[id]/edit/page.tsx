import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getAssetById,
  getActiveAssetTypes,
  getActiveLocationsForAssets,
} from '@/server/queries/assets.queries'
import { AssetEditForm } from '@/components/features/assets/AssetEditForm'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ id: string }> }

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params
  const [asset, assetTypes, locations] = await Promise.all([
    getAssetById(id),
    getActiveAssetTypes(),
    getActiveLocationsForAssets(),
  ])

  if (!asset) notFound()

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/assets"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Volver al listado
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Editar activo</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          {asset.internalCode} — {asset.name}
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
        <AssetEditForm asset={asset} assetTypes={assetTypes} locations={locations} />
      </div>
    </div>
  )
}
