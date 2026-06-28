'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const createSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().uuid('ID de ubicación inválido'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

export async function createLocationAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminTI()

  const raw = {
    name: formData.get('name')?.toString().trim() ?? '',
    description: parseOptionalString(formData, 'description'),
  }

  const result = createSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  // No permitir nombres duplicados entre ubicaciones activas
  const nameConflict = await prisma.location.findFirst({
    where: { name: data.name, isActive: true, deletedAt: null },
  })
  if (nameConflict) {
    return { success: false, error: 'Ya existe una ubicación activa con ese nombre.' }
  }

  await prisma.location.create({
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  })

  revalidatePath('/admin/locations')
  redirect('/admin/locations')
}

export async function updateLocationAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminTI()

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    name: formData.get('name')?.toString().trim() ?? '',
    description: parseOptionalString(formData, 'description'),
    isActive: formData.get('isActive') === '1',
  }

  const result = updateSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const current = await prisma.location.findFirst({ where: { id: data.id } })
  if (!current) {
    return { success: false, error: 'Ubicación no encontrada.' }
  }

  // No duplicar nombre activo (excluyendo este mismo registro)
  const nameConflict = await prisma.location.findFirst({
    where: {
      name: data.name,
      isActive: true,
      deletedAt: null,
      NOT: { id: data.id },
    },
  })
  if (nameConflict) {
    return { success: false, error: 'Ya existe una ubicación activa con ese nombre.' }
  }

  const isBeingDeactivated = current.isActive && !data.isActive

  // RN-LOC-01: no desactivar si tiene usuarios activos o activos asociados
  if (isBeingDeactivated) {
    const activeUsers = await prisma.user.count({
      where: { locationId: data.id, isActive: true, deletedAt: null },
    })
    if (activeUsers > 0) {
      return {
        success: false,
        error: `No se puede desactivar: hay ${activeUsers} usuario(s) activo(s) asociado(s) a esta ubicación.`,
      }
    }

    const activeAssets = await prisma.asset.count({
      where: { locationId: data.id, deletedAt: null },
    })
    if (activeAssets > 0) {
      return {
        success: false,
        error: `No se puede desactivar: hay ${activeAssets} activo(s) asociado(s) a esta ubicación.`,
      }
    }
  }

  await prisma.location.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description ?? null,
      isActive: data.isActive,
      ...(current.isActive && !data.isActive ? { deletedAt: new Date() } : {}),
      ...(!current.isActive && data.isActive ? { deletedAt: null } : {}),
    },
  })

  revalidatePath('/admin/locations')
  revalidatePath(`/admin/locations/${data.id}/edit`)
  return { success: true }
}
