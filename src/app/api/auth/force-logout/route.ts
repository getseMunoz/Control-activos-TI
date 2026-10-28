import { type NextRequest, NextResponse } from 'next/server'
import { auth, signOut, isSessionUserValid } from '@/lib/auth'

// Ruta dedicada para cerrar sesión cuando el usuario de la sesión ya no es válido
// (inactivo, eliminado, o con rol distinto al del token). No usa requireAuthenticatedUser()
// ni requireAdminTI() para evitar un bucle, ya que esas funciones redirigen aquí mismo
// cuando detectan una sesión inválida.
export async function GET(req: NextRequest) {
  const session = await auth()

  // Sin sesión: no hay nada que cerrar, ir directo al login.
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Vuelve a verificar contra la base de datos antes de cerrar sesión: si el usuario
  // sigue siendo válido, no se cierra su sesión (evita que un enlace cierre la sesión
  // de alguien que sí tiene acceso legítimo).
  const valid = await isSessionUserValid(session.user.id, session.user.role)
  if (valid) {
    const dest = session.user.role === 'admin_ti' ? '/dashboard' : '/my-assets'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  await signOut({ redirectTo: '/login?sessionInvalid=1' })
}
