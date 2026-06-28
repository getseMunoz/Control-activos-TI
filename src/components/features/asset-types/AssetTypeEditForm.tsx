'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateAssetTypeAction } from '@/server/actions/asset-types.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { AssetTypeDetail } from '@/server/queries/asset-types.queries'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type Props = { assetType: AssetTypeDetail }

export function AssetTypeEditForm({ assetType }: Props) {
  const [state, action, pending] = useActionState(updateAssetTypeAction, null)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={assetType.id} />

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" name="name" required defaultValue={assetType.name} autoComplete="off" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          className={textareaClass}
          defaultValue={assetType.description ?? ''}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            value="1"
            defaultChecked={assetType.isActive}
            className="h-4 w-4 rounded border"
          />
          <span className="text-sm">Tipo de activo activo</span>
        </label>
        <p className="text-muted-foreground text-xs">
          {assetType.isActive
            ? 'Al desactivar, no podrá usarse para registrar nuevos activos. Requiere que no tenga activos registrados.'
            : 'Al activar, estará disponible para seleccionarse al registrar activos.'}
        </p>
      </div>

      {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600">Tipo de activo actualizado correctamente.</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Link href="/admin/asset-types" className={buttonVariants({ variant: 'outline' })}>
          Volver al listado
        </Link>
      </div>
    </form>
  )
}
