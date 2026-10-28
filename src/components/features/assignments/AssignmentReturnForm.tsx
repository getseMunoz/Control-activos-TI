'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { returnAssignmentAction } from '@/server/actions/assignments.actions'
import { SignaturePad } from '@/components/features/assignments/SignaturePad'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { AssignmentDetail } from '@/server/queries/assignments.queries'
import { formatDate, getTodayMexico } from '@/lib/dates'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type Props = { assignment: AssignmentDetail; adminName: string }

export function AssignmentReturnForm({ assignment, adminName }: Props) {
  const [state, action, pending] = useActionState(returnAssignmentAction, null)

  const today = getTodayMexico()
  const existingNotes = typeof assignment.notes === 'string' ? assignment.notes : ''

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={assignment.id} />

      {/* Datos de la asignación (solo lectura) */}
      <div className="bg-muted space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-32 shrink-0">Activo:</span>
          <span className="font-medium">
            {assignment.asset.internalCode} — {assignment.asset.name}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-32 shrink-0">Nº de serie:</span>
          <span className="font-mono">{assignment.asset.serialNumber}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-32 shrink-0">Asignado a:</span>
          <span>
            {assignment.user.firstName} {assignment.user.lastName}
            <span className="text-muted-foreground ml-1">({assignment.user.email})</span>
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-32 shrink-0">Fecha asignación:</span>
          <span>{formatDate(assignment.assignedAt, { month: 'long' })}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="returnedAt">Fecha de devolución *</Label>
        <Input
          key={today}
          id="returnedAt"
          name="returnedAt"
          type="date"
          required
          defaultValue={today}
          min={today}
          max={today}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas de devolución</Label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClass}
          defaultValue={existingNotes}
          placeholder="Condición del equipo al retorno, observaciones…"
        />
      </div>

      {/* Firma de devolución */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Firma de devolución *</p>
          <p style={{ fontSize: '13px', color: '#475569', margin: '2px 0 0' }}>
            Firmará devolución como: <strong>{adminName}</strong>
          </p>
        </div>
        <SignaturePad
          fieldName="returnSignatureData"
          label="Firma del responsable de TI que recibe el equipo"
        />
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? 'Registrando...' : 'Confirmar devolución'}
        </Button>
        <Link href="/assignments" className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
