// Tipos TypeScript compartidos entre el servidor y el cliente.
// Los tipos de dominio (Asset, User, etc.) se generarán automáticamente
// desde prisma/schema.prisma con `prisma generate`.

export type Role = 'admin_ti' | 'usuario_final'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}

// Tipo genérico para respuestas de Server Actions
export type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }

// Tipo para respuestas de colección paginadas (Route Handlers)
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Parámetros comunes de paginación y filtrado
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}
