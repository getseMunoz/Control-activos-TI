import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAssignmentById } from '@/server/queries/assignments.queries'
import { AssignmentReturnForm } from '@/components/features/assignments/AssignmentReturnForm'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ id: string }> }

export default async function ReturnAssignmentPage({ params }: Props) {
  const { id } = await params
  const assignment = await getAssignmentById(id)

  if (!assignment) notFound()

  // Si ya fue devuelta, redirigir al listado (la acción también lo valida)
  if (assignment.returnedAt !== null) {
    return (
      <div style={{ padding: '32px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
          Asignación ya devuelta
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
          Esta asignación ya fue cerrada el{' '}
          {assignment.returnedAt.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
          .
        </p>
        <Link href="/assignments" className={buttonVariants({ variant: 'outline' })}>
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/assignments"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          style={{ marginBottom: '12px', display: 'inline-flex' }}
        >
          ← Volver al listado
        </Link>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Registrar devolución</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
          Al confirmar, el activo regresará a estado &ldquo;En almacén&rdquo;.
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
        <AssignmentReturnForm assignment={assignment} />
      </div>
    </div>
  )
}
