'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/lib/auth'
import { ROUTES } from '@/config'

export type LoginState = { error: string } | null

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  if (!email || !password) {
    return { error: 'El correo y la contraseña son obligatorios.' }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: ROUTES.dashboard })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Correo o contraseña incorrectos.' }
    }
    // Re-lanzar NEXT_REDIRECT para que Next.js ejecute la redirección
    throw error
  }

  return null
}
