'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAdminTI, requireAuthenticatedUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const createSchema = z.object({
  assetId: z.string().uuid('Selecciona un activo válido'),
  userId: z.string().uuid('Selecciona un usuario válido'),
  assignedAt: z.string().min(1, 'La fecha de asignación es obligatoria'),
  deliveryLocationId: z.string().uuid('Ubicación de entrega inválida').optional(),
  accessories: z.string().optional(),
  notes: z.string().optional(),
})

const returnSchema = z.object({
  id: z.string().uuid('ID de asignación inválido'),
  returnedAt: z.string().min(1, 'La fecha de devolución es obligatoria'),
  notes: z.string().optional(),
})

const signDeliverySchema = z.object({
  assignmentId: z.string().uuid('ID de asignación inválido'),
})

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

export async function createAssignmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    assetId: formData.get('assetId')?.toString() ?? '',
    userId: formData.get('userId')?.toString() ?? '',
    assignedAt: formData.get('assignedAt')?.toString() ?? '',
    deliveryLocationId: parseOptionalString(formData, 'deliveryLocationId'),
    accessories: parseOptionalString(formData, 'accessories'),
    notes: parseOptionalString(formData, 'notes'),
  }

  const result = createSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  // Validar activo: debe existir, no estar archivado, y estar en in_storage
  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
    select: { id: true, status: true, deletedAt: true },
  })
  if (!asset || asset.deletedAt !== null) {
    return { success: false, error: 'El activo no existe o está archivado.' }
  }
  if (asset.status !== 'in_storage') {
    return {
      success: false,
      error: 'El activo debe estar en estado "En almacén" para ser asignado.',
    }
  }

  // RN-ASGN-01: verificar que no haya asignación activa
  const existingActive = await prisma.assetAssignment.findFirst({
    where: { assetId: data.assetId, returnedAt: null },
  })
  if (existingActive) {
    return { success: false, error: 'Este activo ya tiene una asignación activa.' }
  }

  // Validar usuario: activo y no eliminado
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, isActive: true, deletedAt: true },
  })
  if (!user || !user.isActive || user.deletedAt !== null) {
    return { success: false, error: 'El usuario no existe o no está activo.' }
  }

  // Validar ubicación de entrega si se proporcionó
  if (data.deliveryLocationId) {
    const location = await prisma.location.findFirst({
      where: { id: data.deliveryLocationId, isActive: true, deletedAt: null },
    })
    if (!location) {
      return { success: false, error: 'La ubicación de entrega seleccionada no está disponible.' }
    }
  }

  const assignedAt = new Date(data.assignedAt)
  if (isNaN(assignedAt.getTime())) {
    return { success: false, error: 'La fecha de asignación no es válida.' }
  }
  const accessories = data.accessories ? { text: data.accessories } : Prisma.JsonNull

  // RN-ASGN-04: transacción — crear asignación y cambiar estado del activo a 'assigned'
  try {
    await prisma.$transaction([
      prisma.assetAssignment.create({
        data: {
          assetId: data.assetId,
          userId: data.userId,
          assignedAt,
          assignedBy: admin.id,
          deliveryLocationId: data.deliveryLocationId ?? null,
          accessories,
          notes: data.notes ?? null,
        },
      }),
      prisma.asset.update({
        where: { id: data.assetId },
        data: { status: 'assigned', updatedBy: admin.id },
      }),
    ])
  } catch {
    return { success: false, error: 'Error al crear la asignación. Intenta de nuevo.' }
  }

  revalidatePath('/assignments')
  revalidatePath('/assets')
  redirect('/assignments')
}

export async function returnAssignmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const returnSignatureData = formData.get('returnSignatureData')?.toString() ?? ''

  if (!returnSignatureData) {
    return { success: false, error: 'La firma de devolución es obligatoria.' }
  }
  if (!returnSignatureData.startsWith('data:image/png;base64,')) {
    return { success: false, error: 'La firma de devolución no es válida.' }
  }
  if (returnSignatureData.length > 500_000) {
    return { success: false, error: 'La firma es demasiado grande. Intenta de nuevo.' }
  }

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    returnedAt: formData.get('returnedAt')?.toString() ?? '',
    notes: parseOptionalString(formData, 'notes'),
  }

  const result = returnSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  // Verificar que la asignación exista y esté activa
  const assignment = await prisma.assetAssignment.findUnique({
    where: { id: data.id },
    select: {
      id: true,
      assetId: true,
      assignedAt: true,
      returnedAt: true,
      asset: { select: { deletedAt: true } },
    },
  })
  if (!assignment) {
    return { success: false, error: 'Asignación no encontrada.' }
  }
  if (assignment.returnedAt !== null) {
    return { success: false, error: 'Esta asignación ya fue devuelta anteriormente.' }
  }
  if (assignment.asset.deletedAt !== null) {
    return { success: false, error: 'El activo asociado está archivado.' }
  }

  // El nombre del firmante de devolución se obtiene del Administrador TI autenticado
  // (quien recibe físicamente el equipo), nunca del cliente.
  const adminUser = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { id: true, firstName: true, lastName: true, isActive: true, deletedAt: true },
  })
  if (!adminUser || !adminUser.isActive || adminUser.deletedAt !== null) {
    return { success: false, error: 'El administrador no existe o no está activo.' }
  }
  const returnSignedByName = `${adminUser.firstName} ${adminUser.lastName}`

  const returnedAt = new Date(data.returnedAt)
  if (isNaN(returnedAt.getTime())) {
    return { success: false, error: 'La fecha de devolución no es válida.' }
  }
  if (returnedAt < assignment.assignedAt) {
    return {
      success: false,
      error: 'La fecha de devolución no puede ser anterior a la fecha de asignación.',
    }
  }

  // RN-ASGN-05: transacción — registrar devolución y cambiar estado del activo a 'in_storage'
  try {
    await prisma.$transaction([
      prisma.assetAssignment.update({
        where: { id: data.id },
        data: {
          returnedAt,
          returnedBy: admin.id,
          notes: data.notes ?? null,
          returnSignatureData,
          returnSignedByName,
          returnSignedAt: new Date(),
        },
      }),
      prisma.asset.update({
        where: { id: assignment.assetId },
        data: { status: 'in_storage', updatedBy: admin.id },
      }),
    ])
  } catch {
    return { success: false, error: 'Error al registrar la devolución. Intenta de nuevo.' }
  }

  revalidatePath('/assignments')
  revalidatePath('/assets')
  redirect('/assignments')
}

export async function signDeliveryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const sessionUser = await requireAuthenticatedUser()

  const deliverySignatureData = formData.get('deliverySignatureData')?.toString() ?? ''

  if (!deliverySignatureData) {
    return { success: false, error: 'La firma de recepción es obligatoria.' }
  }
  if (!deliverySignatureData.startsWith('data:image/png;base64,')) {
    return { success: false, error: 'La firma de recepción no es válida.' }
  }
  if (deliverySignatureData.length > 500_000) {
    return { success: false, error: 'La firma es demasiado grande. Intenta de nuevo.' }
  }

  const raw = {
    assignmentId: formData.get('assignmentId')?.toString() ?? '',
  }

  const result = signDeliverySchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  // La asignación debe existir, pertenecer al usuario autenticado, seguir activa
  // y no tener firma de recepción previa.
  const assignment = await prisma.assetAssignment.findUnique({
    where: { id: data.assignmentId },
    select: { id: true, userId: true, returnedAt: true, deliverySignedAt: true },
  })
  if (!assignment || assignment.userId !== sessionUser.id) {
    return { success: false, error: 'Asignación no encontrada.' }
  }
  if (assignment.returnedAt !== null) {
    return { success: false, error: 'Esta asignación ya no está activa.' }
  }
  if (assignment.deliverySignedAt !== null) {
    return { success: false, error: 'Esta asignación ya cuenta con firma de recepción.' }
  }

  // El nombre del firmante se obtiene de la base de datos, nunca del cliente.
  const signer = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, firstName: true, lastName: true, isActive: true, deletedAt: true },
  })
  if (!signer || !signer.isActive || signer.deletedAt !== null) {
    return { success: false, error: 'El usuario no existe o no está activo.' }
  }

  await prisma.assetAssignment.update({
    where: { id: assignment.id },
    data: {
      deliverySignatureData,
      deliverySignedByName: `${signer.firstName} ${signer.lastName}`,
      deliverySignedAt: new Date(),
    },
  })

  revalidatePath('/my-assets')
  revalidatePath(`/assignments/${assignment.id}/receipt`)
  redirect('/my-assets')
}
