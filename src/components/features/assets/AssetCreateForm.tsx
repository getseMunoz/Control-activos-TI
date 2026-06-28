'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createAssetAction } from '@/server/actions/assets.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

const selectClass =
  'border-input bg-background text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type SelectOption = { id: string; name: string }

type Props = {
  assetTypes: SelectOption[]
  locations: SelectOption[]
}

export function AssetCreateForm({ assetTypes, locations }: Props) {
  const [state, action, pending] = useActionState(createAssetAction, null)

  return (
    <form action={action} className="space-y-6">
      {/* Identificación */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Identificación</legend>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre del activo *</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="off"
            placeholder="Ej: Laptop Dell Latitude 5520"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serialNumber">Número de serie *</Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            required
            autoComplete="off"
            placeholder="Ej: ABC123XYZ"
          />
          <p className="text-muted-foreground text-xs">Obligatorio e irrepetible (RN-ACT-02).</p>
        </div>
      </fieldset>

      {/* Clasificación */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Clasificación</legend>

        <div className="space-y-1.5">
          <Label htmlFor="assetTypeId">Tipo de activo *</Label>
          <select id="assetTypeId" name="assetTypeId" required className={selectClass}>
            <option value="">Selecciona un tipo…</option>
            {assetTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" name="brand" autoComplete="off" placeholder="Ej: Dell" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" name="model" autoComplete="off" placeholder="Ej: Latitude 5520" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="partNumber">Número de parte</Label>
          <Input id="partNumber" name="partNumber" autoComplete="off" placeholder="Opcional" />
        </div>
      </fieldset>

      {/* Ubicación */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Ubicación</legend>

        <div className="space-y-1.5">
          <Label htmlFor="locationId">Ubicación *</Label>
          <select id="locationId" name="locationId" required className={selectClass}>
            <option value="">Selecciona una ubicación…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Compra */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">
          Datos de compra (opcionales)
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="purchaseDate">Fecha de compra</Label>
            <Input id="purchaseDate" name="purchaseDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchasePrice">Precio de compra (MXN)</Label>
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>
      </fieldset>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <textarea
          id="notes"
          name="notes"
          className={textareaClass}
          placeholder="Observaciones adicionales sobre el activo"
        />
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Registrando...' : 'Registrar activo'}
        </Button>
        <Link href="/assets" className={buttonVariants({ variant: 'outline' })}>
          Cancelar
        </Link>
      </div>
    </form>
  )
}
