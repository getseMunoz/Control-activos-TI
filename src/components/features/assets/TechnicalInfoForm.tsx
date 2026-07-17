'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { upsertTechnicalInfoAction } from '@/server/actions/technical-info.actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import type { AssetTechnicalInfoData } from '@/server/queries/technical-info.queries'

const textareaClass =
  'border-input bg-transparent text-foreground w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 resize-y min-h-[80px]'

type Props = {
  assetId: string
  techInfo: AssetTechnicalInfoData | null
}

export function TechnicalInfoForm({ assetId, techInfo }: Props) {
  const [state, action, pending] = useActionState(upsertTechnicalInfoAction, null)
  const v = techInfo

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
        {v ? 'Editar información técnica' : 'Agregar información técnica'}
      </h1>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>
        Visible solo para personal de Sistemas (admin_ti). Todos los campos son opcionales.
      </p>

      <form action={action} className="space-y-8">
        <input type="hidden" name="assetId" value={assetId} />

        {/* Red */}
        <fieldset className="space-y-4">
          <legend className="text-foreground mb-2 text-sm font-semibold">Red</legend>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                name="hostname"
                autoComplete="off"
                defaultValue={v?.hostname ?? ''}
                placeholder="Ej: CIPRIJAL-PC-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ipAddress">Dirección IP local</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                autoComplete="off"
                defaultValue={v?.ipAddress ?? ''}
                placeholder="Ej: 192.168.1.100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="macAddressEth0">MAC ETH0 (cable)</Label>
              <Input
                id="macAddressEth0"
                name="macAddressEth0"
                autoComplete="off"
                defaultValue={v?.macAddressEth0 ?? ''}
                placeholder="Ej: AA:BB:CC:DD:EE:FF"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="macAddressWifi">MAC Wi-Fi</Label>
              <Input
                id="macAddressWifi"
                name="macAddressWifi"
                autoComplete="off"
                defaultValue={v?.macAddressWifi ?? ''}
                placeholder="Ej: AA:BB:CC:DD:EE:FF"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publicIpAddress">IP pública</Label>
            <Input
              id="publicIpAddress"
              name="publicIpAddress"
              autoComplete="off"
              defaultValue={v?.publicIpAddress ?? ''}
              placeholder="Ej: 200.1.2.3 (si aplica)"
            />
          </div>
        </fieldset>

        {/* Sistema */}
        <fieldset className="space-y-4">
          <legend className="text-foreground mb-2 text-sm font-semibold">
            Sistema operativo y software
          </legend>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="operatingSystem">Sistema operativo</Label>
              <Input
                id="operatingSystem"
                name="operatingSystem"
                autoComplete="off"
                defaultValue={v?.operatingSystem ?? ''}
                placeholder="Ej: Windows 11 Pro, Ubuntu 22.04"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officeVersion">Versión de Office</Label>
              <Input
                id="officeVersion"
                name="officeVersion"
                autoComplete="off"
                defaultValue={v?.officeVersion ?? ''}
                placeholder="Ej: Microsoft 365, Office 2021"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firmwareVersion">Versión de firmware</Label>
              <Input
                id="firmwareVersion"
                name="firmwareVersion"
                autoComplete="off"
                defaultValue={v?.firmwareVersion ?? ''}
                placeholder="Ej: 1.2.3 (para routers, switches, Raspberry Pi)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modelNumber">Número de modelo</Label>
              <Input
                id="modelNumber"
                name="modelNumber"
                autoComplete="off"
                defaultValue={v?.modelNumber ?? ''}
                placeholder="Ej: RB4011iGS+RM"
              />
            </div>
          </div>
        </fieldset>

        {/* Inventario */}
        <fieldset className="space-y-4">
          <legend className="text-foreground mb-2 text-sm font-semibold">
            Inventario y clasificación
          </legend>

          <div className="space-y-1.5">
            <Label htmlFor="orderNumber">Número de orden de compra</Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              autoComplete="off"
              defaultValue={v?.orderNumber ?? ''}
              placeholder="Ej: OC-2024-0042"
            />
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="byod"
                value="1"
                defaultChecked={v?.byod ?? false}
                className="h-4 w-4 rounded border"
              />
              <span className="text-sm">BYOD (equipo del empleado)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="requestable"
                value="1"
                defaultChecked={v?.requestable ?? false}
                className="h-4 w-4 rounded border"
              />
              <span className="text-sm">Prestable / Requestable</span>
            </label>
          </div>
        </fieldset>

        {/* Notas técnicas */}
        <div className="space-y-1.5">
          <Label htmlFor="additionalNotes">Notas técnicas</Label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            className={textareaClass}
            defaultValue={v?.additionalNotes ?? ''}
            placeholder="Configuraciones especiales, instrucciones de red, puertos abiertos, historial técnico…"
          />
        </div>

        {state && !state.success && <p className="text-destructive text-sm">{state.error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando...' : v ? 'Guardar cambios' : 'Agregar información'}
          </Button>
          <Link href={`/assets/${assetId}`} className={buttonVariants({ variant: 'outline' })}>
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}
