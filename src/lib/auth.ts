import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AUTH } from '@/config'
import type { Role } from '@/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const user = await prisma.user.findFirst({
          where: { email, isActive: true, deletedAt: null },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            role: true,
            failedLoginAttempts: true,
            lockedUntil: true,
          },
        })

        if (!user) return null

        // Cuenta bloqueada temporalmente
        if (user.lockedUntil && user.lockedUntil > new Date()) return null

        const valid = await compare(password, user.passwordHash)

        if (!valid) {
          const newAttempts = user.failedLoginAttempts + 1
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newAttempts,
              ...(newAttempts >= AUTH.maxLoginAttempts && {
                lockedUntil: new Date(Date.now() + AUTH.lockoutDuration),
              }),
            },
          })
          return null
        }

        // Login exitoso — resetear intentos y registrar timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: AUTH.sessionMaxAge,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      return session
    },
  },
})

// Verifica contra la base de datos que el usuario de la sesión siga existiendo,
// activo, no eliminado, y con el mismo rol que tiene en el token. Compartida por
// requireAuthenticatedUser(), requireAdminTI() y la ruta /api/auth/force-logout.
export async function isSessionUserValid(userId: string, tokenRole: Role): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, deletedAt: true, role: true },
  })
  return Boolean(
    dbUser && dbUser.isActive && dbUser.deletedAt === null && dbUser.role === tokenRole,
  )
}

export async function requireAdminTI(): Promise<{ id: string; email: string; role: Role }> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')
  if (session.user.role !== 'admin_ti') throw new Error('Acceso denegado')

  if (!(await isSessionUserValid(session.user.id, session.user.role))) {
    redirect('/api/auth/force-logout')
  }

  return { id: session.user.id, email: session.user.email!, role: session.user.role }
}

export async function requireAuthenticatedUser(): Promise<{
  id: string
  email: string
  role: Role
}> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  if (!(await isSessionUserValid(session.user.id, session.user.role))) {
    redirect('/api/auth/force-logout')
  }

  return { id: session.user.id, email: session.user.email!, role: session.user.role }
}
