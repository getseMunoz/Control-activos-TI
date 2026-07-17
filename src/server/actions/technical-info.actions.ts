'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const technicalInfoSchema = z.object({
  assetId: z.string().uuid('ID de activo inválido'),
  hostname: z.string().max(100).optional(),
  macAddressEth0: z.string().max(50).optional(),
  macAddressWifi: z.string().max(50).optional(),
  ipAddress: z.string().max(100).optional(),
  publicIpAddress: z.string().max(100).optional(),
  operatingSystem: z.string().max(100).optional(),
  officeVersion: z.string().max(100).optional(),
  firmwareVersion: z.string().max(100).optional(),
  modelNumber: z.string().max(100).optional(),
  byod: z.boolean().optional(),
  requestable: z.boolean().optional(),
  orderNumber: z.string().max(100).optional(),
  additionalNotes: z.string().max(1000).optional(),
})

function parseOptional(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

export async function upsertTechnicalInfoAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    assetId: formData.get('assetId')?.toString() ?? '',
    hostname: parseOptional(formData, 'hostname'),
    macAddressEth0: parseOptional(formData, 'macAddressEth0'),
    macAddressWifi: parseOptional(formData, 'macAddressWifi'),
    ipAddress: parseOptional(formData, 'ipAddress'),
    publicIpAddress: parseOptional(formData, 'publicIpAddress'),
    operatingSystem: parseOptional(formData, 'operatingSystem'),
    officeVersion: parseOptional(formData, 'officeVersion'),
    firmwareVersion: parseOptional(formData, 'firmwareVersion'),
    modelNumber: parseOptional(formData, 'modelNumber'),
    byod: formData.get('byod') === '1',
    requestable: formData.get('requestable') === '1',
    orderNumber: parseOptional(formData, 'orderNumber'),
    additionalNotes: parseOptional(formData, 'additionalNotes'),
  }

  const result = technicalInfoSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { assetId, byod, requestable, ...fields } = result.data

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, deletedAt: true },
  })
  if (!asset || asset.deletedAt !== null) {
    return { success: false, error: 'Activo no encontrado o archivado.' }
  }

  const sharedData = {
    hostname: fields.hostname ?? null,
    macAddressEth0: fields.macAddressEth0 ?? null,
    macAddressWifi: fields.macAddressWifi ?? null,
    ipAddress: fields.ipAddress ?? null,
    publicIpAddress: fields.publicIpAddress ?? null,
    operatingSystem: fields.operatingSystem ?? null,
    officeVersion: fields.officeVersion ?? null,
    firmwareVersion: fields.firmwareVersion ?? null,
    modelNumber: fields.modelNumber ?? null,
    byod: byod ?? false,
    requestable: requestable ?? false,
    orderNumber: fields.orderNumber ?? null,
    additionalNotes: fields.additionalNotes ?? null,
  }

  await prisma.assetTechnicalInfo.upsert({
    where: { assetId },
    create: { ...sharedData, assetId, createdBy: admin.id },
    update: { ...sharedData, updatedBy: admin.id },
  })

  revalidatePath(`/assets/${assetId}`)
  redirect(`/assets/${assetId}`)
}
