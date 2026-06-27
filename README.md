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
cp .env.example .env.local
# Editar .env.local con tus credenciales locales
```

---

## Configuración del entorno

Copia `.env.example` como `.env.local` y completa los valores:

```env
# Base de datos PostgreSQL local
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/ciprijal_activos"

# NextAuth.js — genera con: openssl rand -base64 32
NEXTAUTH_SECRET="secreto-de-al-menos-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# Email SMTP (opcional en desarrollo — solo necesario para alertas)
SMTP_HOST="smtp.ejemplo.com"
SMTP_PORT="587"
SMTP_USER="correo@dominio.com"
SMTP_PASS="contraseña"
SMTP_FROM="CIPRIJAL TI <notificaciones@ciprijal.com>"
```

> **Nunca comitear `.env.local` al repositorio.** El `.gitignore` ya lo excluye.

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
│   │   │   ├── dashboard/     → Panel principal con KPIs
│   │   │   ├── assets/        → Inventario de activos
│   │   │   ├── assignments/   → Asignaciones y actas
│   │   │   ├── incidents/     → Incidencias
│   │   │   ├── maintenance/   → Órdenes de mantenimiento
│   │   │   ├── reports/       → Reportes exportables
│   │   │   ├── alerts/        → Panel de alertas
│   │   │   ├── audit/         → Log de auditoría (solo admin_ti)
│   │   │   ├── admin/         → Administración (solo admin_ti)
│   │   │   └── profile/       → Perfil del usuario
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

```
main        → Producción. Solo acepta merges desde release/*
develop     → Integración. Base para features.
feature/*   → Nueva funcionalidad (ej: feature/123-registro-activos)
bugfix/*    → Corrección de bug
hotfix/*    → Corrección urgente que va directo a main
release/*   → Preparación de release
```

### Commits (Conventional Commits)

```
feat(assets): add serial number validation on create
fix(auth): prevent redirect loop on session expiry
test(assignments): add integration test for digital signature
chore(deps): update Prisma to 6.x
```

### CI antes de hacer merge

El pipeline en `.github/workflows/ci.yml` ejecuta automáticamente en cada PR:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run build`

Un PR con CI fallido no debe mergearse.

---

## Módulos del sistema

| Módulo | Rutas | Roles |
|---|---|---|
| Inventario | `/assets`, `/assets/new`, `/assets/[id]` | admin_ti |
| Asignaciones | `/assignments` | admin_ti |
| Incidencias | `/incidents` | admin_ti + usuario_final (propias) |
| Mantenimiento | `/maintenance` | admin_ti |
| Reportes | `/reports` | admin_ti |
| Alertas | `/alerts` | admin_ti |
| Auditoría | `/audit` | admin_ti |
| Administración | `/admin/users`, `/admin/settings` | admin_ti |
| Perfil | `/profile` | todos |

---

## Empresa

**CIPRIJAL** — Exportación de limón persa y aguacate Hass, México.  
Sistema de uso interno. Acceso restringido al personal autorizado.

---

## Documentación técnica

| Documento | Contenido |
|---|---|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | ADRs, capas, seguridad, despliegue |
| [ESPECIFICACION_FUNCIONAL.md](./ESPECIFICACION_FUNCIONAL.md) | Módulos, flujos, casos de uso |
| [ESPECIFICACION_TECNICA.md](./ESPECIFICACION_TECNICA.md) | Stack, seguridad, performance, API |
| [MODELO_BASE_DATOS.md](./MODELO_BASE_DATOS.md) | Tablas, relaciones, enums, índices |
| [REGLAS_NEGOCIO.md](./REGLAS_NEGOCIO.md) | Reglas con IDs únicos (RN-ACT-001, etc.) |
| [PERMISOS.md](./PERMISOS.md) | Matriz de permisos por rol |
| [CASOS_USO.md](./CASOS_USO.md) | 24 casos de uso detallados |
| [DECISIONES_TECNICAS.md](./DECISIONES_TECNICAS.md) | Por qué se eligió cada tecnología |
| [PLAN_DESARROLLO.md](./PLAN_DESARROLLO.md) | Fases, sprints, criterios de aceptación |
