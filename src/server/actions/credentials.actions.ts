'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const credentialSchema = z.object({
  assetId: z.string().uuid('ID de activo inválido'),
  label: z.string().min(1, 'La etiqueta es obligatoria').max(100),
  username: z.string().max(200).optional(),
  password: z.string().max(500).optional(),
  accessUrl: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
})

const updateCredentialSchema = credentialSchema.extend({
  id: z.string().uuid('ID de credencial inválido'),
  removePassword: z.boolean().optional(),
})

function parseOptional(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

export async function createCredentialAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    assetId: formData.get('assetId')?.toString() ?? '',
    label: formData.get('label')?.toString().trim() ?? '',
    username: parseOptional(formData, 'username'),
    password: parseOptional(formData, 'password'),
    accessUrl: parseOptional(formData, 'accessUrl') ?? '',
    notes: parseOptional(formData, 'notes'),
  }

  const result = credentialSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { assetId, label, username, password, accessUrl, notes } = result.data

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, deletedAt: true },
  })
  if (!asset || asset.deletedAt !== null) {
    return { success: false, error: 'Activo no encontrado o archivado.' }
  }

  await prisma.assetCredential.create({
    data: {
      assetId,
      label,
      username: username ?? null,
      // NOTE: para producción se recomienda cifrado en reposo del campo password
      password: password ?? null,
      accessUrl: accessUrl || null,
      notes: notes ?? null,
      createdBy: admin.id,
    },
  })

  revalidatePath(`/assets/${assetId}`)
  redirect(`/assets/${assetId}`)
}

export async function updateCredentialAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    assetId: formData.get('assetId')?.toString() ?? '',
    label: formData.get('label')?.toString().trim() ?? '',
    username: parseOptional(formData, 'username'),
    password: parseOptional(formData, 'password'),
    accessUrl: parseOptional(formData, 'accessUrl') ?? '',
    notes: parseOptional(formData, 'notes'),
    removePassword: formData.get('removePassword') === '1',
  }

  const result = updateCredentialSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { id, assetId, label, username, password, accessUrl, notes, removePassword } = result.data

  if (password && removePassword) {
    return {
      success: false,
      error:
        'No puedes escribir una contraseña nueva y marcar "Eliminar contraseña" al mismo tiempo.',
    }
  }

  const existing = await prisma.assetCredential.findFirst({
    where: { id, assetId, deletedAt: null },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: 'Credencial no encontrada.' }
  }

  // undefined → no incluir en update (conserva el valor actual en BD)
  // null       → borrar
  // string     → actualizar al nuevo valor
  let resolvedPassword: string | null | undefined
  if (password) {
    resolvedPassword = password
  } else if (removePassword) {
    resolvedPassword = null
  }
  // else: undefined — Prisma no actualizará el campo

  await prisma.assetCredential.update({
    where: { id },
    data: {
      label,
      username: username ?? null,
      // NOTE: para producción se recomienda cifrado en reposo del campo password
      ...(resolvedPassword !== undefined ? { password: resolvedPassword } : {}),
      accessUrl: accessUrl || null,
      notes: notes ?? null,
      updatedBy: admin.id,
    },
  })

  revalidatePath(`/assets/${assetId}`)
  redirect(`/assets/${assetId}`)
}

export async function deleteCredentialAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const id = formData.get('id')?.toString() ?? ''
  const assetId = formData.get('assetId')?.toString() ?? ''

  if (!id || !assetId) {
    return { success: false, error: 'Datos inválidos.' }
  }

  const existing = await prisma.assetCredential.findFirst({
    where: { id, assetId, deletedAt: null },
    select: { id: true },
  })
  if (!existing) {
    return { success: false, error: 'Credencial no encontrada.' }
  }

  await prisma.assetCredential.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: admin.id },
  })

  revalidatePath(`/assets/${assetId}`)
  return { success: true }
}
