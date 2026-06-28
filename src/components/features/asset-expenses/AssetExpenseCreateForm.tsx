'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createAssetExpenseAction } from '@/server/actions/asset-expenses.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type AssetContext = {
  id: string
  internalCode: string
  name: string
  serialNumber: string
  deletedAt: Date | null
}

type Props = { asset: AssetContext }

export function AssetExpenseCreateForm({ asset }: Props) {
  const [state, action, pending] = useActionState(createAssetExpenseAction, null)

  const today = new Date().toISOString().split('T')[0]
  const isArchived = asset.deletedAt !== null

  return (
    <div className="space-y-5">
      {/* Contexto del activo */}
      <div className="bg-muted space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Código interno:</span>
          <span className="font-mono font-medium">{asset.internalCode}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Activo:</span>
          <span className="font-medium">{asset.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Nº de serie:</span>
          <span className="font-mono">{asset.serialNumber}</span>
        </div>
      </div>

      {isArchived ? (
        <p className="text-destructive text-sm">
          Este activo está archivado. No se pueden registrar gastos en activos archivados.
        </p>
      ) : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="assetId" value={asset.id} />

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción del gasto *</Label>
            <Input
              id="description"
              name="description"
              required
              autoComplete="off"
              placeholder="Ej: Reemplazo de batería, actualización de RAM…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Monto (MXN) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expenseDate">Fecha del gasto *</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                required
                defaultValue={today}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="providerName">Proveedor</Label>
              <Input
                id="providerName"
                name="providerName"
                autoComplete="off"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoiceNumber">Número de factura</Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                autoComplete="off"
                placeholder="Ej: FAC-2026-001"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              name="notes"
              className={textareaClass}
              placeholder="Observaciones adicionales sobre el gasto"
            />
          </div>

          {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Registrando...' : 'Registrar gasto'}
            </Button>
            <Link href={`/assets/${asset.id}`} className={buttonVariants({ variant: 'outline' })}>
              Cancelar
            </Link>
          </div>
        </form>
      )}

      {isArchived && (
        <Link href={`/assets/${asset.id}`} className={buttonVariants({ variant: 'outline' })}>
          Volver al detalle
        </Link>
      )}
    </div>
  )
}
