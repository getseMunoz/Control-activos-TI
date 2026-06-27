import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Rutas públicas — accesibles sin sesión
const PUBLIC_ROUTES = ['/login']

// Prefijos de rutas exclusivas de admin_ti
const ADMIN_ONLY_PREFIXES = ['/audit', '/admin', '/assets/new', '/reports', '/alerts']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Permitir rutas públicas sin verificación
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Si ya tiene sesión y va a /login, redirigir al dashboard
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Toda ruta no pública requiere sesión válida
  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar acceso a rutas exclusivas de admin_ti
  const isAdminRoute = ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isAdminRoute && session.user?.role !== 'admin_ti') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Proteger todas las rutas excepto assets estáticos y API de auth
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}
