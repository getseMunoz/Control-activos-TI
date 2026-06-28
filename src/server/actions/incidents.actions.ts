'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'] as const
const INCIDENT_STATUS_VALUES = ['open', 'in_review', 'in_progress', 'resolved', 'closed'] as const

const createIncidentSchema = z.object({
  assetId: z.string().uuid('ID de activo inválido'),
  title: z.string().min(1, 'El título de la incidencia es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  priority: z.enum(PRIORITY_VALUES, {
    errorMap: () => ({ message: 'Selecciona una prioridad válida' }),
  }),
  notes: z.string().optional(),
})

async function generateIncidentNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `INC-${year}-`
  const last = await prisma.incident.findFirst({
    where: { incidentNumber: { startsWith: prefix } },
    orderBy: { incidentNumber: 'desc' },
    select: { incidentNumber: true },
  })
  let seq = 1
  if (last) {
    const parsed = parseInt(last.incidentNumber.slice(prefix.length), 10)
    if (!isNaN(parsed)) seq = parsed + 1
  }
  return `${prefix}${String(seq).padStart(4, '0')}`
}

export async function createIncidentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    assetId: formData.get('assetId')?.toString() ?? '',
    title: formData.get('title')?.toString().trim() ?? '',
    description: formData.get('description')?.toString().trim() ?? '',
    priority: formData.get('priority')?.toString() ?? '',
    notes: formData.get('notes')?.toString().trim() || undefined,
  }

  const result = createIncidentSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
    select: { id: true, deletedAt: true },
  })
  if (!asset) {
    return { success: false, error: 'Activo no encontrado.' }
  }
  if (asset.deletedAt !== null) {
    return { success: false, error: 'No se puede registrar una incidencia en un activo archivado.' }
  }

  const incidentNumber = await generateIncidentNumber()

  const fullDescription = data.notes
    ? `${data.description}\n\nNotas iniciales:\n${data.notes}`
    : data.description

  await prisma.incident.create({
    data: {
      incidentNumber,
      assetId: data.assetId,
      reportedBy: admin.id,
      title: data.title,
      description: fullDescription,
      status: 'open',
      priority: data.priority,
      resolution: null,
    },
  })

  revalidatePath(`/assets/${data.assetId}`)
  redirect(`/assets/${data.assetId}`)
}

const updateIncidentSchema = z.object({
  id: z.string().uuid('ID de incidencia inválido'),
  assetId: z.string().uuid('ID de activo inválido'),
  status: z.enum(INCIDENT_STATUS_VALUES, {
    errorMap: () => ({ message: 'Estado de incidencia inválido' }),
  }),
  resolution: z.string().optional(),
  resolvedAt: z.string().optional(),
})

export async function updateIncidentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    assetId: formData.get('assetId')?.toString() ?? '',
    status: formData.get('status')?.toString() ?? '',
    resolution: formData.get('resolution')?.toString().trim() || undefined,
    resolvedAt: formData.get('resolvedAt')?.toString() || undefined,
  }

  const parsed = updateIncidentSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data = parsed.data

  // Parsear fecha de resolución si viene
  let resolvedAt: Date | null = null
  if (data.resolvedAt) {
    const d = new Date(data.resolvedAt)
    if (isNaN(d.getTime())) {
      return { success: false, error: 'La fecha de resolución no es válida.' }
    }
    resolvedAt = d
  }

  const isResolvedOrClosed = data.status === 'resolved' || data.status === 'closed'

  // Si el estado es resolved o closed, resolution es obligatoria
  if (isResolvedOrClosed && !data.resolution) {
    return {
      success: false,
      error: 'La resolución es obligatoria al marcar una incidencia como resuelta o cerrada.',
    }
  }

  // Verificar que la incidencia existe y pertenece al activo
  const incident = await prisma.incident.findFirst({
    where: { id: data.id, assetId: data.assetId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      asset: { select: { deletedAt: true } },
    },
  })
  if (!incident) {
    return { success: false, error: 'Incidencia no encontrada.' }
  }
  if (incident.asset.deletedAt !== null) {
    return {
      success: false,
      error: 'No se puede actualizar una incidencia de un activo archivado.',
    }
  }
  if (incident.status === 'closed') {
    return { success: false, error: 'No se puede actualizar una incidencia cerrada.' }
  }

  // Validar que resolvedAt no sea anterior a createdAt
  if (resolvedAt && resolvedAt < incident.createdAt) {
    return {
      success: false,
      error:
        'La fecha de resolución no puede ser anterior a la fecha de creación de la incidencia.',
    }
  }

  // Auto-asignar resolvedAt si no viene y el estado es resolved o closed
  if (isResolvedOrClosed && !resolvedAt) {
    resolvedAt = new Date()
  }

  await prisma.incident.update({
    where: { id: data.id },
    data: {
      status: data.status,
      resolution: isResolvedOrClosed ? (data.resolution ?? null) : null,
      resolvedAt: isResolvedOrClosed ? resolvedAt : null,
      resolvedBy: isResolvedOrClosed ? admin.id : null,
    },
  })

  revalidatePath(`/assets/${data.assetId}`)
  redirect(`/assets/${data.assetId}`)
}
