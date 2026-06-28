'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createUserAction } from '@/server/actions/users.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { LocationOption } from '@/server/queries/users.queries'

const selectClass =
  'border-input bg-background text-foreground h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50'

type Props = { locations: LocationOption[] }

export function UserCreateForm({ locations }: Props) {
  const [state, action, pending] = useActionState(createUserAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="space-y-5">
      {/* Nombre y apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Nombre *</Label>
          <Input id="firstName" name="firstName" required autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Apellido *</Label>
          <Input id="lastName" name="lastName" required autoComplete="off" />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input id="email" name="email" type="email" required autoComplete="off" />
      </div>

      {/* Rol */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Rol *</Label>
        <select id="role" name="role" required className={selectClass} defaultValue="usuario_final">
          <option value="usuario_final">Usuario Final</option>
          <option value="admin_ti">Administrador TI</option>
        </select>
      </div>

      {/* Puesto y teléfono */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="position">Puesto</Label>
          <Input id="position" name="position" autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="off" />
        </div>
      </div>

      {/* Modalidad */}
      <div className="space-y-1.5">
        <Label htmlFor="modality">Modalidad</Label>
        <select id="modality" name="modality" className={selectClass} defaultValue="">
          <option value="">Sin especificar</option>
          <option value="presencial">Presencial</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
        </select>
      </div>

      {/* Ubicación */}
      <div className="space-y-1.5">
        <Label htmlFor="locationId">Ubicación</Label>
        <select id="locationId" name="locationId" className={selectClass} defaultValue="">
          <option value="">Sin asignar</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Contraseña temporal */}
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña temporal *</Label>
        <div className="flex gap-2">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mín. 8 car., 1 mayúscula, 1 número, 1 especial"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground shrink-0 text-sm"
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        <p className="text-muted-foreground text-xs">
          El usuario deberá cambiar esta contraseña en su primer acceso.
        </p>
      </div>

      {/* Error de servidor */}
      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creando...' : 'Crear usuario'}
        </Button>
        <Link href="/admin/users" className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
