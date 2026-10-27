'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { requireAdminTI } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

const BCRYPT_COST = 12

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial')

const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos numéricos')
  .optional()

const createSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  role: z.enum(['admin_ti', 'usuario_final'], { message: 'Rol inválido' }),
  position: z.string().optional(),
  phone: phoneSchema,
  modality: z.enum(['presencial', 'remoto', 'hibrido']).optional(),
  locationId: z.string().uuid('ID de ubicación inválido').optional(),
  password: passwordSchema,
})

const updateSchema = z.object({
  id: z.string().uuid('ID de usuario inválido'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  role: z.enum(['admin_ti', 'usuario_final'], { message: 'Rol inválido' }),
  position: z.string().optional(),
  phone: phoneSchema,
  modality: z.enum(['presencial', 'remoto', 'hibrido']).optional(),
  locationId: z.string().uuid('ID de ubicación inválido').optional(),
  isActive: z.boolean(),
})

function parseOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key)?.toString().trim()
  return val || undefined
}

async function countActiveAdmins(): Promise<number> {
  return prisma.user.count({
    where: { role: 'admin_ti', isActive: true, deletedAt: null },
  })
}

export async function createUserAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminTI()

  const raw = {
    firstName: formData.get('firstName')?.toString().trim() ?? '',
    lastName: formData.get('lastName')?.toString().trim() ?? '',
    email: formData.get('email')?.toString().trim().toLowerCase() ?? '',
    role: formData.get('role')?.toString() ?? '',
    position: parseOptionalString(formData, 'position'),
    phone: parseOptionalString(formData, 'phone'),
    modality: parseOptionalString(formData, 'modality'),
    locationId: parseOptionalString(formData, 'locationId'),
    password: formData.get('password')?.toString() ?? '',
  }

  const result = createSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const existing = await prisma.user.findFirst({ where: { email: data.email } })
  if (existing) {
    return { success: false, error: 'Ya existe un usuario con ese correo electrónico.' }
  }

  const passwordHash = await hash(data.password, BCRYPT_COST)

  await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: data.role,
      position: data.position ?? null,
      phone: data.phone ?? null,
      modality: data.modality ?? null,
      locationId: data.locationId ?? null,
      mustChangePassword: false,
    },
  })

  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function updateUserAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    id: formData.get('id')?.toString() ?? '',
    firstName: formData.get('firstName')?.toString().trim() ?? '',
    lastName: formData.get('lastName')?.toString().trim() ?? '',
    role: formData.get('role')?.toString() ?? '',
    position: parseOptionalString(formData, 'position'),
    phone: parseOptionalString(formData, 'phone'),
    modality: parseOptionalString(formData, 'modality'),
    locationId: parseOptionalString(formData, 'locationId'),
    isActive: formData.get('isActive') === '1',
  }

  const result = updateSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const data = result.data

  const currentUser = await prisma.user.findFirst({ where: { id: data.id } })
  if (!currentUser) {
    return { success: false, error: 'Usuario no encontrado.' }
  }

  const isSelfEdit = data.id === admin.id
  const isLosingAdminRole = currentUser.role === 'admin_ti' && data.role !== 'admin_ti'
  const isBeingDeactivated = currentUser.isActive && !data.isActive

  // Protección de auto-edición
  if (isSelfEdit && isLosingAdminRole) {
    return { success: false, error: 'No puedes cambiar tu propio rol de Administrador TI.' }
  }
  if (isSelfEdit && isBeingDeactivated) {
    return { success: false, error: 'No puedes desactivarte a ti mismo.' }
  }

  // Protección del último admin activo — solo aplica cuando el usuario afectado es admin_ti
  const affectsActiveAdmin =
    currentUser.role === 'admin_ti' &&
    currentUser.isActive &&
    (isLosingAdminRole || isBeingDeactivated)

  if (affectsActiveAdmin) {
    const adminCount = await countActiveAdmins()
    if (adminCount <= 1) {
      return {
        success: false,
        error: 'No se puede quitar el último administrador TI activo del sistema.',
      }
    }
  }

  // RN-USR-04: block deactivation if user has active assignments
  if (isBeingDeactivated) {
    const activeCount = await prisma.assetAssignment.count({
      where: { userId: data.id, returnedAt: null },
    })
    if (activeCount > 0) {
      return {
        success: false,
        error: `No se puede desactivar: el usuario tiene ${activeCount} equipo(s) asignado(s). Primero registre la devolución.`,
      }
    }
  }

  await prisma.user.update({
    where: { id: data.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      position: data.position ?? null,
      phone: data.phone ?? null,
      modality: data.modality ?? null,
      locationId: data.locationId ?? null,
      isActive: data.isActive,
      // Set deletedAt when deactivating; clear it when reactivating
      ...(currentUser.isActive && !data.isActive ? { deletedAt: new Date() } : {}),
      ...(!currentUser.isActive && data.isActive ? { deletedAt: null } : {}),
    },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${data.id}/edit`)
  return { success: true }
}

export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdminTI()

  // Protección de auto-desactivación
  if (userId === admin.id) {
    return { success: false, error: 'No puedes desactivarte a ti mismo.' }
  }

  const user = await prisma.user.findFirst({ where: { id: userId } })
  if (!user) return { success: false, error: 'Usuario no encontrado.' }
  if (!user.isActive) return { success: false, error: 'El usuario ya está desactivado.' }

  // Protección del último admin activo
  if (user.role === 'admin_ti') {
    const adminCount = await countActiveAdmins()
    if (adminCount <= 1) {
      return {
        success: false,
        error: 'No se puede quitar el último administrador TI activo del sistema.',
      }
    }
  }

  // RN-USR-04
  const activeCount = await prisma.assetAssignment.count({
    where: { userId, returnedAt: null },
  })
  if (activeCount > 0) {
    return {
      success: false,
      error: `No se puede desactivar: el usuario tiene ${activeCount} equipo(s) asignado(s). Primero registre la devolución.`,
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, deletedAt: new Date() },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  await requireAdminTI()

  const user = await prisma.user.findFirst({ where: { id: userId } })
  if (!user) return { success: false, error: 'Usuario no encontrado.' }
  if (user.isActive) return { success: false, error: 'El usuario ya está activo.' }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true, deletedAt: null },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}/edit`)
  return { success: true }
}

const resetPasswordSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
})

export async function resetUserPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdminTI()

  const raw = {
    userId: formData.get('userId')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
    confirmPassword: formData.get('confirmPassword')?.toString() ?? '',
  }

  const result = resetPasswordSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const { userId, password, confirmPassword } = result.data

  if (password !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden.' }
  }

  if (userId === admin.id) {
    return {
      success: false,
      error: 'No puedes restablecer tu propia contraseña desde esta pantalla.',
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return { success: false, error: 'Usuario no encontrado.' }
  }
  if (user.deletedAt !== null) {
    return {
      success: false,
      error: 'No se puede restablecer la contraseña de un usuario eliminado.',
    }
  }

  const passwordHash = await hash(password, BCRYPT_COST)

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}/edit`)
  redirect(`/admin/users/${userId}/edit?passwordReset=success`)
}
