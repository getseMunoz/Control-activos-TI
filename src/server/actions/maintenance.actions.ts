'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const MAINTENANCE_TYPE_VALUES = ['preventive', 'corrective', 'warranty_repair'] as const

const createMaintenanceOrderSchema = z.object({
  assetId: z.string().uuid('ID de activo inválido'),
  title: z.string().min(1, 'El título es obligatorio'),
  type: z.enum(MAINTENANCE_TYPE_VALUES, {
    errorMap: () => ({ message: 'Selecciona un tipo de mantenimiento válido' }),
  }),
  scheduledDate: z.string().optional(),
  cost: z.string().optional(),
  description: z.string().optional(),
})

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `OT-${year}-`
  const last = await prisma.maintenanceOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })
  let seq = 1
  if (last) {
    const parsed = parseInt(last.orderNumber.slice(prefix.length), 10)
    if (!isNaN(parsed)) seq = parsed + 1
  }
  return `${prefix}${String(seq).padStart(4, '0')}`
}

export async function createMaintenanceOrderAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    assetId: formData.get('assetId')?.toString() ?? '',
    title: formData.get('title')?.toString().trim() ?? '',
    type: formData.get('type')?.toString() ?? '',
    scheduledDate: formData.get('scheduledDate')?.toString() || undefined,
    cost: formData.get('cost')?.toString().trim() || undefined,
    description: formData.get('description')?.toString().trim() || undefined,
  }

  const result = createMaintenanceOrderSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  // Validar fecha programada si viene
  let scheduledDate: Date | null = null
  if (data.scheduledDate) {
    scheduledDate = new Date(data.scheduledDate)
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: 'La fecha programada no es válida.' }
    }
  }

  // Validar costo si viene
  let costDecimal: Prisma.Decimal | null = null
  if (data.cost) {
    const costNum = Number(data.cost)
    if (!Number.isFinite(costNum) || costNum < 0) {
      return { success: false, error: 'El costo debe ser un número mayor o igual a 0.' }
    }
    costDecimal = new Prisma.Decimal(costNum)
  }

  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
    select: { id: true, deletedAt: true },
  })
  if (!asset) {
    return { success: false, error: 'Activo no encontrado.' }
  }
  if (asset.deletedAt !== null) {
    return {
      success: false,
      error: 'No se puede registrar un mantenimiento en un activo archivado.',
    }
  }

  const orderNumber = await generateOrderNumber()

  await prisma.maintenanceOrder.create({
    data: {
      orderNumber,
      assetId: data.assetId,
      title: data.title,
      type: data.type,
      status: 'pending',
      description: data.description ?? null,
      scheduledDate,
      cost: costDecimal,
      createdBy: admin.id,
    },
  })

  revalidatePath(`/assets/${data.assetId}`)
  redirect(`/assets/${data.assetId}`)
}
