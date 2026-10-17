# ARQUITECTURA DEL SISTEMA
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 2.0
**Fecha:** 2026-06-25
**Estado:** Definitivo — stack aprobado

---

## 1. ESTILO ARQUITECTÓNICO

### Decisión: Full-Stack Monolito con Next.js App Router

Se adopta una arquitectura **full-stack unificada** utilizando Next.js como único framework. El frontend, las APIs y la lógica de negocio del servidor conviven en un mismo repositorio y proceso de despliegue.

| Criterio | SPA + API separada (React + NestJS) | Full-Stack Next.js | Ganador |
|---|---|---|---|
| Repositorios y procesos | Dos (frontend + backend independientes) | Uno | Next.js |
| Complejidad operacional | Alta (dos builds, dos deploys, CORS) | Baja (un deploy) | Next.js |
| Tiempo de arranque | Mayor | Menor | Next.js |
| Compartir tipos TypeScript | Difícil (requiere monorepo o paquetes) | Nativo | Next.js |
| Llamadas a DB desde el servidor | Sí, pero con capa HTTP intermedia | Directo (sin red interna) | Next.js |
| Curva de aprendizaje del equipo | Alta (dos frameworks distintos) | Moderada (un framework) | Next.js |
| Adecuado para este proyecto | No (overhead innecesario) | Sí | Next.js |

**Principio rector:** Todo el sistema vive en un único proyecto Next.js. Las páginas son React Server Components por defecto. La lógica de servidor se expresa como Server Actions (mutaciones) o Route Handlers (endpoints HTTP cuando se necesita). La base de datos se accede únicamente desde el servidor, nunca desde el cliente.

---

## 2. VISIÓN DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────┐
│                          USUARIOS                                │
│         Administrador TI          |        Usuario Final         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY (PaaS)                                 │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               NEXT.JS APP (único proceso)                  │  │
│  │                                                           │  │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐   │  │
│  │  │  App Router (Pages)  │  │  Server Actions / Queries │   │  │
│  │  │                     │  │                          │   │  │
│  │  │  Server Components   │  │  Server Actions          │   │  │
│  │  │  (render en server)  │  │  (mutaciones: crear/     │   │  │
│  │  │                     │  │   editar/firmar/etc.)    │   │  │
│  │  │  Client Components   │  │  Server Queries          │   │  │
│  │  │  (interactividad)    │  │  (lecturas server-side)   │   │  │
│  │  │                     │  │                          │   │  │
│  │  │  Tailwind CSS        │  │  Route Handlers:          │   │  │
│  │  │  shadcn/ui           │  │  /api/auth/[...nextauth] │   │  │
│  │  └─────────┬───────────┘  │  + exportación CSV        │   │  │
│  │            │              └──────────┬───────────────┘   │  │
│  │            └─────────────────────────┤                   │  │
│  │                                      │ Prisma Client     │  │
│  └──────────────────────────────────────┼───────────────────┘  │
│                                         │                        │
│  ┌──────────────────────────────────────▼───────────────────┐  │
│  │              PostgreSQL (administrado por Railway)         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. ARQUITECTURA DE CAPAS

En Next.js App Router, las capas se organizan por responsabilidad dentro de un único proceso:

```
┌─────────────────────────────────────────────────────────┐
│               CAPA DE PRESENTACIÓN                       │
│         Server Components + Client Components            │
│                                                         │
│  Server Components: renderizan en el servidor, acceden  │
│  directamente a queries de servidor sin pasar por HTTP. │
│  Client Components: interactividad, formularios, modals │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│               CAPA DE ACCESO AL SERVIDOR                 │
│        Server Actions · Route Handlers · Queries         │
│                                                         │
│  Server Actions: mutaciones desde formularios y botones  │
│  Route Handlers: endpoints REST para lógica más compleja │
│  Server Queries: funciones de lectura reutilizables      │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│               CAPA DE LÓGICA DE NEGOCIO                  │
│                                                         │
│  Las reglas de negocio (serie única, asignación activa,  │
│  baja de activo, etc.) viven hoy directamente dentro de  │
│  cada Server Action en `src/server/actions/`.            │
│  La carpeta `src/server/services/` existe en el proyecto │
│  pero está vacía — reservada para si en el futuro se     │
│  necesita extraer lógica compleja reutilizable.          │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│               CAPA DE DATOS                              │
│                   Prisma ORM                             │
│                                                         │
│  Acceso a PostgreSQL via Prisma Client.                  │
│  Migrations con `prisma migrate`.                        │
│  Schema tipado: todos los modelos definidos en           │
│  schema.prisma generan tipos TypeScript automáticamente. │
└─────────────────────────────────────────────────────────┘
```

---

## 4. ESTRUCTURA DE DIRECTORIOS

```
ciprijal-activos-ti/
├── prisma/
│   ├── schema.prisma              → Modelos de datos y relaciones
│   └── migrations/                → Histórico de migraciones de BD
│
├── src/
│   ├── app/                       → Next.js App Router
│   │   ├── layout.tsx             → Layout raíz (HTML, fuentes)
│   │   ├── (auth)/
│   │   │   └── login/page.tsx     → Página pública de inicio de sesión
│   │   ├── (dashboard)/           → Grupo de rutas protegidas
│   │   │   ├── layout.tsx         → Layout con sidebar + verificación de sesión
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── assets/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── export/route.ts          → Exportación CSV de activos
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── edit/page.tsx
│   │   │   │       ├── incidents/           → Incidencias del activo
│   │   │   │       ├── maintenance/         → Órdenes de mantenimiento del activo
│   │   │   │       └── expenses/            → Gastos del activo
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── export/route.ts          → Exportación CSV de asignaciones
│   │   │   │   └── [id]/
│   │   │   │       ├── receipt/page.tsx     → Responsiva de entrega (HTML imprimible)
│   │   │   │       ├── return/page.tsx      → Registrar devolución (solo admin_ti)
│   │   │   │       └── return-receipt/page.tsx → Responsiva de devolución
│   │   │   ├── reports/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── users/
│   │   │   │   ├── locations/
│   │   │   │   └── asset-types/
│   │   │   ├── my-assets/                   → Portal usuario_final
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [assetId]/incidents/new/page.tsx
│   │   │   │   └── assignments/[assignmentId]/sign/page.tsx → Firma de recepción
│   │   │   └── help/page.tsx
│   │   │
│   │   │   (alerts/, audit/, profile/, incidents/ e maintenance/ de nivel superior
│   │   │    existen como carpetas reservadas, sin page.tsx — no son rutas activas)
│   │   │
│   │   └── api/                   → Route Handlers
│   │       └── auth/[...nextauth]/route.ts  → Único endpoint HTTP de negocio;
│   │                                           el resto del CRUD es Server Actions
│   │
│   ├── components/
│   │   ├── ui/                    → Componentes shadcn/ui (código propio)
│   │   └── features/              → Componentes específicos de cada módulo
│   │       ├── assets/
│   │       ├── assignments/
│   │       ├── incidents/
│   │       ├── maintenance/
│   │       ├── asset-expenses/
│   │       ├── asset-types/
│   │       ├── locations/
│   │       └── users/
│   │
│   ├── server/
│   │   ├── actions/               → Server Actions (mutaciones)
│   │   │   ├── assets.actions.ts
│   │   │   ├── assignments.actions.ts
│   │   │   ├── incidents.actions.ts
│   │   │   ├── maintenance.actions.ts
│   │   │   ├── users.actions.ts
│   │   │   └── ... (una por módulo de negocio)
│   │   ├── queries/               → Funciones de lectura server-side
│   │   │   ├── assets.queries.ts
│   │   │   ├── dashboard.queries.ts
│   │   │   ├── reports.queries.ts
│   │   │   └── ...
│   │   └── services/              → Existe, pero vacía en el estado actual
│   │
│   ├── lib/
│   │   ├── prisma.ts              → Singleton del Prisma Client
│   │   ├── auth.ts                → Configuración de NextAuth.js v5 (export `auth()`)
│   │   └── utils.ts               → Utilidades comunes
│   │
│   ├── proxy.ts                   → Protección de rutas por sesión y rol
│   │                                 (en Next.js 16 reemplaza a `middleware.ts`)
│   └── types/                    → Tipos TypeScript compartidos
│
├── public/                        → Archivos estáticos
├── next.config.ts
├── tsconfig.json
└── package.json
```

> Nota: Tailwind CSS v4 no usa `tailwind.config.ts` — la configuración de tema vive en `src/app/globals.css` mediante `@theme inline`.

---

## 5. ARQUITECTURA DE SEGURIDAD

### 5.1 Proxy de Protección de Rutas

El archivo `src/proxy.ts` (en Next.js 16 reemplaza al antiguo `middleware.ts`) se ejecuta antes de que cualquier página responda. Es la primera línea de defensa:

```
Petición entrante
      │
      ▼
src/proxy.ts
      │
      ├── ¿Es ruta pública? (/login) → Pasa sin verificación
      │
      ├── ¿Tiene sesión válida? (cookie de NextAuth)
      │       No → Redirect a /login
      │       Sí → Continúa
      │
      ├── ¿Es ruta de solo Administrador TI? (/audit, /admin, /assets, /assignments,
      │     /reports, /alerts, /dashboard — excepto /assignments/[id]/receipt y
      │     /assignments/[id]/return-receipt, accesibles a cualquier autenticado)
      │       Rol = usuario_final → Redirect a /my-assets
      │       Rol = admin_ti → Continúa
      │
      └── Permite la petición → Page
```

### 5.2 Autenticación con NextAuth.js

```
1. Usuario envía email + password → /login
2. NextAuth (Credentials provider) verifica contra la base de datos (Prisma + bcrypt)
3. Genera una sesión JWT firmada almacenada en una cookie httpOnly
   (nombre y atributos exactos los gestiona NextAuth v5 según HTTPS/entorno)
   - Contenido de la sesión de aplicación: { id, email, name, role } — ver
     src/types/next-auth.d.ts y el callback `session()` en src/lib/auth.ts
4. No hay tokens expuestos al cliente. No hay Redis.
   La sesión se valida en cada petición leyendo y verificando la cookie.

Acceso a la sesión en el servidor (NextAuth v5 / Auth.js):
   Server Component → import { auth } from "@/lib/auth"; await auth()
   Server Action     → import { auth } from "@/lib/auth"; await auth()
   (NextAuth v5 ya no usa `getServerSession`, esa es la API de v4)

En logout:
   NextAuth invalida la cookie. No requiere operación en base de datos.
```

### 5.3 Autorización por Rol y Propiedad

La verificación de autorización ocurre en **dos niveles**:

**Nivel 1 — `src/proxy.ts` (antes de llegar al código de la página):**
- Bloquea acceso a rutas completas según el rol.
- Usuario Final no puede ni siquiera acceder a `/audit`, `/admin`, `/assets`, etc.

**Nivel 2 — Servidor (dentro de cada Server Action o página):**
- Verifica que el usuario tenga derecho sobre el recurso específico.
- Los únicos dos helpers reutilizables en `src/lib/auth.ts` son:

```typescript
// Lanza error si no hay sesión o el usuario no es admin_ti
async function requireAdminTI(): Promise<{ id, email, role }>

// Lanza error si no hay sesión válida
async function requireAuthenticatedUser(): Promise<{ id, email, role }>
```

No existe un helper `requireOwnership()` genérico. La verificación de que un recurso pertenece al usuario autenticado se hace de forma explícita dentro de cada Server Action o página, comparando el `id` de sesión contra el dueño del registro — por ejemplo, en `signDeliveryAction` (`src/server/actions/assignments.actions.ts`): `if (assignment.userId !== sessionUser.id) return { success: false, ... }`. Estas verificaciones se hacen al inicio de cada Server Action que manipule datos sensibles. La seguridad **no depende** de si el botón es visible en el frontend.

Todos los Server Actions validan sus datos de entrada con esquemas de Zod antes de tocar la base de datos — es una convención consistente en todo `src/server/actions/`, no solo en los módulos sensibles.

---

## 6. ARQUITECTURA DE DATOS

### 6.1 Estrategia de Identificadores

- Todos los registros usan **UUID v4** (`crypto.randomUUID()` de Node.js) como clave primaria.
- Definido en `schema.prisma` con `@default(uuid())`.
- Previene enumeración de recursos. Facilita migración futura.

### 6.2 Soft Delete (Eliminación Lógica)

El soft delete **no es universal** — se aplica según el tipo de entidad:

- **Con `deletedAt` + `deletedBy`:** `Asset`, `AssetCredential`.
- **Solo con `deletedAt`:** `User`, `Location`.
- **Con bandera `isActive` (sin `deletedAt`):** `AssetType`, `Document`.
- **Sin ningún mecanismo de borrado lógico (registros históricos inmutables):** `AssetAssignment`, `AssetExpense`, `Incident`, `MaintenanceOrder`, `MaintenanceSchedule`, `AuditLog`, `AssetTechnicalInfo`. Estas tablas no se editan ni se marcan como inactivas — son historial permanente.

Las queries de Prisma sobre entidades con `deletedAt` incluyen `where: { deletedAt: null }` en los listados. No existe actualmente un helper compartido tipo `withSoftDelete()` — el filtro se repite explícitamente en cada query.

### 6.3 Auditoría de Cambios

El modelo `AuditLog` existe en `prisma/schema.prisma` como tabla de solo inserción, con los campos `entity`, `entityId`, `action`, `oldValues`, `newValues`, `userId`, `userEmail`, `userRole`, `ipAddress`, `userAgent`, `createdAt`.

**Estado actual: el modelo existe, pero ninguna Server Action escribe en él todavía.** No hay una función `writeAuditLog()` ni invocaciones a `prisma.auditLog.create()` en el código. La escritura activa de auditoría es trabajo pendiente, no funcionalidad entregada.

---

## 7. ARQUITECTURA DEL FRONTEND

### 7.1 Routing (Next.js App Router)

```
/                                            → Redirect según rol (admin_ti → /dashboard, usuario_final → /my-assets)
/login                                       → Pública — inicio de sesión
/dashboard                                   → Panel principal (admin_ti)
/assets, /assets/new, /assets/[id](/edit)    → Inventario de activos (admin_ti)
/assets/[id]/incidents, /maintenance, /expenses → Historial anidado por activo (admin_ti)
/assets/export                               → Exportación CSV de activos (admin_ti)
/assignments, /assignments/new               → Gestión de asignaciones (admin_ti)
/assignments/[id]/receipt                    → Responsiva de entrega (admin_ti + usuario_final propietario)
/assignments/[id]/return                     → Registrar devolución, firmada por el admin que recibe (admin_ti)
/assignments/[id]/return-receipt             → Responsiva de devolución (admin_ti + usuario_final propietario)
/assignments/export                          → Exportación CSV de asignaciones (admin_ti)
/reports                                     → Dashboard de reportes (admin_ti)
/admin/users, /admin/locations, /admin/asset-types → Catálogos y usuarios (admin_ti)
/my-assets                                   → Portal del usuario_final: sus equipos, firma pendiente, incidencias
/my-assets/[assetId]/incidents/new           → Reportar falla (usuario_final)
/my-assets/assignments/[assignmentId]/sign   → Firmar recepción del propio equipo (usuario_final)
/help                                        → Guía rápida interna (cualquier rol)
```

Las carpetas `/alerts`, `/audit`, `/profile`, `/incidents` y `/maintenance` (de nivel superior) existen en `src/app/(dashboard)/` pero están vacías, sin `page.tsx` — no son rutas activas hoy.

### 7.2 Modelo de Renderizado

```
┌───────────────────────────────────────────────────────┐
│             SERVER COMPONENTS (por defecto)            │
│                                                       │
│  - Acceden directamente a Prisma o a server queries   │
│  - No tienen estado, no usan hooks                    │
│  - No generan JavaScript en el cliente                │
│  - Renderizan la UI inicial y los datos de la página  │
│                                                       │
│  Ejemplo: página de listado de activos carga los      │
│  datos en el servidor y los renderiza como HTML.       │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│             CLIENT COMPONENTS ("use client")           │
│                                                       │
│  - Solo cuando se necesita interactividad             │
│  - Formularios controlados                            │
│  - Modales, drawers, menús desplegables               │
│  - Filtros y búsqueda en tiempo real                  │
│  - Tablas con ordenamiento local                      │
└───────────────────────────────────────────────────────┘
```

### 7.3 Patrón de Mutaciones con Server Actions

```
Usuario hace clic en "Guardar"
        │
        ▼
Client Component (formulario)
        │ llama Server Action
        ▼
server/actions/assets.actions.ts
        │
        ├── auth() / requireAdminTI() → verifica autenticación y rol
        ├── validar inputs     → zod schema
        ├── reglas de negocio inline (serie única, estado válido, etc.)
        │       └── prisma.asset.create()
        ├── revalidatePath("/assets")
        └── return { success: true } | { success: false, error: "..." }
        │
        ▼
Client Component actualiza UI según resultado
```

> Nota: el paso de auditoría (`writeAuditLog()`) no está implementado todavía — ver §6.3.

### 7.4 Sistema de Diseño

- **Tailwind CSS**: estilos utility-first. Sin CSS personalizado salvo casos puntuales.
- **shadcn/ui**: componentes de UI copiados al repositorio (`/components/ui/`, estilo `base-nova` sobre `@base-ui/react`). No es una dependencia de npm — el código es propio.
- El dashboard y los reportes actuales (`getReportsSummary()`) se presentan como contadores y tablas HTML; no se usa ninguna librería de gráficas (Recharts no está instalada en el proyecto).

---

## 8. ARQUITECTURA DE DESPLIEGUE

### 8.1 Entorno de Desarrollo (Local)

```
Requisitos:
├── Node.js 20 LTS
├── PostgreSQL 15+ local (o Docker: docker run postgres:15)
└── Variables de entorno en .env.local

Comandos:
├── npm run dev          → Next.js dev server (puerto 3000)
├── npx prisma migrate dev → Aplica migraciones en BD local
├── npx prisma studio    → UI visual de la BD en desarrollo
└── npx prisma generate  → Regenera tipos TypeScript del schema
```

### 8.2 Entorno de Producción — Railway (previsto)

> **Estado actual:** el despliegue en Railway es el entorno **previsto**, no un hecho consumado. Aún no se ha desplegado a producción; el momento y la decisión final de despliegue quedan sujetos a la empresa. Lo que sigue describe el plan, no el estado actual del sistema.

```
┌───────────────────────────────────────────────────────────────┐
│                        RAILWAY (PaaS)                          │
│                                                               │
│  ┌─────────────────────────┐   ┌──────────────────────────┐  │
│  │   Next.js Application   │   │  PostgreSQL (managed)     │  │
│  │                         │   │                          │  │
│  │  Build automático desde │   │  Administrado por Railway │  │
│  │  repositorio GitHub     │   │  Backups automáticos      │  │
│  │                         │   │  DATABASE_URL inyectada   │  │
│  │  Variables de entorno:  │   │  como variable de entorno │  │
│  │  - DATABASE_URL         │◄──┤                          │  │
│  │  - AUTH_SECRET          │   └──────────────────────────┘  │
│  │  - AUTH_URL             │                                  │
│  │  - SMTP_* (reservadas,  │                                  │
│  │    sin uso en v1.0)     │                                  │
│  └─────────────────────────┘                                  │
│                                                               │
│  SSL automático · Dominio custom · Escala automática          │
└───────────────────────────────────────────────────────────────┘
```

**Flujo de despliegue previsto (pendiente de ejecutar):**
1. Push a la rama `main` en GitHub.
2. Railway detecta el cambio y dispara el build automáticamente.
3. Build: `npm run build` (Next.js compila y optimiza).
4. Pre-deploy: `npm run db:migrate:deploy` (aplica migraciones pendientes).
5. Railway reemplaza la instancia anterior con la nueva (zero-downtime).
6. No hay Nginx, no hay Docker Compose, no hay configuración de servidor.

---

## 9. FLUJO DE CI/CD

```
Developer push / PR a main o develop
        │
        ▼
GitHub Actions — CI Pipeline (.github/workflows/ci.yml)
├── npm ci
├── npx prisma generate
├── npm run typecheck         → tsc --noEmit
├── npm run lint               → eslint
├── npm run format:check       → prettier --check
└── npm run build

        │ (deploy a Railway: previsto, aún no ejecutado — ver §8.2)
```

No hay paso de tests automatizados en el pipeline (no hay Jest/Vitest instalado en el proyecto). No hay Docker Hub, no hay registro de imágenes. El CI actual verifica tipos, lint, formato y build; el deploy a Railway es un paso futuro, no configurado todavía.

---

## 10. DECISIONES ARQUITECTÓNICAS DOCUMENTADAS (ADR)

### ADR-001: Next.js Full-Stack en lugar de SPA + API separada
- **Decisión:** Un único proyecto Next.js con App Router para todo: frontend, API y lógica de servidor.
- **Razón:** Elimina la complejidad de mantener dos proyectos separados, dos builds y la gestión de CORS. Los tipos TypeScript se comparten nativamente. Los Server Components y Server Actions permiten ejecutar código de servidor directamente desde la capa de presentación sin capa HTTP intermedia.
- **Consecuencias:** El equipo necesita entender el modelo de renderizado de Next.js (Server vs. Client Components). El acoplamiento entre UI y servidor es mayor, lo cual es aceptable para un sistema interno de esta escala.

El resto de las decisiones de stack (PostgreSQL + Prisma, UUID como PK, NextAuth.js, Railway, shadcn/ui + Tailwind, sin Redis) están documentadas con su justificación y alternativas descartadas en `DECISIONES_TECNICAS.md` (DT-001 a DT-016) — no se repiten aquí para evitar mantener la misma información en dos archivos. El estado actual de correo/reportes está en DT-013: no hay envío de emails ni generación de PDF/Excel implementados en v1.0.
