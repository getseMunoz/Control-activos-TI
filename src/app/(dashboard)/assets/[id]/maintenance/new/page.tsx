import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAssetForMaintenanceById } from '@/server/queries/assets.queries'
import { MaintenanceOrderCreateForm } from '@/components/features/maintenance/MaintenanceOrderCreateForm'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ id: string }> }

export default async function NewMaintenanceOrderPage({ params }: Props) {
  const { id } = await params
  const asset = await getAssetForMaintenanceById(id)

  if (!asset) notFound()

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
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          Registrar orden de mantenimiento
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Las órdenes de mantenimiento son registros permanentes. Las canceladas se marcan como
          canceladas, nunca se eliminan.
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
        <MaintenanceOrderCreateForm asset={asset} />
      </div>
    </div>
  )
}
