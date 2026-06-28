'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateIncidentAction } from '@/server/actions/incidents.actions'
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

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abierta' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'resolved', label: 'Resuelta' },
  { value: 'closed', label: 'Cerrada' },
]

type IncidentContext = {
  id: string
  assetId: string
  incidentNumber: string
  title: string
  description: string
  priority: string
  status: string
  resolution: string | null
  resolvedAt: Date | null
  createdAt: Date
  asset: {
    id: string
    internalCode: string
    name: string
    serialNumber: string
    status: string
    deletedAt: Date | null
  }
}

type Props = { incident: IncidentContext }

function toDateInput(d: Date | null | undefined): string {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export function IncidentEditForm({ incident }: Props) {
  const [state, action, pending] = useActionState(updateIncidentAction, null)

  const isArchived = incident.asset.deletedAt !== null
  const isClosed = incident.status === 'closed'

  return (
    <div className="space-y-5">
      {/* Contexto del activo */}
      <div className="bg-muted space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Código interno:</span>
          <span className="font-mono font-medium">{incident.asset.internalCode}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Activo:</span>
          <span className="font-medium">{incident.asset.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Nº de serie:</span>
          <span className="font-mono">{incident.asset.serialNumber}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Estado activo:</span>
          <span>{ASSET_STATUS_LABELS[incident.asset.status] ?? incident.asset.status}</span>
        </div>
      </div>

      {/* Contexto de la incidencia (solo lectura) */}
      <div className="space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Folio:</span>
          <span className="font-mono font-medium">{incident.incidentNumber}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Fecha de registro:</span>
          <span>
            {new Date(incident.createdAt).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Título:</span>
          <span className="font-medium">{incident.title}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Prioridad:</span>
          <span>{PRIORITY_LABELS[incident.priority] ?? incident.priority}</span>
        </div>
        {incident.description && (
          <div className="flex gap-2">
            <span className="text-muted-foreground w-36 shrink-0">Descripción:</span>
            <span className="whitespace-pre-line text-slate-600">{incident.description}</span>
          </div>
        )}
      </div>

      {isArchived ? (
        <>
          <p className="text-destructive text-sm">
            Este activo está archivado. No se puede actualizar esta incidencia.
          </p>
          <Link
            href={`/assets/${incident.asset.id}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            Volver al detalle
          </Link>
        </>
      ) : isClosed ? (
        <>
          <p className="text-muted-foreground text-sm">
            Esta incidencia está cerrada y ya no puede actualizarse.
          </p>
          <Link
            href={`/assets/${incident.asset.id}`}
            className={buttonVariants({ variant: 'outline' })}
          >
            Volver al detalle
          </Link>
        </>
      ) : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="id" value={incident.id} />
          <input type="hidden" name="assetId" value={incident.assetId} />

          <div className="space-y-1.5">
            <Label htmlFor="status">Estado *</Label>
            <select
              id="status"
              name="status"
              required
              className={selectClass}
              defaultValue={incident.status}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolvedAt">Fecha de resolución</Label>
            <Input
              id="resolvedAt"
              name="resolvedAt"
              type="date"
              defaultValue={toDateInput(incident.resolvedAt)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolution">
              Resolución{' '}
              <span className="text-muted-foreground text-xs">
                (obligatoria al marcar como Resuelta o Cerrada)
              </span>
            </Label>
            <textarea
              id="resolution"
              name="resolution"
              className={textareaClass}
              defaultValue={incident.resolution ?? ''}
              placeholder="Describe cómo se resolvió la incidencia, acciones tomadas, observaciones…"
            />
          </div>

          {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Link
              href={`/assets/${incident.asset.id}`}
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
