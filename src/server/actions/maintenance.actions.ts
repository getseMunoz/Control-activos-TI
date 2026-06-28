'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const MAINTENANCE_TYPE_VALUES = ['preventive', 'corrective', 'warranty_repair'] as const
const MAINTENANCE_STATUS_VALUES = [
  'pending',
  'in_progress',
  'waiting_parts',
  'waiting_supplier',
  'completed',
  'cancelled',
] as const
const MAINTENANCE_RESULT_VALUES = [
  'resolved',
  'warranty_sent',
  'unrepairable',
  'cancelled',
] as const

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

const updateMaintenanceOrderSchema = z.object({
  id: z.string().uuid('ID de orden inválido'),
  assetId: z.string().uuid('ID de activo inválido'),
  status: z.enum(MAINTENANCE_STATUS_VALUES, {
    errorMap: () => ({ message: 'Estado de mantenimiento inválido' }),
  }),
  scheduledDate: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  result: z.string().optional(),
  cost: z.string().optional(),
  description: z.string().optional(),
})

function parseDateField(value: string | undefined, label: string): Date | null | string {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return `La ${label} no es válida.`
  return d
}

export async function updateMaintenanceOrderAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminTI()

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    assetId: formData.get('assetId')?.toString() ?? '',
    status: formData.get('status')?.toString() ?? '',
    scheduledDate: formData.get('scheduledDate')?.toString() || undefined,
    startedAt: formData.get('startedAt')?.toString() || undefined,
    completedAt: formData.get('completedAt')?.toString() || undefined,
    result: formData.get('result')?.toString().trim() || undefined,
    cost: formData.get('cost')?.toString().trim() || undefined,
    description: formData.get('description')?.toString().trim() || undefined,
  }

  const parsed = updateMaintenanceOrderSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data = parsed.data

  // Parsear fechas
  const scheduledDateResult = parseDateField(data.scheduledDate, 'fecha programada')
  if (typeof scheduledDateResult === 'string') return { success: false, error: scheduledDateResult }
  const scheduledDate = scheduledDateResult

  const startedAtResult = parseDateField(data.startedAt, 'fecha de inicio')
  if (typeof startedAtResult === 'string') return { success: false, error: startedAtResult }
  let startedAt = startedAtResult

  const completedAtResult = parseDateField(data.completedAt, 'fecha de finalización')
  if (typeof completedAtResult === 'string') return { success: false, error: completedAtResult }
  let completedAt = completedAtResult

  // Consistencia entre fechas
  if (startedAt && completedAt && completedAt < startedAt) {
    return {
      success: false,
      error: 'La fecha de finalización no puede ser anterior a la fecha de inicio.',
    }
  }

  // Reglas de negocio por estado
  if (data.status === 'in_progress' && !startedAt) {
    startedAt = new Date()
  }

  if (data.status === 'completed') {
    if (!completedAt) completedAt = new Date()
    if (!data.result) {
      return { success: false, error: 'El resultado es obligatorio al completar un mantenimiento.' }
    }
  }

  // Validar resultado si viene
  if (data.result && !(MAINTENANCE_RESULT_VALUES as readonly string[]).includes(data.result)) {
    return { success: false, error: 'Resultado de mantenimiento inválido.' }
  }

  // Validar costo
  let costDecimal: Prisma.Decimal | null = null
  if (data.cost) {
    const costNum = Number(data.cost)
    if (!Number.isFinite(costNum) || costNum < 0) {
      return { success: false, error: 'El costo debe ser un número mayor o igual a 0.' }
    }
    costDecimal = new Prisma.Decimal(costNum)
  }

  // Verificar que la orden existe y pertenece al activo
  const order = await prisma.maintenanceOrder.findFirst({
    where: { id: data.id, assetId: data.assetId },
    select: { id: true, status: true, asset: { select: { deletedAt: true } } },
  })
  if (!order) {
    return { success: false, error: 'Orden de mantenimiento no encontrada.' }
  }
  if (order.asset.deletedAt !== null) {
    return {
      success: false,
      error: 'No se puede actualizar un mantenimiento de un activo archivado.',
    }
  }
  if (order.status === 'completed' || order.status === 'cancelled') {
    return {
      success: false,
      error: 'No se puede actualizar una orden de mantenimiento completada o cancelada.',
    }
  }

  await prisma.maintenanceOrder.update({
    where: { id: data.id },
    data: {
      status: data.status,
      scheduledDate,
      startedAt,
      completedAt,
      result: data.result ? (data.result as (typeof MAINTENANCE_RESULT_VALUES)[number]) : null,
      cost: costDecimal,
      description: data.description ?? null,
    },
  })

  revalidatePath(`/assets/${data.assetId}`)
  redirect(`/assets/${data.assetId}`)
}
