'use client'

import { useActionState } from 'react'
import { signDeliveryAction } from '@/server/actions/assignments.actions'
import { Button } from '@/components/ui/button'
import { SignaturePad } from '@/components/features/assignments/SignaturePad'

type Props = {
  assignmentId: string
}

export function SignDeliveryForm({ assignmentId }: Props) {
  const [state, action, pending] = useActionState(signDeliveryAction, null)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="assignmentId" value={assignmentId} />

      <SignaturePad fieldName="deliverySignatureData" label="Firma de quien recibe el equipo" />

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : 'Firmar recepción'}
      </Button>
    </form>
  )
}
