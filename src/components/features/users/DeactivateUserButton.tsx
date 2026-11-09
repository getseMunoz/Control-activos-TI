'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deactivateUserAction, reactivateUserAction } from '@/server/actions/users.actions'
import { Button } from '@/components/ui/button'

type Props = {
  userId: string
  isActive: boolean
}

export function DeactivateUserButton({ userId, isActive }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    const confirmMsg = isActive
      ? '¿Desactivar este usuario? Perderá acceso al sistema.'
      : '¿Reactivar este usuario? Recuperará acceso al sistema.'

    if (!window.confirm(confirmMsg)) return

    setPending(true)
    setError(null)

    const result = isActive
      ? await deactivateUserAction(userId)
      : await reactivateUserAction(userId)

    if (!result.success) {
      setError(result.error)
      setPending(false)
    } else {
      router.refresh()
      setPending(false)
    }
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={isActive ? 'destructive' : 'outline'}
        size="sm"
        disabled={pending}
        onClick={handleToggle}
      >
        {pending ? 'Procesando...' : isActive ? 'Desactivar usuario' : 'Reactivar usuario'}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
