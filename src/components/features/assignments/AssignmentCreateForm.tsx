'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createAssignmentAction } from '@/server/actions/assignments.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

const selectClass =
  'border-input bg-background text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type AssetOption = {
  id: string
  internalCode: string
  name: string
  serialNumber: string
  brand: string | null
  model: string | null
  assetType: { name: string }
}

type UserOption = {
  id: string
  firstName: string
  lastName: string
  email: string
}

type LocationOption = {
  id: string
  name: string
}

type Props = {
  assets: AssetOption[]
  users: UserOption[]
  locations: LocationOption[]
}

export function AssignmentCreateForm({ assets, users, locations }: Props) {
  const [state, action, pending] = useActionState(createAssignmentAction, null)

  const today = new Date().toISOString().split('T')[0]

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="assetId">Activo a asignar *</Label>
        <select id="assetId" name="assetId" required className={selectClass}>
          <option value="">Selecciona un activo…</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.internalCode} — {a.name}
              {a.brand || a.model ? ` (${[a.brand, a.model].filter(Boolean).join(' ')})` : ''} ·
              S/N: {a.serialNumber} · {a.assetType.name}
            </option>
          ))}
        </select>
        {assets.length === 0 && (
          <p className="text-muted-foreground text-xs">
            No hay activos disponibles en almacén para asignar.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="userId">Usuario asignado *</Label>
        <select id="userId" name="userId" required className={selectClass}>
          <option value="">Selecciona un usuario…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName} — {u.email}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="assignedAt">Fecha de asignación *</Label>
        <Input id="assignedAt" name="assignedAt" type="date" required defaultValue={today} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliveryLocationId">Ubicación de entrega</Label>
        <select id="deliveryLocationId" name="deliveryLocationId" className={selectClass}>
          <option value="">Sin ubicación específica</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="accessories">Accesorios entregados</Label>
        <textarea
          id="accessories"
          name="accessories"
          className={textareaClass}
          placeholder="Ej: Cargador, funda, mouse inalámbrico…"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClass}
          placeholder="Observaciones adicionales sobre la asignación"
        />
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending || assets.length === 0}>
          {pending ? 'Registrando...' : 'Crear asignación'}
        </Button>
        <Link href="/assignments" className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
