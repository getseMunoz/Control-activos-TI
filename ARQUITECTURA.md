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
│  │  │  App Router (Pages)  │  │  Route Handlers / Actions │   │  │
│  │  │                     │  │                          │   │  │
│  │  │  Server Components   │  │  /api/assets             │   │  │
│  │  │  (render en server)  │  │  /api/assignments        │   │  │
│  │  │                     │  │  /api/incidents           │   │  │
│  │  │  Client Components   │  │  /api/reports            │   │  │
│  │  │  (interactividad)    │  │  /api/auth/[...nextauth] │   │  │
│  │  │                     │  │                          │   │  │
│  │  │  Tailwind CSS        │  │  Server Actions          │   │  │
│  │  │  shadcn/ui           │  │  (form submissions,      │   │  │
│  │  └─────────┬───────────┘  │   mutaciones directas)   │   │  │
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
│                  Service Functions                       │
│                                                         │
│  Funciones TypeScript puras que encapsulan las reglas   │
│  de negocio: validar serie única, verificar asignación  │
│  activa, ejecutar baja de activo, etc.                   │
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
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── assignments/page.tsx
│   │   │   ├── incidents/page.tsx
│   │   │   ├── maintenance/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── alerts/page.tsx
│   │   │   ├── audit/page.tsx     → Solo Administrador TI
│   │   │   ├── admin/
│   │   │   │   ├── users/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── api/                   → Route Handlers
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── assets/
│   │       │   ├── route.ts       → GET /api/assets, POST /api/assets
│   │       │   └── [id]/route.ts  → GET, PATCH, DELETE /api/assets/:id
│   │       ├── assignments/route.ts
│   │       ├── incidents/route.ts
│   │       ├── maintenance/route.ts
│   │       └── reports/[type]/route.ts
│   │
│   ├── components/
│   │   ├── ui/                    → Componentes shadcn/ui (auto-generados)
│   │   └── features/              → Componentes específicos de cada módulo
│   │       ├── assets/
│   │       ├── assignments/
│   │       └── ...
│   │
│   ├── server/
│   │   ├── actions/               → Server Actions (mutaciones)
│   │   │   ├── assets.actions.ts
│   │   │   ├── assignments.actions.ts
│   │   │   └── incidents.actions.ts
│   │   ├── queries/               → Funciones de lectura server-side
│   │   │   ├── assets.queries.ts
│   │   │   └── dashboard.queries.ts
│   │   └── services/              → Lógica de negocio reutilizable
│   │       ├── assets.service.ts
│   │       └── assignments.service.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts              → Singleton del Prisma Client
│   │   ├── auth.ts                → Configuración de NextAuth.js
│   │   └── utils.ts               → Utilidades comunes
│   │
│   ├── middleware.ts              → Protección de rutas y verificación de sesión
│   └── types/                    → Tipos TypeScript compartidos
│
├── public/                        → Archivos estáticos
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. ARQUITECTURA DE SEGURIDAD

### 5.1 Middleware de Protección de Rutas

El archivo `middleware.ts` se ejecuta en el Edge Runtime de Next.js antes de que cualquier página o Route Handler responda. Es la primera línea de defensa:

```
Petición entrante
      │
      ▼
middleware.ts
      │
      ├── ¿Es ruta pública? (/login) → Pasa sin verificación
      │
      ├── ¿Tiene sesión válida? (cookie de NextAuth)
      │       No → Redirect a /login
      │       Sí → Continúa
      │
      ├── ¿Es ruta de solo Administrador TI? (/audit, /admin/*, /assets/new, etc.)
      │       Rol = usuario_final → Redirect a /dashboard con mensaje 403
      │       Rol = admin_ti → Continúa
      │
      └── Permite la petición → Page o Route Handler
```

### 5.2 Autenticación con NextAuth.js

```
1. Usuario envía email + password → /login
2. NextAuth verifica credenciales contra la base de datos (Prisma)
3. Genera sesión firmada almacenada en una cookie httpOnly:
   - Nombre: __Secure-next-auth.session-token
   - Atributos: HttpOnly · Secure · SameSite=Lax · Path=/
   - Contenido: { userId, role, name, email } — firmado con NEXTAUTH_SECRET
4. No hay tokens JWT expuestos al cliente. No hay Redis.
   La sesión se valida en cada petición leyendo y verificando la cookie.

Acceso a la sesión en el servidor:
   Server Component → import { getServerSession } from "next-auth"
   Route Handler     → import { getServerSession } from "next-auth"
   Server Action     → import { getServerSession } from "next-auth"

En logout:
   NextAuth invalida la cookie. No requiere operación en base de datos.
```

### 5.3 Autorización por Rol y Propiedad

La verificación de autorización ocurre en **dos niveles**:

**Nivel 1 — Middleware (antes de llegar al código):**
- Bloquea acceso a rutas completas según el rol.
- Usuario Final no puede ni siquiera acceder a `/audit` o `/admin`.

**Nivel 2 — Servidor (dentro de cada acción o handler):**
- Verifica que el usuario tenga derecho sobre el recurso específico.
- Funciones helper reutilizables en `lib/auth.ts`:

```typescript
// Lanza error 403 si el usuario no es admin_ti
async function requireAdminTI(session: Session): Promise<void>

// Lanza error 403 si usuario_final intenta acceder
// a un recurso que no le pertenece
async function requireOwnership(session: Session, resourceOwnerId: string): Promise<void>
```

Estas funciones se llaman al inicio de cada Server Action y Route Handler que manipule datos sensibles. La seguridad **no depende** de si el botón es visible en el frontend.

---

## 6. ARQUITECTURA DE DATOS

### 6.1 Estrategia de Identificadores

- Todos los registros usan **UUID v4** (`crypto.randomUUID()` de Node.js) como clave primaria.
- Definido en `schema.prisma` con `@default(uuid())`.
- Previene enumeración de recursos. Facilita migración futura.

### 6.2 Soft Delete (Eliminación Lógica)

Ningún registro se elimina físicamente. Todas las entidades tienen:

```prisma
deletedAt  DateTime?  // NULL = activo, fecha = eliminado lógicamente
deletedBy  String?    // UUID del usuario que eliminó
```

Las queries de Prisma incluyen `where: { deletedAt: null }` en todas las consultas de listado. Se crea un helper `withSoftDelete()` para estandarizar esto.

### 6.3 Auditoría de Cambios

Tabla `audit_logs` de solo inserción. Se escribe desde el servidor después de cada operación significativa:

```
audit_logs
├── id          String  @id @default(uuid())
├── entity      String  (nombre de la tabla: "assets", "assignments", etc.)
├── entityId    String  (UUID del registro afectado)
├── action      String  (CREATE | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT)
├── oldValues   Json?   (estado anterior, null para CREATE)
├── newValues   Json?   (estado nuevo, null para DELETE)
├── userId      String
├── userEmail   String  (desnormalizado para persistencia histórica)
├── ipAddress   String
├── userAgent   String?
└── createdAt   DateTime @default(now())
```

La tabla es simple y plana — **sin particionamiento**. Para la escala de CIPRIJAL v1.0, una tabla estándar con índices en `entityId` y `createdAt` es suficiente.

---

## 7. ARQUITECTURA DEL FRONTEND

### 7.1 Routing (Next.js App Router)

```
/                           → Redirect a /dashboard
/login                      → Pública — inicio de sesión
/dashboard                  → Panel principal con KPIs
/assets                     → Listado de activos (solo admin_ti ve botón "Nuevo")
/assets/new                 → Registrar nuevo activo (solo admin_ti)
/assets/[id]                → Detalle: info, historial, documentos, mantenimiento
/assets/[id]/edit           → Editar activo (solo admin_ti)
/assignments                → Gestión de asignaciones
/incidents                  → Incidencias (admin_ti ve todas; usuario_final solo las suyas)
/maintenance                → Órdenes de trabajo
/maintenance/[id]           → Detalle de orden de trabajo
/reports                    → Centro de reportes
/alerts                     → Panel de alertas activas
/audit                      → Log de auditoría (solo admin_ti)
/admin/users                → Gestión de usuarios (solo admin_ti)
/admin/settings             → Configuración del sistema (solo admin_ti)
/profile                    → Perfil del usuario autenticado
```

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
        ├── getServerSession() → verifica autenticación
        ├── requireAdminTI()   → verifica autorización
        ├── validar inputs     → zod schema
        ├── service.createAsset() → reglas de negocio
        │       └── prisma.asset.create()
        ├── writeAuditLog()
        ├── revalidatePath("/assets")
        └── return { success: true } | { error: "..." }
        │
        ▼
Client Component actualiza UI según resultado
```

### 7.4 Sistema de Diseño

- **Tailwind CSS**: estilos utility-first. Sin CSS personalizado salvo casos puntuales.
- **shadcn/ui**: componentes de UI copiados al repositorio (`/components/ui/`). No es una dependencia de npm — el código es propio. Incluye: Table, Form, Dialog, Button, Input, Select, Badge, Card, Tabs, Dropdown, Calendar, Toast.
- **Recharts**: gráficas del dashboard (línea de tiempo de activos, distribución por tipo, incidencias por mes).

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

### 8.2 Entorno de Producción — Railway

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
│  │  - NEXTAUTH_SECRET      │   └──────────────────────────┘  │
│  │  - NEXTAUTH_URL         │                                  │
│  │  - SMTP_*               │                                  │
│  └─────────────────────────┘                                  │
│                                                               │
│  SSL automático · Dominio custom · Escala automática          │
└───────────────────────────────────────────────────────────────┘
```

**Flujo de despliegue:**
1. Push a la rama `main` en GitHub.
2. Railway detecta el cambio y dispara el build automáticamente.
3. Build: `npm run build` (Next.js compila y optimiza).
4. Pre-deploy: `npx prisma migrate deploy` (aplica migraciones pendientes).
5. Railway reemplaza la instancia anterior con la nueva (zero-downtime).
6. No hay Nginx, no hay Docker Compose, no hay configuración de servidor.

---

## 9. FLUJO DE CI/CD

```
Developer push a rama feature/*
        │
        ▼
GitHub Actions — CI Pipeline (en cada PR)
├── npm ci
├── npx prisma generate
├── npx tsc --noEmit          → Verificación de tipos
├── npx eslint src/           → Lint
├── npm test                  → Tests unitarios (Jest / Vitest)
└── npm run build             → Verifica que compila sin errores

        │ PR aprobado y mergeado a main
        ▼
Railway — Deploy Automático
├── Build de producción (Next.js)
├── prisma migrate deploy
└── Swap de instancia (zero-downtime)
```

No hay Docker Hub, no hay registro de imágenes, no hay aprobación manual de deploy para v1.0. El flujo es: merge a `main` → Railway despliega. Simple y sin fricción para un equipo pequeño.

---

## 10. DECISIONES ARQUITECTÓNICAS DOCUMENTADAS (ADR)

### ADR-001: Next.js Full-Stack en lugar de SPA + API separada
- **Decisión:** Un único proyecto Next.js con App Router para todo: frontend, API y lógica de servidor.
- **Razón:** Elimina la complejidad de mantener dos proyectos separados, dos builds y la gestión de CORS. Los tipos TypeScript se comparten nativamente. Los Server Components y Server Actions permiten ejecutar código de servidor directamente desde la capa de presentación sin capa HTTP intermedia.
- **Consecuencias:** El equipo necesita entender el modelo de renderizado de Next.js (Server vs. Client Components). El acoplamiento entre UI y servidor es mayor, lo cual es aceptable para un sistema interno de esta escala.

### ADR-002: PostgreSQL + Prisma ORM
- **Decisión:** PostgreSQL 15 como base de datos, Prisma ORM para acceso a datos.
- **Razón:** PostgreSQL es la única base de datos que cubre todos los requisitos: datos relacionales complejos, soporte JSONB para especificaciones técnicas de activos, robustez para auditoría. Prisma genera tipos TypeScript automáticamente desde el schema, elimina errores en tiempo de ejecución y tiene un DX superior a alternativas como TypeORM para este stack.
- **Consecuencias:** El schema de la BD es la fuente de verdad para los tipos del servidor. Cambios de schema requieren `prisma migrate` — proceso controlado y reversible.

### ADR-003: UUID como clave primaria en todas las tablas
- **Decisión:** UUID v4 para todas las claves primarias, generado con `@default(uuid())` en Prisma.
- **Razón:** Previene enumeración de recursos por parte de usuarios malintencionados. Los códigos de negocio (ej: HW-2026-001) son campos adicionales separados.
- **Consecuencias:** Índices ligeramente más grandes que con integers. El impacto es negligible para la escala de CIPRIJAL.

### ADR-004: NextAuth.js con sesiones en cookie en lugar de JWT + Redis
- **Decisión:** NextAuth.js (Auth.js) con sesiones basadas en cookies httpOnly firmadas.
- **Razón:** Elimina la dependencia de Redis para gestión de sesiones. Las cookies httpOnly son el mecanismo más seguro para aplicaciones web — no son accesibles desde JavaScript del cliente. La sesión contiene `{ userId, role }` firmada con `NEXTAUTH_SECRET`. NextAuth se integra nativamente con Next.js sin configuración adicional.
- **Consecuencias:** Las sesiones no son "stateless" en el sentido JWT clásico, pero tampoco requieren una base de datos de sesiones — NextAuth puede operar con una cookie firmada sin backend de sesiones para v1.0. El logout es inmediato (la cookie se elimina).

### ADR-005: Railway como plataforma de despliegue en lugar de Docker + Nginx
- **Decisión:** Despliegue directo en Railway (PaaS) conectado a GitHub.
- **Razón:** Para un equipo pequeño, gestionar Nginx, Docker Compose y certificados SSL manualmente añade overhead operacional que no aporta valor de negocio. Railway abstrae toda esa infraestructura: detecta Next.js automáticamente, gestiona SSL, provee PostgreSQL administrado con backups y permite deploys automáticos en cada push a `main`.
- **Consecuencias:** Dependencia de un proveedor PaaS (vendor lock-in moderado). Si en el futuro se necesita mayor control de infraestructura, la migración a un VPS con Docker es directa — el proyecto Next.js no tiene dependencias específicas de Railway.

### ADR-006: shadcn/ui + Tailwind CSS en lugar de Ant Design
- **Decisión:** Tailwind CSS como sistema de estilos, shadcn/ui como biblioteca de componentes.
- **Razón:** Los componentes de shadcn/ui viven en el repositorio del proyecto (`/components/ui/`) — son código propio, modificable sin restricciones. Tailwind produce bundles CSS mínimos (solo las clases usadas). La combinación es el estándar de facto para proyectos Next.js en 2026 y tiene soporte nativo para React Server Components, algo que Ant Design no garantiza completamente.
- **Consecuencias:** Algunos componentes enterprise complejos (tablas avanzadas, selectores de fecha de rango) requieren instalación puntual vía `npx shadcn add`. La personalización visual es total, sin tema global impuesto.

### ADR-007: Sin Redis ni colas de trabajo en v1.0
- **Decisión:** No se usa Redis ni ninguna cola de trabajos en background para v1.0.
- **Razón:** Las operaciones que típicamente van a una cola (envío de emails, generación de reportes) se ejecutan de forma síncrona en los Route Handlers para v1.0. El volumen de CIPRIJAL no justifica la complejidad operacional de BullMQ + Redis.
- **Consecuencias:** Los endpoints de generación de reportes pesados pueden tardar más en responder. Se mitiga con un timeout generoso y un indicador de "generando..." en el frontend. Si el volumen crece, se puede añadir una solución de colas sin modificar la lógica de negocio.
