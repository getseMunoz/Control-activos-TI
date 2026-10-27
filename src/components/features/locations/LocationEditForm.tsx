'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateLocationAction } from '@/server/actions/locations.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { LocationDetail } from '@/server/queries/locations.queries'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type Props = { location: LocationDetail }

export function LocationEditForm({ location }: Props) {
  const [state, action, pending] = useActionState(updateLocationAction, null)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={location.id} />

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          key={`${location.id}-${location.name}-${location.description}-${location.isActive}`}
          id="name"
          name="name"
          required
          defaultValue={location.name}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          className={textareaClass}
          defaultValue={location.description ?? ''}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            value="1"
            defaultChecked={location.isActive}
            className="h-4 w-4 rounded border"
          />
          <span className="text-sm">Ubicación activa</span>
        </label>
        <p className="text-muted-foreground text-xs">
          {location.isActive
            ? 'Al desactivar, no podrá asignarse a nuevos usuarios ni activos. Requiere que no tenga usuarios ni activos asociados.'
            : 'Al activar, estará disponible para asignar a usuarios y activos.'}
        </p>
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Ubicación actualizada correctamente.</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Link href="/admin/locations" className={buttonVariants({ variant: 'outline' })}>
          Volver al listado
        </Link>
      </div>
    </form>
  )
}
