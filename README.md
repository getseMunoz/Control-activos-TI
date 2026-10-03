# CIPRIJAL — Sistema de Gestión de Activos TI

Sistema empresarial para el control completo del hardware tecnológico de CIPRIJAL. Registra, asigna, mantiene y da de baja equipos con número de serie obligatorio, firma digital de actas de resguardo, gestión de incidencias y trazabilidad total.

---

## Requisitos previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Node.js | 20 LTS | Usa `.nvmrc` si tienes nvm instalado |
| npm | 10+ | Incluido con Node.js |
| PostgreSQL | 15+ | Local para desarrollo |
| Git | 2.x | Para control de versiones y Husky |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd ciprijal-activos-ti

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales locales
```

---

## Configuración del entorno

Copia `.env.example` como `.env` y completa los valores:

```env
# Base de datos PostgreSQL local
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/ciprijal_activos"

# NextAuth.js v5 — genera con: openssl rand -base64 32
# v5 usa AUTH_SECRET / AUTH_URL (acepta NEXTAUTH_SECRET / NEXTAUTH_URL por compatibilidad)
AUTH_SECRET="secreto-de-al-menos-32-caracteres"
AUTH_URL="http://localhost:3000"

# Seed — usuario administrador inicial
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

> **Nunca comitear `.env` al repositorio.** El `.gitignore` ya lo excluye.
>
> Las variables SMTP y STORAGE_PATH están reservadas para sprints futuros y no tienen implementación en v1.0.

---

## Cómo ejecutar el proyecto

```bash
# Desarrollo (con Turbopack)
npm run dev
# → http://localhost:3000

# Build de producción
npm run build

# Servidor de producción
npm run start
```

---

## Base de datos con Prisma

```bash
# Generar cliente Prisma (necesario después de cambios en schema.prisma)
npm run db:generate

# Crear y aplicar migración en desarrollo
npm run db:migrate
# Prisma pedirá un nombre para la migración, ej: "add_users_table"

# Aplicar migraciones pendientes en producción (sin crear nuevas)
npm run db:migrate:deploy

# Sembrar usuario administrador inicial (requiere SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en .env)
npm run db:seed

# Abrir UI visual de la base de datos
npm run db:studio
# → http://localhost:5555

# Sincronizar schema sin migración (solo para prototipado, no usar en producción)
npm run db:push
```

> El archivo `prisma/schema.prisma` es la **fuente de verdad** del schema. Todo cambio en la BD se hace ahí primero.

---

## Calidad del código

```bash
# TypeScript — verificar tipos sin compilar
npm run typecheck

# ESLint — análisis estático
npm run lint

# ESLint — corrección automática
npm run lint:fix

# Prettier — verificar formato
npm run format:check

# Prettier — aplicar formato
npm run format
```

Husky ejecuta automáticamente `lint-staged` antes de cada `git commit`, lo que corre ESLint y Prettier sobre los archivos modificados.

---

## Estructura del proyecto

```
ciprijal-activos-ti/
├── prisma/
│   ├── schema.prisma          → Modelos de datos (fuente de verdad)
│   └── migrations/            → Historial de migraciones (se comitean)
│
├── src/
│   ├── app/                   → Next.js App Router
│   │   ├── (auth)/login/      → Página pública de login
│   │   ├── (dashboard)/       → Rutas protegidas (requieren sesión)
│   │   │   ├── layout.tsx     → Layout con sidebar y verificación de sesión
│   │   │   ├── dashboard/     → Panel principal con KPIs y alertas operativas
│   │   │   ├── assets/        → Inventario de activos
│   │   │   │   ├── [id]/incidents/    → Incidencias del activo
│   │   │   │   ├── [id]/maintenance/  → Órdenes de mantenimiento del activo
│   │   │   │   └── [id]/expenses/     → Gastos del activo
│   │   │   ├── assignments/   → Asignaciones, responsivas y devoluciones
│   │   │   ├── reports/       → Reportes operativos
│   │   │   ├── admin/         → Administración: usuarios, ubicaciones, tipos de activo
│   │   │   ├── my-assets/     → Portal usuario final
│   │   │   └── help/          → Guía rápida interna
│   │   ├── api/               → Route Handlers (endpoints HTTP)
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx         → Layout raíz (HTML, fuentes, metadatos)
│   │   ├── globals.css        → Estilos globales y tema CIPRIJAL
│   │   └── page.tsx           → Redirige a /dashboard
│   │
│   ├── components/
│   │   ├── ui/                → Componentes shadcn/ui (código propio)
│   │   └── features/          → Componentes por módulo de negocio
│   │       ├── assets/
│   │       ├── assignments/
│   │       ├── incidents/
│   │       └── maintenance/
│   │
│   ├── server/
│   │   ├── actions/           → Server Actions (mutaciones de formularios)
│   │   ├── queries/           → Funciones de lectura server-side
│   │   └── services/          → Lógica de negocio reutilizable
│   │
│   ├── lib/
│   │   ├── prisma.ts          → Singleton del cliente Prisma
│   │   ├── auth.ts            → Configuración de NextAuth.js
│   │   └── utils.ts           → Utilidades comunes (cn(), etc.)
│   │
│   ├── proxy.ts               → Protección de rutas por sesión y rol
│   ├── types/
│   │   ├── index.ts           → Tipos compartidos (Role, ActionResult, etc.)
│   │   └── next-auth.d.ts     → Extensión de tipos de NextAuth
│   ├── config/index.ts        → Constantes de configuración
│   └── hooks/                 → Custom hooks de React
│
├── public/                    → Archivos estáticos
├── .github/workflows/ci.yml   → Pipeline CI (typecheck + lint + build)
├── .env.example               → Plantilla de variables de entorno
├── next.config.ts             → Config de Next.js (headers de seguridad)
├── tsconfig.json              → TypeScript strict mode
├── eslint.config.mjs          → ESLint (flat config)
├── .prettierrc                → Prettier
└── prisma/schema.prisma       → Schema de la base de datos
```

---

## Convenciones del código

### Arquitectura de capas

```
Server Component (página)
  → Server Query  (src/server/queries/)   ← solo lectura
  → Server Action (src/server/actions/)   ← mutaciones
      → Service   (src/server/services/)  ← reglas de negocio
          → Prisma Client                 ← acceso a BD
```

### Reglas de TypeScript

- `strict: true` en `tsconfig.json`. Sin `any` implícitos.
- Toda mutación retorna `ActionResult<T>` para manejo uniforme de errores.
- Los tipos de los modelos de BD los genera Prisma automáticamente.

### Imports

Usa siempre el alias `@/` en lugar de rutas relativas:

```typescript
// ✅ Correcto
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

// ❌ Evitar
import { prisma } from '../../../lib/prisma'
```

### Nombres de archivos

| Tipo | Convención | Ejemplo |
|---|---|---|
| Páginas | `page.tsx` | `assets/page.tsx` |
| Layouts | `layout.tsx` | `(dashboard)/layout.tsx` |
| Server Actions | `*.actions.ts` | `assets.actions.ts` |
| Server Queries | `*.queries.ts` | `assets.queries.ts` |
| Services | `*.service.ts` | `assets.service.ts` |
| Hooks | `use-*.ts` | `use-media-query.ts` |
| Componentes UI | PascalCase | `AssetCard.tsx` |

### Seguridad

Toda mutación en Server Actions y Route Handlers debe verificar:

```typescript
const session = await auth()
if (!session) throw new Error('No autorizado')

// Para rutas exclusivas de admin_ti:
if (session.user.role !== 'admin_ti') throw new Error('Prohibido')

// Para recursos propios del usuario:
if (resource.userId !== session.user.id) throw new Error('Prohibido')
```

---

## Flujo de trabajo con Git

### Ramas

Actualmente el repositorio utiliza una sola rama principal:

```
main → Rama principal del proyecto. Contiene la versión funcional y documentada del sistema.
```

Si CIPRIJAL decide continuar el desarrollo del sistema, podrán crearse ramas adicionales de acuerdo con las necesidades del equipo.

### Mensajes de commit

Durante el desarrollo se utilizaron mensajes descriptivos para identificar los cambios realizados en cada avance. En algunos casos se emplearon prefijos como `feat:`, `docs:` o `chore:`, mientras que en otros se utilizaron mensajes directos en español.

```
agregar dashboard general
implementar incidencias por activo
feat: agregar firma digital en asignaciones
docs: actualizar documentacion tecnica
agregar informacion tecnica de activos
```

### CI antes de hacer merge

El pipeline en `.github/workflows/ci.yml` ejecuta automáticamente en cada PR:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run build`

Un PR con CI fallido no debe mergearse.

---

## Funcionalidades implementadas (v1.0)

- Autenticación por credenciales con NextAuth.js v5
- Dos roles: `admin_ti` (acceso total) y `usuario_final` (portal propio)
- Gestión de usuarios (crear, editar, activar/desactivar)
- Catálogos: tipos de activo y ubicaciones
- Registro de activos con número de serie obligatorio y soft delete
- Asignaciones de activos a usuarios
- Firma digital de entrega en responsiva imprimible
- Registro de devoluciones con firma digital
- Responsiva de devolución imprimible con folio
- Historial completo por activo (asignaciones, incidencias, mantenimiento, gastos)
- Incidencias por activo (creación, seguimiento, resolución)
- Órdenes de mantenimiento preventivo y correctivo
- Registro de gastos por activo
- Dashboard con contadores y alertas operativas
- Reportes: distribución de activos, top gastos, incidencias y mantenimiento abiertos
- Exportación CSV de activos y asignaciones (con filtros activos)
- Portal de usuario final (`/my-assets`)
- Guía rápida interna (`/help`)
- Branding visual básico

## Módulos del sistema

| Módulo | Rutas principales | Roles |
|---|---|---|
| Dashboard y alertas | `/dashboard` | admin_ti |
| Inventario de activos | `/assets`, `/assets/new`, `/assets/[id]`, `/assets/[id]/edit` | admin_ti |
| Exportación CSV activos | `/assets/export` | admin_ti |
| Asignaciones | `/assignments`, `/assignments/new`, `/assignments/[id]/return` | admin_ti |
| Responsiva de entrega | `/assignments/[id]/receipt` | admin_ti + usuario_final (propias) |
| Responsiva de devolución | `/assignments/[id]/return-receipt` | admin_ti + usuario_final (propias) |
| Exportación CSV asignaciones | `/assignments/export` | admin_ti |
| Incidencias | `/assets/[id]/incidents`, `/assets/[id]/incidents/new` | admin_ti (+ usuario_final via portal) |
| Mantenimiento | `/assets/[id]/maintenance`, `/assets/[id]/maintenance/new` | admin_ti |
| Gastos | `/assets/[id]/expenses/new` | admin_ti |
| Reportes | `/reports` | admin_ti |
| Administración | `/admin/users`, `/admin/locations`, `/admin/asset-types` | admin_ti |
| Portal usuario final | `/my-assets`, `/my-assets/[assetId]/incidents/new` | usuario_final |
| Guía rápida | `/help` | todos |

---

## Empresa

**CIPRIJAL** — Exportación de limón persa y aguacate Hass, México.  
Sistema de uso interno. Acceso restringido al personal autorizado.

---

## Estado del proyecto

El alcance correspondiente a la residencia profesional quedó concluido con el desarrollo, validación y documentación de una versión funcional del sistema. Las actividades de publicación e infraestructura productiva no forman parte del alcance de la residente y, en caso de realizarse, corresponden a decisiones posteriores de CIPRIJAL.

| Aspecto | Estado |
|---|---|
| Funcionalidades principales del sistema v1.0 | Completadas |
| Autenticación y control de acceso por roles | Completado |
| Gestión de usuarios, activos y ubicaciones | Completado |
| Asignaciones, devoluciones y responsivas | Completado |
| Incidencias, mantenimiento y gastos | Completado |
| Dashboard, reportes y exportaciones | Completado |
| Portal de usuario final | Completado |
| Pruebas funcionales y validaciones técnicas | Completadas |
| Documentación técnica y manual de usuario | Completados |
| Despliegue en infraestructura productiva | Fuera del alcance de la residencia |
| Dominio y HTTPS | Fuera del alcance de la residencia |
| Base de datos administrada en la nube | Fuera del alcance de la residencia |
| Respaldo automático y monitoreo de producción | Fuera del alcance de la residencia |
| Suite adicional de tests automatizados | Mejora opcional posterior |

## Documentación técnica

| Documento | Contenido |
|---|---|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | ADRs, capas, seguridad, despliegue |
| [ESPECIFICACION_FUNCIONAL.md](./ESPECIFICACION_FUNCIONAL.md) | Módulos, flujos, casos de uso |
| [ESPECIFICACION_TECNICA.md](./ESPECIFICACION_TECNICA.md) | Stack, seguridad, performance, API |
| [MODELO_BASE_DATOS.md](./MODELO_BASE_DATOS.md) | Tablas, relaciones, enums, índices |
| [DISEÑO_BASE_DATOS.md](./DISEÑO_BASE_DATOS.md) | Diseño conceptual de la base de datos |
| [REGLAS_NEGOCIO.md](./REGLAS_NEGOCIO.md) | Reglas con IDs únicos (RN-ACT-001, etc.) |
| [PERMISOS.md](./PERMISOS.md) | Matriz de permisos por rol |
| [CASOS_USO.md](./CASOS_USO.md) | Casos de uso detallados |
| [DECISIONES_TECNICAS.md](./DECISIONES_TECNICAS.md) | Por qué se eligió cada tecnología |
| [PLAN_DESARROLLO.md](./PLAN_DESARROLLO.md) | Fases, sprints, criterios de aceptación |
| [PRODUCT_BACKLOG.md](./PRODUCT_BACKLOG.md) | Backlog de producto |
| [ROADMAP.md](./ROADMAP.md) | Hoja de ruta |
| [FILOSOFIA_PROYECTO.md](./FILOSOFIA_PROYECTO.md) | Principios y filosofía del proyecto |
