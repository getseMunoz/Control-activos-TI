'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createUserIncidentAction } from '@/server/actions/incidents.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[96px]'

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
]

type AssetContext = {
  id: string
  internalCode: string
  name: string
  serialNumber: string
}

type Props = { asset: AssetContext }

export function UserIncidentCreateForm({ asset }: Props) {
  const [state, action, pending] = useActionState(createUserIncidentAction, null)

  return (
    <div className="space-y-5">
      {/* Contexto del activo */}
      <div className="bg-muted space-y-1.5 rounded-lg border p-4 text-sm">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Código interno:</span>
          <span className="font-mono font-medium">{asset.internalCode}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Equipo:</span>
          <span className="font-medium">{asset.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-36 shrink-0">Nº de serie:</span>
          <span className="font-mono">{asset.serialNumber}</span>
        </div>
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="assetId" value={asset.id} />

        <div className="space-y-1.5">
          <Label htmlFor="title">Título de la falla *</Label>
          <Input
            id="title"
            name="title"
            required
            autoComplete="off"
            placeholder="Ej: Pantalla rota, equipo no enciende, teclado sin respuesta…"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descripción *</Label>
          <textarea
            id="description"
            name="description"
            required
            className={textareaClass}
            placeholder="Describe la falla, síntomas y en qué condiciones ocurrió"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priority">Prioridad</Label>
          <select id="priority" name="priority" className={selectClass} defaultValue="medium">
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Enviando...' : 'Enviar reporte'}
          </Button>
          <Link href="/my-assets" className={buttonVariants({ variant: 'outline' })}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
