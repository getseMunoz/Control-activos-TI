'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createCredentialAction } from '@/server/actions/credentials.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

export default function NewCredentialPage() {
  const { id: assetId } = useParams<{ id: string }>()
  const [state, action, pending] = useActionState(createCredentialAction, null)

  return (
    <div style={{ padding: '32px', maxWidth: '600px' }}>
      <Link
        href={`/assets/${assetId}`}
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        style={{ marginBottom: '16px', display: 'inline-flex' }}
      >
        ← Volver al activo
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
        Nueva credencial
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
        Visible solo para personal de Sistemas (admin_ti).
      </p>

      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '24px',
          fontSize: '12px',
          color: '#92400e',
        }}
      >
        Información visible solo para el equipo de Sistemas. No compartir ni exportar. No guardar
        contraseñas personales de empleados.
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="assetId" value={assetId} />

        <div className="space-y-1.5">
          <Label htmlFor="label">Etiqueta *</Label>
          <Input
            id="label"
            name="label"
            required
            autoComplete="off"
            placeholder="Ej: Acceso administrador, Wi-Fi, Credenciales originales, Panel del módem"
          />
          <p className="text-muted-foreground text-xs">
            Identifica el tipo de acceso: cuenta de sistema, red Wi-Fi, panel de administración,
            credenciales de fábrica, etc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Usuario / SSID</Label>
            <Input
              id="username"
              name="username"
              autoComplete="off"
              placeholder="Ej: admin, usuario original, nombre de red SSID"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña / Clave Wi-Fi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="accessUrl">URL / IP de acceso</Label>
          <Input
            id="accessUrl"
            name="accessUrl"
            type="url"
            autoComplete="off"
            placeholder="Ej: http://192.168.1.1 o IP de administración"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas internas</Label>
          <textarea
            id="notes"
            name="notes"
            className={textareaClass}
            placeholder="Notas internas del área de Sistemas"
          />
        </div>

        {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando...' : 'Guardar credencial'}
          </Button>
          <Link href={`/assets/${assetId}`} className={buttonVariants({ variant: 'outline' })}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
