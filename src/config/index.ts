// Constantes de configuración global.
// Sin lógica de negocio — solo valores de configuración.

export const APP_CONFIG = {
  name: 'CIPRIJAL — Activos TI',
  description: 'Sistema de Gestión de Activos TI',
  company: 'CIPRIJAL',
} as const

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const

export const AUTH = {
  sessionMaxAge: 30 * 60, // 30 minutos en segundos
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos en ms
} as const

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  assets: '/assets',
  assignments: '/assignments',
  incidents: '/incidents',
  maintenance: '/maintenance',
  reports: '/reports',
  alerts: '/alerts',
  audit: '/audit',
  adminUsers: '/admin/users',
  adminSettings: '/admin/settings',
  profile: '/profile',
} as const

// Rutas que requieren rol admin_ti (el resto del dashboard se verifica individualmente)
export const ADMIN_ONLY_ROUTES = [
  '/assets/new',
  '/audit',
  '/admin',
  '/reports',
  '/alerts',
  '/maintenance',
] as const
