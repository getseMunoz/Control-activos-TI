'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateCredentialAction } from '@/server/actions/credentials.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[72px]'

type CredentialData = {
  id: string
  label: string
  username: string | null
  accessUrl: string | null
  notes: string | null
}

type Props = {
  assetId: string
  credential: CredentialData
  hasPassword: boolean
}

export function CredentialEditForm({ assetId, credential, hasPassword }: Props) {
  const [state, action, pending] = useActionState(updateCredentialAction, null)

  return (
    <>
      <Link
        href={`/assets/${assetId}`}
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        style={{ marginBottom: '16px', display: 'inline-flex' }}
      >
        ← Volver al activo
      </Link>

      <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
        Editar credencial
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
        La contraseña actual no se muestra por seguridad. Deja el campo vacío para conservarla.
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="id" value={credential.id} />
        <input type="hidden" name="assetId" value={assetId} />

        <div className="space-y-1.5">
          <Label htmlFor="label">Etiqueta *</Label>
          <Input
            id="label"
            name="label"
            required
            autoComplete="off"
            defaultValue={credential.label}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              name="username"
              autoComplete="off"
              defaultValue={credential.username ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={
                hasPassword ? 'Dejar vacío para conservar la actual' : 'Sin contraseña guardada'
              }
            />
            <p className="text-muted-foreground text-xs">
              {hasPassword
                ? 'La contraseña actual se conserva si este campo queda vacío.'
                : 'No hay contraseña guardada actualmente.'}
            </p>
          </div>
        </div>

        {hasPassword && (
          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="removePassword"
                value="1"
                className="h-4 w-4 rounded border"
              />
              <span className="text-sm font-medium text-red-600">Eliminar contraseña guardada</span>
            </label>
            <p className="text-muted-foreground text-xs">
              Marca esta casilla para borrar la contraseña actual. Si también escribes una nueva
              contraseña arriba, se mostrará un error.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="accessUrl">URL de acceso</Label>
          <Input
            id="accessUrl"
            name="accessUrl"
            type="url"
            autoComplete="off"
            defaultValue={credential.accessUrl ?? ''}
            placeholder="https://… (opcional)"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas</Label>
          <textarea
            id="notes"
            name="notes"
            className={textareaClass}
            defaultValue={credential.notes ?? ''}
          />
        </div>

        {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          <Link href={`/assets/${assetId}`} className={buttonVariants({ variant: 'outline' })}>
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}
