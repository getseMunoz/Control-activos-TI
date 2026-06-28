import Link from 'next/link'
import { getActiveAssetTypes, getActiveLocationsForAssets } from '@/server/queries/assets.queries'
import { AssetCreateForm } from '@/components/features/assets/AssetCreateForm'
import { buttonVariants } from '@/components/ui/button'

export default async function NewAssetPage() {
  const [assetTypes, locations] = await Promise.all([
    getActiveAssetTypes(),
    getActiveLocationsForAssets(),
  ])

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
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Registrar nuevo activo</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          El código interno se genera automáticamente.
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
        <AssetCreateForm assetTypes={assetTypes} locations={locations} />
      </div>
    </div>
  )
}
