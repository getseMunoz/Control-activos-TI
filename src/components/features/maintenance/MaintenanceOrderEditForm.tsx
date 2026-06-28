'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateMaintenanceOrderAction } from '@/server/actions/maintenance.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[96px]'

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

const ASSET_STATUS_LABELS: Record<string, string> = {
  in_storage: 'En almacén',
  assigned: 'Asignado',
  in_maintenance: 'En mantenimiento',
  decommissioned: 'Dado de baja',
  stolen: 'Robado',
  lost: 'Perdido',
}

const TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventivo',
  corrective: 'Correctivo',
  warranty_repair: 'Reparación en garantía',
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'waiting_parts', label: 'Esperando piezas' },
  { value: 'waiting_supplier', label: 'Esperando proveedor' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const RESULT_OPTIONS = [
  { value: '', label: '— Sin resultado todavía —' },
  { value: 'resolved', label: 'Resuelto' },
  { value: 'warranty_sent', label: 'Enviado a garantía' },
  { value: 'unrepairable', label: 'Irreparable' },
  { value: 'cancelled', label: 'Cancelado' },
]

type OrderContext = {
  id: string
  assetId: string
  orderNumber: string
  title: string
  description: string | null
  type: string
  status: string
  scheduledDate: Date | null
  startedAt: Date | null
  completedAt: Date | null
  result: string | null
  cost: string | null
  asset: {
    id: string
    internalCode: string
    name: string
    serialNumber: string
    status: string
    deletedAt: Date | null
  }
}

type Props = { order: OrderContext }

function toDateInput(d: Date | null | undefined): string {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export function MaintenanceOrderEditForm({ order }: Props) {
  const [state, action, pending] = useActionState(updateMaintenanceOrderAction, null)

  const isArchived = order.asset.deletedAt !== null

  return (
    <div className="space-y-5">
      {/* Contexto del activo */}
      <div className="bg-muted space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Código interno:</span>
          <span className="font-mono font-medium">{order.asset.internalCode}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Activo:</span>
          <span className="font-medium">{order.asset.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Nº de serie:</span>
          <span className="font-mono">{order.asset.serialNumber}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Estado activo:</span>
          <span>{ASSET_STATUS_LABELS[order.asset.status] ?? order.asset.status}</span>
        </div>
      </div>

      {/* Contexto de la orden */}
      <div className="space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Folio:</span>
          <span className="font-mono font-medium">{order.orderNumber}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Título:</span>
          <span className="font-medium">{order.title}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Tipo:</span>
          <span>{TYPE_LABELS[order.type] ?? order.type}</span>
        </div>
      </div>

      {isArchived ? (
        <>
          <p className="text-destructive text-sm">
            Este activo está archivado. No se puede actualizar este mantenimiento.
          </p>
          <Link
            href={`/assets/${order.asset.id}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            Volver al detalle
          </Link>
        </>
      ) : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="assetId" value={order.assetId} />

          <div className="space-y-1.5">
            <Label htmlFor="status">Estado *</Label>
            <select
              id="status"
              name="status"
              required
              className={selectClass}
              defaultValue={order.status}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledDate">Fecha programada</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                defaultValue={toDateInput(order.scheduledDate)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startedAt">Fecha de inicio</Label>
              <Input
                id="startedAt"
                name="startedAt"
                type="date"
                defaultValue={toDateInput(order.startedAt)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="completedAt">Fecha de finalización</Label>
              <Input
                id="completedAt"
                name="completedAt"
                type="date"
                defaultValue={toDateInput(order.completedAt)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Costo final (MXN)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={order.cost !== null ? Number(order.cost).toFixed(2) : ''}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="result">
              Resultado{' '}
              <span className="text-muted-foreground text-xs">(obligatorio al completar)</span>
            </Label>
            <select
              id="result"
              name="result"
              className={selectClass}
              defaultValue={order.result ?? ''}
            >
              {RESULT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Notas / descripción del trabajo</Label>
            <textarea
              id="description"
              name="description"
              className={textareaClass}
              defaultValue={order.description ?? ''}
              placeholder="Observaciones, trabajo realizado, materiales usados…"
            />
          </div>

          {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Link
              href={`/assets/${order.asset.id}`}
              className={buttonVariants({ variant: 'outline' })}
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
