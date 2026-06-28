'use client'

import { useActionState } from 'react'
import { resetUserPasswordAction } from '@/server/actions/users.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Props = {
  userId: string
  userName: string
  userEmail: string
}

export function ResetUserPasswordForm({ userId, userName, userEmail }: Props) {
  const [state, action, pending] = useActionState(resetUserPasswordAction, null)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

      <div
        style={{
          background: '#fefce8',
          border: '1px solid #fde68a',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '13px',
          color: '#854d0e',
        }}
      >
        <strong>Restablecer contraseña de {userName}</strong> ({userEmail})<br />
        No se mostrará la contraseña actual. Al guardar, la contraseña anterior dejará de funcionar.
        Entrega la nueva contraseña al usuario de forma segura.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Nueva contraseña *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña *</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repite la nueva contraseña"
        />
      </div>

      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
        La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter
        especial.
      </p>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? 'Guardando...' : 'Restablecer contraseña'}
      </Button>
    </form>
  )
}
