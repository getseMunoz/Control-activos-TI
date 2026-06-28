import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMaintenanceOrderForEdit } from '@/server/queries/assets.queries'
import { MaintenanceOrderEditForm } from '@/components/features/maintenance/MaintenanceOrderEditForm'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ id: string; orderId: string }> }

export default async function EditMaintenanceOrderPage({ params }: Props) {
  const { id, orderId } = await params
  const order = await getMaintenanceOrderForEdit(id, orderId)

  if (!order) notFound()

  // Convertir Decimal a string para serialización al Client Component
  const orderForForm = {
    ...order,
    cost: order.cost !== null ? String(order.cost) : null,
  }

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
          Actualizar orden de mantenimiento
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Actualiza el estado, fechas y resultado de la orden {order.orderNumber}.
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
        <MaintenanceOrderEditForm order={orderForForm} />
      </div>
    </div>
  )
}
