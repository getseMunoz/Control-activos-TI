'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createLocationAction } from '@/server/actions/locations.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

export function LocationCreateForm() {
  const [state, action, pending] = useActionState(createLocationAction, null)

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          name="name"
          required
          autoComplete="off"
          placeholder="Ej: Corporativo Yucatán"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          className={textareaClass}
          placeholder="Descripción opcional de la ubicación"
        />
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creando...' : 'Crear ubicación'}
        </Button>
        <Link href="/admin/locations" className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
