'use client'

import { useActionState } from 'react'
import { signReturnAction } from '@/server/actions/assignments.actions'
import { Button } from '@/components/ui/button'
import { SignaturePad } from '@/components/features/assignments/SignaturePad'

type Props = {
  assignmentId: string
}

export function SignReturnForm({ assignmentId }: Props) {
  const [state, action, pending] = useActionState(signReturnAction, null)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="assignmentId" value={assignmentId} />

      <SignaturePad fieldName="returnUserSignatureData" label="Firma de quien entrega el equipo" />

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : 'Firmar devolución'}
      </Button>
    </form>
  )
}
