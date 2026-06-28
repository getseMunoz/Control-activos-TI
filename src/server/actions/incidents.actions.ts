'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'] as const

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
