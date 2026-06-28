'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const createExpenseSchema = z.object({
  assetId: z.string().uuid('ID de activo inválido'),
  description: z.string().min(1, 'La descripción del gasto es obligatoria'),
  amount: z.string().min(1, 'El monto es obligatorio'),
  expenseDate: z.string().min(1, 'La fecha del gasto es obligatoria'),
  providerName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
})

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

export async function createAssetExpenseAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    assetId: formData.get('assetId')?.toString() ?? '',
    description: formData.get('description')?.toString().trim() ?? '',
    amount: formData.get('amount')?.toString().trim() ?? '',
    expenseDate: formData.get('expenseDate')?.toString() ?? '',
    providerName: parseOptionalString(formData, 'providerName'),
    invoiceNumber: parseOptionalString(formData, 'invoiceNumber'),
    notes: parseOptionalString(formData, 'notes'),
  }

  const result = createExpenseSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const amountNum = Number(data.amount)
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return { success: false, error: 'El monto debe ser un número mayor que 0.' }
  }

  const expenseDate = new Date(data.expenseDate)
  if (isNaN(expenseDate.getTime())) {
    return { success: false, error: 'La fecha del gasto no es válida.' }
  }

  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
    select: { id: true, deletedAt: true },
  })
  if (!asset) {
    return { success: false, error: 'Activo no encontrado.' }
  }
  if (asset.deletedAt !== null) {
    return { success: false, error: 'No se puede registrar un gasto en un activo archivado.' }
  }

  // Schema: name = descripción, cost = monto, purchaseDate = fecha, supplierName = proveedor
  await prisma.assetExpense.create({
    data: {
      assetId: data.assetId,
      name: data.description,
      cost: new Prisma.Decimal(amountNum),
      purchaseDate: expenseDate,
      supplierName: data.providerName ?? null,
      invoiceNumber: data.invoiceNumber ?? null,
      notes: data.notes ?? null,
      createdBy: admin.id,
    },
  })

  revalidatePath(`/assets/${data.assetId}`)
  revalidatePath('/assets')
  redirect(`/assets/${data.assetId}`)
}
