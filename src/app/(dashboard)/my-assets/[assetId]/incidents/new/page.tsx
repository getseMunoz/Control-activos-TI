import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserIncidentCreateForm } from '@/components/features/incidents/UserIncidentCreateForm'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ assetId: string }> }

export default async function UserNewIncidentPage({ params }: Props) {
  const { assetId } = await params
  const user = await requireAuthenticatedUser()

  // RN-INC-01: verificar que el activo tenga asignación activa para este usuario
  const assignment = await prisma.assetAssignment.findFirst({
    where: {
      userId: user.id,
      assetId,
      returnedAt: null,
      asset: { deletedAt: null },
    },
    select: {
      id: true,
      asset: {
        select: {
          id: true,
          internalCode: true,
          name: true,
          serialNumber: true,
        },
      },
    },
  })

  if (!assignment) notFound()

  const { asset } = assignment

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/my-assets"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Mis activos
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Reportar falla</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Tu reporte será atendido por el área de TI. Describe la falla con el mayor detalle
          posible.
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
        <UserIncidentCreateForm asset={asset} />
      </div>
    </div>
  )
}
