'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateUserAction } from '@/server/actions/users.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { UserDetail, LocationOption } from '@/server/queries/users.queries'

const selectClass =
  'border-input bg-background text-foreground h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  user: UserDetail
  locations: LocationOption[]
}

export function UserEditForm({ user, locations }: Props) {
  const [state, action, pending] = useActionState(updateUserAction, null)

  return (
    <form action={action} className="space-y-5">
      {/* ID oculto */}
      <input type="hidden" name="id" value={user.id} />

      {/* Nombre y apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            defaultValue={user.firstName}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            name="lastName"
            required
            defaultValue={user.lastName}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Email (solo lectura) */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          disabled
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-muted-foreground text-xs">El correo no puede modificarse.</p>
      </div>

      {/* Rol */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Rol *</Label>
        <select id="role" name="role" required className={selectClass} defaultValue={user.role}>
          <option value="usuario_final">Usuario Final</option>
          <option value="admin_ti">Administrador TI</option>
        </select>
      </div>

      {/* Puesto y teléfono */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="position">Puesto</Label>
          <Input
            id="position"
            name="position"
            defaultValue={user.position ?? ''}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone ?? ''}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Modalidad */}
      <div className="space-y-1.5">
        <Label htmlFor="modality">Modalidad</Label>
        <select
          id="modality"
          name="modality"
          className={selectClass}
          defaultValue={user.modality ?? ''}
        >
          <option value="">Sin especificar</option>
          <option value="presencial">Presencial</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
        </select>
      </div>

      {/* Ubicación */}
      <div className="space-y-1.5">
        <Label htmlFor="locationId">Ubicación</Label>
        <select
          id="locationId"
          name="locationId"
          className={selectClass}
          defaultValue={user.locationId ?? ''}
        >
          <option value="">Sin asignar</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Estado activo/inactivo */}
      <div className="space-y-1.5">
        <Label>Estado del usuario</Label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            value="1"
            defaultChecked={user.isActive}
            className="h-4 w-4 rounded border"
          />
          <span className="text-sm">Usuario activo</span>
        </label>
        {!user.isActive && (
          <p className="text-muted-foreground text-xs">
            Al activar, se restaurará el acceso del usuario al sistema.
          </p>
        )}
        {user.isActive && (
          <p className="text-muted-foreground text-xs">
            Al desactivar, el usuario perderá acceso. Requiere que no tenga equipos asignados.
          </p>
        )}
      </div>

      {/* Mensajes de estado */}
      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Usuario actualizado correctamente.</p>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Link href="/admin/users" className={buttonVariants({ variant: 'outline' })}>
          Volver al listado
        </Link>
      </div>
    </form>
  )
}
