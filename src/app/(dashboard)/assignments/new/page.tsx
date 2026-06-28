import Link from 'next/link'
import {
  getAssignableAssets,
  getAssignableUsers,
  getDeliveryLocations,
} from '@/server/queries/assignments.queries'
import { AssignmentCreateForm } from '@/components/features/assignments/AssignmentCreateForm'
import { buttonVariants } from '@/components/ui/button'

export default async function NewAssignmentPage() {
  const [assets, users, locations] = await Promise.all([
    getAssignableAssets(),
    getAssignableUsers(),
    getDeliveryLocations(),
  ])

  return (
    <div style={{ padding: '32px', maxWidth: '680px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/assignments"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Volver al listado
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Nueva asignación</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Solo activos en almacén sin asignación activa están disponibles.
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
        <AssignmentCreateForm assets={assets} users={users} locations={locations} />
      </div>
    </div>
  )
}
