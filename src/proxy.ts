import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Rutas públicas — accesibles sin sesión
const PUBLIC_ROUTES = ['/login']

// Prefijos exclusivos de admin_ti (usuario_final queda bloqueado)
const ADMIN_ONLY_PREFIXES = [
  '/audit',
  '/admin',
  '/assets',
  '/assignments',
  '/reports',
  '/alerts',
  '/dashboard',
]

// Documentos de asignación accesibles a cualquier usuario autenticado:
//   /assignments/<id>/receipt
//   /assignments/<id>/return-receipt
// La validación de propiedad ocurre dentro de cada página.
function isAssignmentDocumentRoute(pathname: string): boolean {
  return (
    /^\/assignments\/[^/]+\/receipt(\/.*)?$/.test(pathname) ||
    /^\/assignments\/[^/]+\/return-receipt(\/.*)?$/.test(pathname)
  )
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Rutas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (session) {
      const dest = session.user?.role === 'admin_ti' ? '/dashboard' : '/my-assets'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // Toda ruta no pública requiere sesión válida
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar acceso a rutas admin-only
  // Excepción: responsiva de entrega y de devolución son accesibles a cualquier usuario autenticado
  const adminRoute = ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (adminRoute && !isAssignmentDocumentRoute(pathname) && session.user?.role !== 'admin_ti') {
    return NextResponse.redirect(new URL('/my-assets', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Proteger todas las rutas excepto assets estáticos y API de auth
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}
