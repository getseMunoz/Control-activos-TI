'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateAssetAction } from '@/server/actions/assets.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { AssetDetail } from '@/server/queries/assets.queries'

const selectClass =
  'border-input bg-background text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

const STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

type SelectOption = { id: string; name: string }

type Props = {
  asset: AssetDetail
  assetTypes: SelectOption[]
  locations: SelectOption[]
}

export function AssetEditForm({ asset, assetTypes, locations }: Props) {
  const [state, action, pending] = useActionState(updateAssetAction, null)

  const isActive = asset.deletedAt === null
  const defaultPurchaseDate = asset.purchaseDate
    ? asset.purchaseDate.toISOString().split('T')[0]
    : ''
  const defaultPurchasePrice = asset.purchasePrice?.toString() ?? ''

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={asset.id} />

      {/* Código interno (solo lectura) */}
      <div className="space-y-1.5">
        <Label>Código interno</Label>
        <p className="bg-muted text-muted-foreground rounded-lg border px-2.5 py-1.5 font-mono text-sm">
          {asset.internalCode}
        </p>
        <p className="text-muted-foreground text-xs">Generado automáticamente. No editable.</p>
      </div>

      {/* Identificación */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Identificación</legend>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre del activo *</Label>
          <Input id="name" name="name" required autoComplete="off" defaultValue={asset.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serialNumber">Número de serie *</Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            required
            autoComplete="off"
            defaultValue={asset.serialNumber}
          />
        </div>
      </fieldset>

      {/* Clasificación */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Clasificación</legend>

        <div className="space-y-1.5">
          <Label htmlFor="assetTypeId">Tipo de activo *</Label>
          <select
            id="assetTypeId"
            name="assetTypeId"
            required
            className={selectClass}
            defaultValue={asset.assetTypeId}
          >
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
            <Input id="brand" name="brand" autoComplete="off" defaultValue={asset.brand ?? ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" name="model" autoComplete="off" defaultValue={asset.model ?? ''} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="partNumber">Número de parte</Label>
          <Input
            id="partNumber"
            name="partNumber"
            autoComplete="off"
            defaultValue={asset.partNumber ?? ''}
          />
        </div>
      </fieldset>

      {/* Identificadores adicionales */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">
          Identificadores adicionales (opcionales)
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyAssetNumber">N.º de activo CIPRIJAL</Label>
            <Input
              id="companyAssetNumber"
              name="companyAssetNumber"
              autoComplete="off"
              defaultValue={asset.companyAssetNumber ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inventoryTag">Etiqueta de inventario</Label>
            <Input
              id="inventoryTag"
              name="inventoryTag"
              autoComplete="off"
              defaultValue={asset.inventoryTag ?? ''}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyModel">Modelo interno / configuración</Label>
          <Input
            id="companyModel"
            name="companyModel"
            autoComplete="off"
            defaultValue={asset.companyModel ?? ''}
          />
        </div>
      </fieldset>

      {/* Ubicación y estado */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Ubicación y estado</legend>

        <div className="space-y-1.5">
          <Label htmlFor="locationId">Ubicación *</Label>
          <select
            id="locationId"
            name="locationId"
            required
            className={selectClass}
            defaultValue={asset.locationId ?? ''}
          >
            <option value="">Selecciona una ubicación…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Estado operativo *</Label>
          <select
            id="status"
            name="status"
            required
            className={selectClass}
            defaultValue={asset.status}
          >
            {Object.entries(STATUS_LABELS)
              .filter(([value]) => value !== 'stolen' && value !== 'lost')
              .map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </select>
          <p className="text-muted-foreground text-xs">
            &quot;Asignado&quot; solo es válido si existe una asignación activa gestionada en el
            módulo de asignaciones.
          </p>
        </div>
      </fieldset>

      {/* Compra */}
      <fieldset className="space-y-4">
        <legend className="text-foreground mb-2 text-sm font-semibold">Datos de compra</legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="purchaseDate">Fecha de compra</Label>
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              defaultValue={defaultPurchaseDate}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchasePrice">Precio de compra (MXN)</Label>
            <Input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultPurchasePrice}
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
          defaultValue={asset.notes ?? ''}
        />
      </div>

      {/* Estado del registro */}
      <div className="space-y-1.5">
        <Label>Estado del registro</Label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            value="1"
            defaultChecked={isActive}
            className="h-4 w-4 rounded border"
          />
          <span className="text-sm">Activo en el sistema</span>
        </label>
        <p className="text-muted-foreground text-xs">
          {isActive
            ? 'Al desactivar este activo se dará de baja del registro activo del sistema y dejará de aparecer en los listados y reportes. Su historial relacionado se conservará. No puede tener una asignación activa.'
            : 'Al activar, el activo volverá a estar disponible en el sistema.'}
        </p>
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Activo actualizado correctamente.</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Link href="/assets" className={buttonVariants({ variant: 'outline' })}>
          Volver al listado
        </Link>
      </div>
    </form>
  )
}
