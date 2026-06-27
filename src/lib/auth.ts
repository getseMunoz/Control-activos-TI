import NextAuth from 'next-auth'

// Configuración completa de NextAuth se implementará en la Fase 2
// cuando se creen los modelos de User en la base de datos.
// Referencia: ARQUITECTURA.md — Sección 5.2, ADR-004

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutos de inactividad
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
