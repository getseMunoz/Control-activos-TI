# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Sistema empresarial de gestión de activos TI para CIPRIJAL. La Fase 1 (inicialización) está completa. El código de negocio se construye a partir de la Fase 2.

Ver los documentos de arquitectura y especificación antes de cualquier implementación.

## Stack instalado

- **Framework full-stack:** Next.js 16 con App Router — frontend y API en un único proyecto
- **UI:** React + Tailwind CSS 4 + shadcn/ui (sin Ant Design, sin Zustand, sin TanStack Query)
- **Base de datos:** PostgreSQL 15 con Prisma ORM (UUID como PK en todas las tablas, soft delete universal)
- **Auth:** NextAuth.js v5 (beta) con sesiones en cookie httpOnly (sin JWT expuesto, sin Redis, sin refresh tokens)
- **Despliegue:** Railway (PaaS) — sin Docker Compose, sin Nginx
- **Sin Redis, sin BullMQ** en v1.0

## Comandos frecuentes

```bash
npm run dev           # Servidor de desarrollo (Turbopack, puerto 3000)
npm run build         # Build de producción
npm run typecheck     # Verificación de tipos TypeScript
npm run lint          # ESLint
npm run lint:fix      # ESLint con autofix
npm run format        # Prettier (auto-formato)
npm run format:check  # Prettier (solo verificación)
npm run db:generate   # Regenerar cliente Prisma
npm run db:migrate    # Crear y aplicar migración (desarrollo)
npm run db:studio     # UI visual de la BD (Prisma Studio)
```

## Estructura del repositorio

```
prisma/schema.prisma            → Modelos y relaciones (fuente de verdad del schema)
src/app/(dashboard)/{ruta}/     → Páginas protegidas (Server Components)
src/app/api/{recurso}/          → Route Handlers
src/server/actions/             → Server Actions (mutaciones)
src/server/queries/             → Funciones de lectura server-side
src/server/services/            → Lógica de negocio
src/components/ui/              → Componentes shadcn/ui (código propio)
src/lib/prisma.ts               → Singleton Prisma Client
src/lib/auth.ts                 → Configuración NextAuth.js
src/proxy.ts                    → Protección de rutas por sesión y rol (Next.js 16: proxy.ts no middleware.ts)
src/types/index.ts              → Tipos TypeScript compartidos
src/types/next-auth.d.ts        → Extensión de tipos de NextAuth (role en Session)
src/config/index.ts             → Constantes de configuración (rutas, auth, paginación)
src/hooks/                      → Custom hooks de React
```

## Nota sobre Next.js 16

En Next.js 16, la convención de archivo `middleware.ts` fue renombrada a `proxy.ts`. El archivo de protección de rutas está en `src/proxy.ts`, no en `src/middleware.ts`. Actualizar toda la documentación cuando se referencie middleware.

## Documentación de referencia

Antes de implementar cualquier funcionalidad, leer:

- `ESPECIFICACION_FUNCIONAL.md` — reglas de negocio, módulos, flujos, casos de uso
- `ESPECIFICACION_TECNICA.md` — decisiones de stack, seguridad, API conventions, estructura de directorios
- `ARQUITECTURA.md` — ADRs, flujo de seguridad, arquitectura de capas, decisiones documentadas
- `MODELO_BASE_DATOS.md` — tablas, columnas, índices, relaciones, enums
- `PLAN_DESARROLLO.md` — fases, sprints, criterios de aceptación

## Convenciones clave

- Los IDs son siempre UUID v4 (`@default(uuid())` en Prisma), nunca autoincrement.
- Soft delete en todas las entidades: campos `deletedAt` y `deletedBy` en el schema Prisma.
- Todas las fechas en UTC (`DateTime` en Prisma se almacena como TIMESTAMPTZ).
- Los montos monetarios tienen dos campos: moneda local + USD.
- Los endpoints de colección siempre paginan (máximo 100 por página).
- Los IDs expuestos en la API son UUIDs (nunca integers — evita enumeración).
- La tabla `audit_logs` es de solo inserción — nunca se modifica ni elimina.

## Reglas de negocio críticas (no obvias)

- Un activo no puede tener dos asignaciones activas simultáneamente (unique index donde `returnedAt IS NULL`).
- Los activos dados de baja nunca se eliminan físicamente, solo se archivan (soft delete).
- Al desactivar un usuario, el sistema debe alertar sobre sus activos asignados y requerir reasignación.
- La baja de un activo la ejecuta el Administrador TI directamente, con confirmación explícita y motivo obligatorio (no hay workflow de dos niveles).
- El número de serie es OBLIGATORIO en todo equipo. No existe equipo sin serie en la BD.

## Roles (exactamente dos, sin excepciones)

- `admin_ti` — control operativo total. Accede a todo.
- `usuario_final` — acceso restringido: solo sus equipos asignados, sus incidencias propias, su perfil, y firma del acta de resguardo.

## Seguridad (no negociable)

- Toda ruta protegida requiere sesión válida de NextAuth (excepto `/login`).
- La sesión contiene `{ userId, role }`. `src/proxy.ts` bloquea por rol. Las Server Actions y Route Handlers verifican adicionalmente con `requireOwnership()` cuando aplica.
- Validación de inputs con Zod en todos los Server Actions y Route Handlers.
- Ningún dato sensible en logs.

## Commits

Seguir Conventional Commits: `feat(assets): ...`, `fix(auth): ...`, `test(incidents): ...`
