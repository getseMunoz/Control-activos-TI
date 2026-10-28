'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const ALL_STATUSES = [
  'in_storage',
  'assigned',
  'in_maintenance',
  'decommissioned',
  'stolen',
  'lost',
] as const

const createSchema = z.object({
  name: z.string().min(1, 'El nombre del activo es obligatorio'),
  serialNumber: z.string().min(1, 'El número de serie es obligatorio'),
  assetTypeId: z.string().uuid('Selecciona un tipo de activo válido'),
  locationId: z.string().uuid('Selecciona una ubicación válida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  partNumber: z.string().optional(),
  companyAssetNumber: z.string().optional(),
  companyModel: z.string().optional(),
  inventoryTag: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  notes: z.string().optional(),
})

const updateSchema = z.object({
  id: z.string().uuid('ID de activo inválido'),
  name: z.string().min(1, 'El nombre del activo es obligatorio'),
  serialNumber: z.string().min(1, 'El número de serie es obligatorio'),
  assetTypeId: z.string().uuid('Selecciona un tipo de activo válido'),
  locationId: z.string().uuid('Selecciona una ubicación válida'),
  brand: z.string().optional(),
  model: z.string().optional(),
  partNumber: z.string().optional(),
  companyAssetNumber: z.string().optional(),
  companyModel: z.string().optional(),
  inventoryTag: z.string().optional(),
  status: z.enum(ALL_STATUSES, { message: 'Estado inválido' }),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
})

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

async function generateInternalCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `HW-${year}-`

  const last = await prisma.asset.findFirst({
    where: { internalCode: { startsWith: prefix } },
    orderBy: { internalCode: 'desc' },
    select: { internalCode: true },
  })

  let seq = 1
  if (last) {
    const parsed = parseInt(last.internalCode.slice(prefix.length), 10)
    if (!isNaN(parsed)) seq = parsed + 1
  }

  return `${prefix}${String(seq).padStart(4, '0')}`
}

export async function createAssetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    name: formData.get('name')?.toString().trim() ?? '',
    serialNumber: formData.get('serialNumber')?.toString().trim() ?? '',
    assetTypeId: formData.get('assetTypeId')?.toString() ?? '',
    locationId: formData.get('locationId')?.toString() ?? '',
    brand: parseOptionalString(formData, 'brand'),
    model: parseOptionalString(formData, 'model'),
    partNumber: parseOptionalString(formData, 'partNumber'),
    companyAssetNumber: parseOptionalString(formData, 'companyAssetNumber'),
    companyModel: parseOptionalString(formData, 'companyModel'),
    inventoryTag: parseOptionalString(formData, 'inventoryTag'),
    purchaseDate: parseOptionalString(formData, 'purchaseDate'),
    purchasePrice: parseOptionalString(formData, 'purchasePrice'),
    notes: parseOptionalString(formData, 'notes'),
  }

  const result = createSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const [serialConflict, assetType, location] = await Promise.all([
    prisma.asset.findUnique({ where: { serialNumber: data.serialNumber }, select: { id: true } }),
    prisma.assetType.findFirst({
      where: { id: data.assetTypeId, isActive: true },
      select: { id: true },
    }),
    prisma.location.findFirst({
      where: { id: data.locationId, isActive: true, deletedAt: null },
      select: { id: true },
    }),
  ])
  if (serialConflict) {
    return { success: false, error: 'Ya existe un activo con ese número de serie.' }
  }
  if (!assetType) {
    return { success: false, error: 'Selecciona un tipo de activo activo y válido.' }
  }
  if (!location) {
    return { success: false, error: 'Selecciona una ubicación activa y válida.' }
  }

  const internalCode = await generateInternalCode()

  const purchaseDateParsed = data.purchaseDate ? new Date(data.purchaseDate) : null
  const purchasePriceParsed =
    data.purchasePrice && data.purchasePrice !== '' ? new Prisma.Decimal(data.purchasePrice) : null

  try {
    await prisma.asset.create({
      data: {
        internalCode,
        name: data.name,
        serialNumber: data.serialNumber,
        assetTypeId: data.assetTypeId,
        locationId: data.locationId,
        brand: data.brand ?? null,
        model: data.model ?? null,
        partNumber: data.partNumber ?? null,
        companyAssetNumber: data.companyAssetNumber ?? null,
        companyModel: data.companyModel ?? null,
        inventoryTag: data.inventoryTag ?? null,
        purchaseDate: purchaseDateParsed,
        purchasePrice: purchasePriceParsed,
        notes: data.notes ?? null,
        status: 'in_storage',
        createdBy: admin.id,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[] | undefined) ?? []
      if (target.includes('serial_number')) {
        return { success: false, error: 'Ya existe un activo con ese número de serie.' }
      }
      if (target.includes('internal_code')) {
        return { success: false, error: 'Error al generar el código interno. Intenta de nuevo.' }
      }
    }
    throw error
  }

  revalidatePath('/assets')
  redirect('/assets')
}

export async function updateAssetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    name: formData.get('name')?.toString().trim() ?? '',
    serialNumber: formData.get('serialNumber')?.toString().trim() ?? '',
    assetTypeId: formData.get('assetTypeId')?.toString() ?? '',
    locationId: formData.get('locationId')?.toString() ?? '',
    brand: parseOptionalString(formData, 'brand'),
    model: parseOptionalString(formData, 'model'),
    partNumber: parseOptionalString(formData, 'partNumber'),
    companyAssetNumber: parseOptionalString(formData, 'companyAssetNumber'),
    companyModel: parseOptionalString(formData, 'companyModel'),
    inventoryTag: parseOptionalString(formData, 'inventoryTag'),
    status: formData.get('status')?.toString() ?? '',
    purchaseDate: parseOptionalString(formData, 'purchaseDate'),
    purchasePrice: parseOptionalString(formData, 'purchasePrice'),
    notes: parseOptionalString(formData, 'notes'),
    isActive: formData.get('isActive') === '1',
  }

  const result = updateSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const currentAsset = await prisma.asset.findUnique({
    where: { id: data.id },
    select: { id: true, serialNumber: true, status: true, deletedAt: true },
  })
  if (!currentAsset) {
    return { success: false, error: 'Activo no encontrado.' }
  }

  const [assetType, location] = await Promise.all([
    prisma.assetType.findFirst({
      where: { id: data.assetTypeId, isActive: true },
      select: { id: true },
    }),
    prisma.location.findFirst({
      where: { id: data.locationId, isActive: true, deletedAt: null },
      select: { id: true },
    }),
  ])
  if (!assetType) {
    return { success: false, error: 'Selecciona un tipo de activo activo y válido.' }
  }
  if (!location) {
    return { success: false, error: 'Selecciona una ubicación activa y válida.' }
  }

  // Unique serial number check (excluding self)
  if (data.serialNumber !== currentAsset.serialNumber) {
    const conflict = await prisma.asset.findFirst({
      where: { serialNumber: data.serialNumber, id: { not: data.id } },
    })
    if (conflict) {
      return { success: false, error: 'Ya existe otro activo con ese número de serie.' }
    }
  }

  // Status business rules
  if (data.status === 'assigned') {
    const activeAssignment = await prisma.assetAssignment.count({
      where: { assetId: data.id, returnedAt: null },
    })
    if (activeAssignment === 0) {
      return {
        success: false,
        error:
          'No se puede marcar como asignado sin una asignación activa. Gestiona las asignaciones en el módulo correspondiente.',
      }
    }
  }

  // RN-ACT-07: no decommission with active assignment
  if (data.status === 'decommissioned') {
    const activeAssignment = await prisma.assetAssignment.count({
      where: { assetId: data.id, returnedAt: null },
    })
    if (activeAssignment > 0) {
      return {
        success: false,
        error:
          'No se puede dar de baja un activo con asignación activa. Registra primero la devolución.',
      }
    }

    // RN-ACT-10: no se puede dar de baja un activo con mantenimiento abierto
    const openMaintenanceOrder = await prisma.maintenanceOrder.findFirst({
      where: {
        assetId: data.id,
        status: { in: ['pending', 'in_progress', 'waiting_parts', 'waiting_supplier'] },
      },
      select: { orderNumber: true },
      orderBy: { createdAt: 'asc' },
    })
    if (openMaintenanceOrder) {
      return {
        success: false,
        error: `No se puede dar de baja: el activo tiene un mantenimiento abierto (folio ${openMaintenanceOrder.orderNumber}). Ciérralo antes de darlo de baja.`,
      }
    }
  }

  // Soft delete handling
  const isCurrentlyActive = currentAsset.deletedAt === null
  const isBeingDeactivated = isCurrentlyActive && !data.isActive

  if (isBeingDeactivated) {
    const activeAssignment = await prisma.assetAssignment.count({
      where: { assetId: data.id, returnedAt: null },
    })
    if (activeAssignment > 0) {
      return {
        success: false,
        error: 'No se puede archivar un activo con asignación activa.',
      }
    }
  }

  const purchaseDateParsed = data.purchaseDate ? new Date(data.purchaseDate) : null
  const purchasePriceParsed =
    data.purchasePrice && data.purchasePrice !== '' ? new Prisma.Decimal(data.purchasePrice) : null

  const softDeleteFields = isBeingDeactivated
    ? { deletedAt: new Date(), deletedBy: admin.id }
    : !isCurrentlyActive && data.isActive
      ? { deletedAt: null, deletedBy: null }
      : {}

  try {
    await prisma.asset.update({
      where: { id: data.id },
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        assetTypeId: data.assetTypeId,
        locationId: data.locationId,
        brand: data.brand ?? null,
        model: data.model ?? null,
        partNumber: data.partNumber ?? null,
        companyAssetNumber: data.companyAssetNumber ?? null,
        companyModel: data.companyModel ?? null,
        inventoryTag: data.inventoryTag ?? null,
        status: data.status,
        purchaseDate: purchaseDateParsed,
        purchasePrice: purchasePriceParsed,
        notes: data.notes ?? null,
        updatedBy: admin.id,
        ...softDeleteFields,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Ya existe otro activo con ese número de serie.' }
    }
    throw error
  }

  revalidatePath('/assets')
  return { success: true }
}
