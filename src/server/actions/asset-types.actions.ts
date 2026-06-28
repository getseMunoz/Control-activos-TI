'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const createSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().uuid('ID de tipo de activo inválido'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  isActive: z.boolean(),
})

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

export async function createAssetTypeAction(
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

  // name tiene @unique en la BD; verificación previa para mensaje amigable
  const nameConflict = await prisma.assetType.findFirst({ where: { name: data.name } })
  if (nameConflict) {
    return { success: false, error: 'Ya existe un tipo de activo con ese nombre.' }
  }

  try {
    await prisma.assetType.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Ya existe un tipo de activo con ese nombre.' }
    }
    throw error
  }

  revalidatePath('/admin/asset-types')
  redirect('/admin/asset-types')
}

export async function updateAssetTypeAction(
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

  const current = await prisma.assetType.findFirst({ where: { id: data.id } })
  if (!current) {
    return { success: false, error: 'Tipo de activo no encontrado.' }
  }

  // No duplicar nombre (excluyendo este mismo registro)
  const nameConflict = await prisma.assetType.findFirst({
    where: { name: data.name, NOT: { id: data.id } },
  })
  if (nameConflict) {
    return { success: false, error: 'Ya existe un tipo de activo con ese nombre.' }
  }

  const isBeingDeactivated = current.isActive && !data.isActive

  // No desactivar si tiene activos asociados
  if (isBeingDeactivated) {
    const activeAssets = await prisma.asset.count({
      where: { assetTypeId: data.id, deletedAt: null },
    })
    if (activeAssets > 0) {
      return {
        success: false,
        error: `No se puede desactivar: hay ${activeAssets} activo(s) de este tipo registrado(s).`,
      }
    }
  }

  try {
    await prisma.assetType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description ?? null,
        isActive: data.isActive,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Ya existe un tipo de activo con ese nombre.' }
    }
    throw error
  }

  revalidatePath('/admin/asset-types')
  revalidatePath(`/admin/asset-types/${data.id}/edit`)
  return { success: true }
}
