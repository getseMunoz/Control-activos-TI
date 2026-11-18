# Manual técnico

## Sistema de Gestión de Activos TI — CIPRIJAL

**Versión:** 1.1
**Fecha:** 2026-11-14

> Este manual se redactó **únicamente a partir del código fuente real del repositorio** (rama
> `main`; versión 1.0 al commit `55c20a0`, actualizado a esta versión 1.1 al commit `6acaad4`) y de
> la documentación técnica existente en el proyecto (`README.md`, `ARQUITECTURA.md`,
> `DECISIONES_TECNICAS.md`, `MODELO_BASE_DATOS.md`, `REGLAS_NEGOCIO.md`, `PRODUCT_BACKLOG.md`).
> Cada afirmación se verificó leyendo el archivo correspondiente. No contiene contraseñas, cadenas
> de conexión ni secretos.

> **Alcance del proyecto.** Lo que se entrega es el **código fuente** del sistema: la aplicación
> Next.js, su modelo de base de datos, sus migraciones y su documentación. **El despliegue en un
> servidor queda fuera del alcance de este proyecto** y corresponde al área de Sistemas de
> CIPRIJAL decidir cuándo y dónde se realiza. A la fecha de este manual, **el sistema no se ha
> desplegado en ningún servidor ni está en uso real** — todo lo descrito aquí (incluida la sección
> 8, "Pruebas realizadas") se ejecutó en equipos de desarrollo locales, nunca en un entorno de
> producción.

---

## 1. Descripción general y arquitectura

CIPRIJAL — Activos TI es una aplicación web para el control de inventario de equipos de cómputo:
alta y baja de activos, asignación a usuarios con firma digital de responsivas, devoluciones con
doble firma, incidencias, mantenimiento, gastos, reportes y exportación a CSV.

### 1.1 Tecnologías y versiones (tomadas de `package.json`)

| Capa | Tecnología | Versión instalada |
|---|---|---|
| Framework | Next.js (App Router) | `16.4.6` (versión exacta, sin `^`) |
| UI | React / React DOM | `19.2.4` |
| Lenguaje | TypeScript | `^5` (strict mode) |
| Autenticación | NextAuth.js (Auth.js) | `^5.0.0-beta.32` |
| ORM | Prisma / `@prisma/client` | `^6.3.1` |
| Base de datos | PostgreSQL | 14+ (entorno de desarrollo real: **14.19**, verificado con `SELECT version();`) |
| Validación | Zod | `^3.25.64` |
| Hash de contraseñas | bcryptjs | `^3.0.2` |
| Estilos | Tailwind CSS | `^4` |
| Componentes UI base | shadcn/ui (estilo `base-nova`, código propio en `src/components/ui/`) | — |
| Iconos | lucide-react | `^1.21.0` |
| Calidad de código | ESLint, Prettier, Husky + lint-staged | `^9`, `^3.5.3`, `^9.1.7` |

Instaladas pero **sin uso real** en el código (confirmado: ningún archivo las importa de forma
funcional, más allá de estar declaradas): `react-hook-form`,
`@hookform/resolvers`, `sonner` (su componente `Toaster` nunca se monta en ningún layout),
`next-themes` (sin `ThemeProvider` activo, no hay modo oscuro real). Documentado también en
`PRODUCT_BACKLOG.md` (AUD-02).

### 1.2 Arquitectura de capas

Next.js App Router con Server Components y Server Actions; sin API REST propia para las
mutaciones del CRUD (solo dos Route Handlers reales, ver 1.4).

```
Página (Server Component, src/app/.../page.tsx)
  → Server Query   (src/server/queries/*.queries.ts)   — solo lectura, llamada directa desde la página
  → Server Action  (src/server/actions/*.actions.ts)   — mutaciones, invocadas desde <form action={...}>
      → Prisma Client (src/lib/prisma.ts, singleton)    — acceso a PostgreSQL
```

La capa `src/server/services/` existe en el repositorio pero está **vacía** (solo contiene un
`.gitkeep`) — las reglas de negocio viven directamente dentro de las Server Actions y Queries, no
en una capa de servicios separada, a pesar de que el diagrama de capas del `README.md` la
menciona como intermedia. Esto es una diferencia entre lo documentado como intención y el estado
real del código.

### 1.3 Autenticación y middleware

NextAuth v5 con proveedor `Credentials` (correo + contraseña contra la tabla `users`), estrategia
de sesión JWT. La protección de rutas por sesión y rol se hace en `src/proxy.ts` (middleware de
Next.js 16; en versiones anteriores de Next.js este archivo se llamaba `middleware.ts`), **no**
en cada página de forma independiente — ver sección 6.

### 1.4 Rutas HTTP propias (Route Handlers)

Solo existen dos, ambas bajo `src/app/api/auth/`:

| Ruta | Método | Propósito |
|---|---|---|
| `/api/auth/[...nextauth]` | — | Manejado internamente por NextAuth (login, logout, sesión) |
| `/api/auth/force-logout` | `GET` | Cierra la sesión de un usuario cuya cuenta ya no es válida (desactivada, eliminada o con rol distinto al del token) — ver sección 6.4 |

Además, dos endpoints de exportación CSV, que no son API JSON sino descargas de archivo:
`src/app/(dashboard)/assets/export/route.ts` y `src/app/(dashboard)/assignments/export/route.ts`.

---

## 2. Requisitos del entorno

Tomado de `README.md` y `.nvmrc`, verificado contra el entorno real donde se desarrolló el
proyecto:

| Requisito | Versión | Notas |
|---|---|---|
| Node.js | 20 LTS | `.nvmrc` fija `20`. Entorno de desarrollo real verificado: Node `v20.20.0` |
| npm | 10+ | Incluido con Node.js. Entorno real verificado: npm `11.12.1` |
| PostgreSQL | 14+ | Desarrollado y probado contra PostgreSQL **14.19** (Homebrew, local) |
| Git | 2.x | Para control de versiones y los hooks de Husky |

No se declaran `engines` en `package.json` (no hay una validación automática de versión de Node al
instalar) — la única fuente formal del requisito de versión es `.nvmrc` y el propio `README.md`.

### 2.1 Requisitos mínimos recomendados para el despliegue (estimación)

El repositorio no define ninguna especificación de hardware de destino — el despliegue está fuera
del alcance de este proyecto (ver nota de alcance al inicio de este manual). Lo siguiente es una
**estimación**, no un requisito validado en un servidor real: se basa en el volumen operativo
esperado (2-3 Administradores TI, unos 80 Usuarios Finales, más de 100 equipos registrados) y en
los resultados de la prueba de volumen descrita en la sección 8.1, que se ejecutó en un equipo de
desarrollo local, no en un servidor.

| Recurso | Estimación |
|---|---|
| Sistema operativo | Ubuntu Server (LTS) |
| CPU | 2 núcleos |
| Memoria RAM | 4 GB (el sistema operativo, la aplicación y PostgreSQL comparten el mismo servidor; este margen permite además compilar el build de producción —`npm run build`— en el propio servidor) |
| Almacenamiento | 20 GB |
| Node.js | 20 (LTS) |
| PostgreSQL | 14 o superior |
| Red | Dominio propio con certificado HTTPS |

Esta estimación **no ha sido validada en un servidor** — es una proyección razonable a partir del
volumen medido en la prueba de volumen (sección 8.1) y del perfil de uso esperado, no una medición
directa en el tipo de infraestructura final que decida usar CIPRIJAL.

---

## 3. Instalación y puesta en marcha

Pasos verificados contra `README.md`, `package.json` y `.env.example`.

### 3.1 Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd Control-activos-TI
npm install
```

### 3.2 Variables de entorno

Copiar la plantilla y completarla con valores propios (nunca comitear `.env`):

```bash
cp .env.example .env
```

Variables definidas en `.env.example` (sin valores reales — los que siguen son solo ejemplos de
formato, tomados tal cual del propio archivo de plantilla del repositorio):

```env
# Base de datos PostgreSQL
# Formato: postgresql://usuario:contraseña@host:5432/nombre_bd
DATABASE_URL="postgresql://postgres:password@localhost:5432/ciprijal_activos"

# NextAuth.js v5 (beta) — nombre preferido: AUTH_SECRET / AUTH_URL
# (también acepta NEXTAUTH_SECRET / NEXTAUTH_URL por compatibilidad)
# Generar el secreto con: openssl rand -base64 32
AUTH_SECRET="cambia-esto-por-un-secreto-seguro-de-al-menos-32-caracteres"
AUTH_URL="http://localhost:3000"

# Entorno
NODE_ENV="development"

# Seed — usuario administrador inicial (solo los usa prisma/seed.ts)
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="ChangeMe123!"
```

El propio `.env.example` documenta variables **reservadas para sprints futuros, sin implementación
en v1.0**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` y `STORAGE_PATH`. Ninguna
tiene efecto hoy — confirmado también en la sección 10 (el sistema no envía correos).

### 3.3 Base de datos: generar cliente, migrar y sembrar

```bash
# Generar el cliente de Prisma (TypeScript) a partir del schema
npm run db:generate

# Aplicar las migraciones existentes (desarrollo)
npm run db:migrate
# En producción, usar en su lugar (no crea migraciones nuevas, solo aplica las pendientes):
npm run db:migrate:deploy

# Crear el usuario Administrador TI inicial
# (requiere SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD ya definidos en .env)
npm run db:seed
```

`prisma/seed.ts` también crea, si no existe, una ubicación inicial llamada "Corporativo" y asigna
a ella al administrador sembrado. El hash de la contraseña del seed usa bcrypt con factor de costo
**12** (igual que el resto del sistema, ver sección 6.3).

### 3.4 Ejecutar el proyecto

```bash
# Desarrollo (con Turbopack) — http://localhost:3000
npm run dev

# Build de producción
npm run build

# Servidor de producción (requiere haber corrido npm run build antes)
npm run start
```

`AUTH_URL` (y, por consiguiente, el puerto) se toma de la variable de entorno — para correr en un
puerto distinto al 3000 (por ejemplo, para levantar una segunda instancia aislada de pruebas en el
puerto 3001) se pasa `PORT=<puerto>` y se ajusta `AUTH_URL` en consecuencia, sin modificar ningún
archivo del proyecto.

### 3.5 Verificación visual de la base de datos (opcional)

```bash
npm run db:studio
# → http://localhost:5555
```

---

## 4. Estructura de carpetas del proyecto

Verificado directamente contra el árbol real de archivos del repositorio.

```
ciprijal-activos-ti/
├── prisma/
│   ├── schema.prisma        → Modelo de datos completo (fuente de verdad)
│   ├── seed.ts               → Script de siembra (admin inicial + ubicación "Corporativo")
│   └── migrations/           → 7 migraciones, todas comiteadas al repositorio (ver sección 5)
│
├── src/
│   ├── app/
│   │   ├── (auth)/login/              → Página pública de login (LoginForm.tsx + page.tsx)
│   │   ├── (dashboard)/               → Todo lo que requiere sesión; layout.tsx trae el sidebar
│   │   │   ├── dashboard/             → Panel principal (solo admin_ti)
│   │   │   ├── assets/                → Inventario de activos, y sub-rutas por activo:
│   │   │   │   ├── [id]/incidents/, [id]/maintenance/, [id]/expenses/,
│   │   │   │   │   [id]/credentials/, [id]/technical-info/
│   │   │   │   └── export/route.ts    → Exportación CSV de activos
│   │   │   ├── assignments/           → Asignaciones, responsivas, devoluciones
│   │   │   │   └── export/route.ts    → Exportación CSV de asignaciones
│   │   │   ├── admin/                 → Usuarios, ubicaciones, tipos de activo
│   │   │   ├── reports/                → Reportes operativos (solo admin_ti)
│   │   │   ├── my-assets/              → Portal del Usuario Final (y firma de recepción/devolución)
│   │   │   ├── help/                   → Guía rápida interna
│   │   │   └── NavLink.tsx             → Resalta la sección activa del menú lateral
│   │   ├── api/auth/                   → Route Handlers (ver sección 1.4)
│   │   ├── layout.tsx, globals.css     → Layout raíz y estilos/tema globales
│   │   └── page.tsx                    → Raíz del sitio: siempre redirige a /dashboard
│   │                                      (sin distinguir rol); si quien entra es Usuario Final,
│   │                                      el middleware (proxy.ts) lo reenvía de ahí a /my-assets
│   │
│   ├── components/
│   │   ├── ui/           → Componentes base de shadcn/ui (código propio, no una dependencia externa)
│   │   └── features/     → Componentes de negocio por módulo: assets, asset-expenses,
│   │                        asset-types, assignments, incidents, locations, maintenance,
│   │                        users, layout (BrandLogo, etc.)
│   │
│   ├── server/
│   │   ├── actions/   → Server Actions — una por módulo (assets, assignments, users,
│   │   │                 locations, asset-types, incidents, maintenance, asset-expenses,
│   │   │                 credentials, technical-info, auth)
│   │   ├── queries/   → Funciones de solo lectura usadas directamente desde las páginas
│   │   └── services/  → Vacío (solo `.gitkeep`) — ver nota en sección 1.2
│   │
│   ├── lib/
│   │   ├── prisma.ts   → Singleton del cliente Prisma (evita múltiples conexiones en desarrollo)
│   │   ├── auth.ts     → Configuración de NextAuth (provider, callbacks, sesión, helpers de rol)
│   │   ├── dates.ts    → Utilidades de formateo de fechas
│   │   └── utils.ts    → `cn()` (combinación de clases Tailwind) y similares
│   │
│   ├── proxy.ts        → Middleware: protección de rutas por sesión y rol (sección 6)
│   ├── types/          → `index.ts` (tipos compartidos: Role, ActionResult, etc.) y
│   │                      `next-auth.d.ts` (extensión de tipos de sesión de NextAuth)
│   ├── config/index.ts → Constantes: nombre de la app, paginación, duración de sesión/bloqueo,
│   │                      rutas, prefijos admin-only (ver nota de inconsistencia en sección 6.1)
│   └── hooks/           → `use-media-query.ts` y su barrel `index.ts`
│
├── public/images/        → Logo y fondo de login (los dos únicos archivos estáticos reales)
├── docs/                 → Manual de usuario (`MANUAL_USUARIO.md`) y sus capturas (`img-usuario/`);
│                           también contiene `docs/historico/` con documentación de planeación ya
│                           superada (p. ej. `PLAN_DESARROLLO.md`), conservada como registro
├── .github/workflows/ci.yml → Pipeline de GitHub Actions (sección 7.3)
├── .husky/pre-commit     → Hook de pre-commit (sección 7.2)
├── .env.example          → Plantilla de variables de entorno
├── next.config.ts        → Cabeceras de seguridad HTTP (sección 6.7)
├── tsconfig.json          → TypeScript en modo `strict`
├── eslint.config.mjs, .prettierrc → Configuración de lint y formato
└── components.json        → Configuración de shadcn/ui (estilo `base-nova`, iconos `lucide`)
```

---

## 5. Base de datos

### 5.1 Modelo y tablas principales

`prisma/schema.prisma` es la fuente de verdad. 13 modelos, mapeados a 13 tablas en `snake_case`
mediante `@map`/`@@map`:

| Modelo Prisma | Tabla | Rol en el sistema |
|---|---|---|
| `Location` | `locations` | Catálogo de ubicaciones/sedes. Soft delete (`deletedAt`) |
| `AssetType` | `asset_types` | Catálogo de tipos de activo, administrable sin tocar código. Sin soft delete (se desactiva con `isActive`) |
| `User` | `users` | Tabla unificada de credenciales + datos del colaborador. Soft delete |
| `Asset` | `assets` | Tabla central del inventario. Soft delete (`deletedAt` + `deletedBy`) |
| `AssetAssignment` | `asset_assignments` | Historial de asignaciones y devoluciones, con hasta 3 firmas por registro. **Sin** soft delete — es un historial inmutable |
| `AssetExpense` | `asset_expenses` | Gastos adicionales por activo (refacciones, accesorios). Sin soft delete |
| `Incident` | `incidents` | Incidencias/fallas reportadas por cualquier rol sobre un activo. Sin soft delete |
| `MaintenanceOrder` | `maintenance_orders` | Órdenes de trabajo de mantenimiento. Sin soft delete (se cancela con `status=cancelled`) |
| `MaintenanceSchedule` | `maintenance_schedules` | Programación de mantenimiento preventivo. **Modelo sin ninguna implementación real** — ningún código lee o escribe esta tabla (confirmado por búsqueda en todo `src/`) |
| `Document` | `documents` | Metadatos de documentos adjuntos (patrón polimórfico `entityType`/`entityId`). **Sin ninguna implementación real**, igual que `MaintenanceSchedule` |
| `AssetCredential` | `asset_credentials` | Credenciales de acceso por activo (BIOS, Wi-Fi, paneles). Exclusivo de `admin_ti`. Soft delete |
| `AssetTechnicalInfo` | `asset_technical_info` | Ficha técnica por activo (red, SO, firmware). Relación 1-a-1 con `Asset`. Exclusivo de `admin_ti` |
| `AuditLog` | `audit_logs` | Tabla de auditoría de solo inserción. **Existe en el schema pero ningún Server Action escribe en ella** — no hay auditoría real funcionando hoy (ver sección 10) |

Confirmado por búsqueda directa en el código (`grep` de `prisma.document.`, `prisma.maintenanceSchedule.`, `prisma.auditLog.` en todo `src/`): **cero** coincidencias para los tres — estas tablas existen en PostgreSQL (las migraciones las crean) pero no tienen ningún flujo de la aplicación que las use.

### 5.2 Enums

Definidos en `schema.prisma`: `Role` (`admin_ti`, `usuario_final`), `Modality` (`presencial`,
`remoto`, `hibrido`), `AssetStatus` (`in_storage`, `assigned`, `in_maintenance`, `decommissioned`,
`stolen`, `lost` — los dos últimos sin forma de seleccionarse desde ningún formulario, ver sección
10), `IncidentStatus` (`open`, `in_review`, `in_progress`, `resolved`, `closed`), `Priority`
(`low`, `medium`, `high`, `critical`), `MaintenanceType` (`preventive`, `corrective`,
`warranty_repair`), `MaintenanceStatus` (`pending`, `in_progress`, `waiting_parts`,
`waiting_supplier`, `completed`, `cancelled`), `MaintenanceResult` (`resolved`, `warranty_sent`,
`unrepairable`, `cancelled`), `FrequencyType` (`monthly`, `quarterly`, `biannual`, `annual`),
`DocumentType` (9 valores, sin uso real — ver 5.1), `AuditAction` (`CREATE`, `UPDATE`, `DELETE`,
`LOGIN`, `LOGOUT`, `EXPORT`, `SIGN` — sin uso real, ver 5.1).

### 5.3 Índice único parcial

No expresable directamente en el lenguaje de Prisma; se declaró como SQL puro dentro de una
migración (`20260628012000_add_partial_unique_assignment_index/migration.sql`), documentado
también en el encabezado de `schema.prisma`:

```sql
CREATE UNIQUE INDEX idx_one_active_assignment
ON asset_assignments(asset_id)
WHERE returned_at IS NULL;
```

Garantiza, a nivel de base de datos, que un mismo activo nunca puede tener dos asignaciones activas
simultáneamente (`returned_at IS NULL` = asignación activa) — es la regla de integridad más
importante del esquema y no depende solo de la validación de la aplicación.

### 5.4 Migraciones

7 migraciones, todas comiteadas en `prisma/migrations/` (Prisma exige que el historial de
migraciones viaje con el repositorio, nunca solo en la base de datos):

| Migración | Qué agrega |
|---|---|
| `20260628011845_init_database` | 11 de las 13 tablas: `locations`, `asset_types`, `users`, `assets`, `asset_assignments`, `asset_expenses`, `incidents`, `maintenance_orders`, `maintenance_schedules`, `documents`, `audit_logs`. **No** incluyó `asset_credentials` ni `asset_technical_info` — esas dos se agregaron en migraciones posteriores |
| `20260628012000_add_partial_unique_assignment_index` | El índice parcial de la sección 5.3 |
| `20260628181124_add_assignment_delivery_signature` | Firma de entrega en `asset_assignments` |
| `20260630013812_add_assignment_return_signature` | Firma de devolución (lado del administrador) |
| `20260714000617_add_asset_identifier_fields_and_credentials` | Identificadores adicionales de activo (columnas nuevas en `assets`) + creación de la tabla `asset_credentials` (la duodécima tabla) |
| `20260717225749_add_asset_technical_info` | Creación de la tabla `asset_technical_info` (la decimotercera y última tabla) |
| `20261028002301_add_return_user_signature` | Segunda firma de devolución (lado del usuario que entrega) |

### 5.5 Respaldo y restauración

Ver sección 9.

---

## 6. Seguridad

### 6.1 Protección de rutas (middleware)

`src/proxy.ts` (nombre obligatorio en Next.js 16 para lo que en versiones previas se llamaba
`middleware.ts`) intercepta toda petición excepto assets estáticos y `/api/auth` (ver su propio
`matcher`). Lógica real:

1. `/login` es la única ruta pública. Si ya hay sesión, redirige según rol (`admin_ti` → `/dashboard`, cualquier otro → `/my-assets`).
2. Cualquier otra ruta sin sesión válida redirige a `/login?callbackUrl=<ruta-original>`.
3. Una lista fija de prefijos (`ADMIN_ONLY_PREFIXES` **dentro del propio `proxy.ts`**: `/audit`, `/admin`, `/assets`, `/assignments`, `/reports`, `/alerts`, `/dashboard`) solo es accesible para `admin_ti`; cualquier otro rol que intente entrar es redirigido a `/my-assets`.
4. Excepción explícita: las responsivas (`/assignments/<id>/receipt` y `/assignments/<id>/return-receipt`) son accesibles a cualquier usuario autenticado — la validación de que el documento le pertenece ocurre dentro de la página, no en el middleware.

**Nota de inconsistencia detectada en el código:** `src/config/index.ts` define una constante
`ADMIN_ONLY_ROUTES` con una lista parecida pero no idéntica (incluye `/assets/new` y
`/maintenance`, no incluye `/dashboard`). Esa constante **no se usa en ningún lugar del código**
(confirmado por búsqueda) — la lista que realmente aplica es la de `proxy.ts`. Además,
`/audit` y `/alerts` en `ADMIN_ONLY_PREFIXES` no corresponden a ninguna ruta implementada hoy
(documentado también como AUD-09 en `PRODUCT_BACKLOG.md`).

### 6.2 Autenticación

NextAuth v5, proveedor `Credentials` (`src/lib/auth.ts`). El `authorize()` busca el usuario por
correo (solo entre `isActive: true, deletedAt: null`), compara la contraseña con `bcryptjs.compare`
contra `passwordHash`, y devuelve `id`, `email`, `name` y `role` para el JWT. Sesión con estrategia
`jwt`, no hay sesiones en base de datos.

### 6.3 Hash de contraseñas

`bcryptjs`, factor de costo **12** en todos los puntos donde se genera un hash (creación de
usuario, restablecimiento de contraseña y `prisma/seed.ts` — mismo valor en los tres,
`BCRYPT_COST = 12` en `src/server/actions/users.actions.ts`).

### 6.4 Bloqueo por intentos fallidos y sesión invalidada en caliente

Definido en `src/config/index.ts` (`AUTH.maxLoginAttempts = 5`, `AUTH.lockoutDuration = 15 * 60 *
1000` ms) y aplicado en `authorize()`:

- Cada intento fallido incrementa `failedLoginAttempts`. Al llegar a 5, se fija `lockedUntil` a 15
  minutos en el futuro.
- Mientras `lockedUntil` siga en el futuro, `authorize()` devuelve `null` **sin siquiera comparar
  la contraseña** — y NextAuth muestra el mismo mensaje genérico que para una contraseña
  incorrecta (no hay forma de distinguir, desde la pantalla de login, "contraseña incorrecta" de
  "cuenta bloqueada").
- Un login exitoso resetea `failedLoginAttempts` a 0 y limpia `lockedUntil`.
- No existe ningún mecanismo para que un Administrador TI desbloquee una cuenta manualmente antes
  de que termine el periodo de 15 minutos (confirmado por búsqueda; también documentado como MF-16
  en `PRODUCT_BACKLOG.md`).

Adicionalmente, cada request autenticado a una ruta protegida (vía `requireAuthenticatedUser()` o
`requireAdminTI()` en `src/lib/auth.ts`) vuelve a consultar la base de datos
(`isSessionUserValid()`) para confirmar que el usuario del token JWT sigue existiendo, activo, sin
eliminar, y con el **mismo rol** que tenía al momento de emitirse el token. Si cualquiera de esas
condiciones deja de cumplirse (por ejemplo, un administrador desactiva a ese usuario mientras tenía
sesión abierta), la petición se redirige a `/api/auth/force-logout`, que cierra la sesión real y
manda al usuario a `/login?sessionInvalid=1` con el mensaje "Tu sesión ya no es válida. Por favor,
inicia sesión de nuevo.".

### 6.5 Duración de sesión

JWT con `maxAge` de `AUTH.sessionMaxAge = 30 * 60` segundos (**30 minutos**) (`session: {
strategy: 'jwt', maxAge: AUTH.sessionMaxAge }` en `src/lib/auth.ts`). Si ese `maxAge` se renueva o
no con la actividad del usuario depende del comportamiento interno de NextAuth v5 — el proyecto no
agrega ninguna lógica propia de renovación, y ese comportamiento específico no se validó de forma
directa en esta documentación.

### 6.6 Roles y autorización dentro de las Server Actions

Además del middleware, cada Server Action vuelve a verificar el rol explícitamente antes de
mutar datos (no confía solo en que la ruta ya pasó por `proxy.ts`), usando `requireAdminTI()` o
`requireAuthenticatedUser()` de `src/lib/auth.ts`. Las acciones exclusivas de `admin_ti`
(gestión de usuarios, ubicaciones, tipos de activo, activos, asignaciones, credenciales,
información técnica, mantenimiento, gastos) llaman a `requireAdminTI()`; las que puede ejercer
cualquier usuario autenticado sobre sus propios recursos (firmar su recepción/devolución, reportar
una falla) llaman a `requireAuthenticatedUser()` y además comparan el `userId` del recurso contra
el de la sesión.

### 6.7 Cabeceras HTTP de seguridad

Definidas globalmente en `next.config.ts` para toda ruta (`/(.*)`, vía la función `headers()` de
Next.js): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(),
geolocation=()`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, y un
`Content-Security-Policy` que restringe `default-src` a `'self'` (con `script-src`/`style-src`
permitiendo `'unsafe-eval'`/`'unsafe-inline'`, necesario para el *dev overlay* y los estilos en
línea del proyecto).

### 6.8 Cookies de sesión

Verificado de forma empírica (inspección de cabeceras `Set-Cookie` en una respuesta real de login):
la cookie de sesión de NextAuth (`authjs.session-token`) se emite con `HttpOnly` y
`SameSite=Lax`. El atributo `Secure` de esa cookie lo activa NextAuth automáticamente **cuando el
sistema se sirve por HTTPS** — en el entorno de desarrollo local (por HTTP) no se activa, por
diseño. Al desplegar el sistema en un servidor con dominio y HTTPS (ver sección 2.1), debe
verificarse que la cookie de sesión efectivamente se emita con `Secure` activo en ese entorno.

### 6.9 Credenciales técnicas y cifrado

`AssetCredential.password`/`username` y `Asset.biosPassword`/`devicePassword` se guardan **en
texto plano** en la base de datos — no hay ninguna rutina de cifrado en el código (`AES-256-GCM` u
otro). Un comentario antiguo en `schema.prisma` sugería que existía cifrado; se corrigió para
reflejar la realidad: no existe `ENCRYPTION_KEY` en el proyecto ni ninguna función de cifrado. Estos
dos últimos campos de `Asset`, además, no los usa ningún formulario ni Server Action hoy —
documentado también como AUD-10 en `PRODUCT_BACKLOG.md`.

---

## 7. Scripts npm, calidad de código y CI

### 7.1 Scripts disponibles (`package.json`)

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción (requiere `build` previo) |
| `npm run lint` / `lint:fix` | ESLint (análisis / corrección automática) |
| `npm run format` / `format:check` | Prettier (aplicar / solo verificar) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:migrate:deploy` | `prisma migrate deploy` (producción, no crea migraciones nuevas) |
| `npm run db:push` | `prisma db push` (solo prototipado, no usar en producción) |
| `npm run db:studio` | `prisma studio` |
| `npm run db:seed` | `tsx prisma/seed.ts` |

### 7.2 Calidad de código local: Husky + lint-staged

`.husky/pre-commit` ejecuta `npx lint-staged` en cada `git commit`. La configuración de
`lint-staged` (dentro de `package.json`) corre `eslint --fix` + `prettier --write` sobre los
archivos `.ts`/`.tsx` en stage, y solo `prettier --write` sobre `.json`/`.md`/`.css`. Esto significa
que **cualquier commit puede reformatear automáticamente** los archivos que toca, incluso
documentación.

### 7.3 Integración continua (GitHub Actions)

`.github/workflows/ci.yml`, un solo job (`quality`), disparado en `push` y `pull_request` hacia
`main` o `develop`. Pasos, en orden: checkout → `actions/setup-node@v4` (Node 20, caché de npm) →
`npm ci` → `npx prisma generate` → `npm run typecheck` → `npm run lint` → `npm run format:check` →
`npm run build` (con `DATABASE_URL`/`NEXTAUTH_SECRET`/`NEXTAUTH_URL` tomados de `secrets` de
GitHub si existen, o valores de reemplazo públicos y no sensibles si no — nótese que el build de
Next.js no necesita conectarse realmente a una base de datos para completarse).

**El CI no ejecuta ninguna prueba automatizada** (ni unitarias ni end-to-end) — solo verifica
tipos, estilo de código, formato y que el proyecto compile. Ver sección 10 sobre las pruebas E2E.

**El repositorio no tiene secretos configurados en GitHub.** Cada corrida del CI usa los valores de
reemplazo definidos directamente en `ci.yml` (`postgresql://postgres:password@localhost:5432/ciprijal_test`,
`ci-secret-placeholder-32-chars-minimum`, `http://localhost:3000`) — no son credenciales reales, y
el paso de build no necesita conectarse de verdad a una base de datos para completarse.

### 7.4 Flujo de Git documentado vs. práctica real

`README.md` documenta un modelo de ramas `main` / `develop` / `feature/*` / `bugfix/*` /
`hotfix/*` / `release/*` y Conventional Commits. **En la práctica real del repositorio** (verificado
con `git branch -a`), solo existe la rama `main` — no hay ni ha habido rama `develop` ni ramas de
feature en este repositorio; todos los commits del historial se hicieron directamente sobre
`main`. Es una diferencia entre el proceso documentado y el que efectivamente se
siguió.

---

## 8. Pruebas realizadas

Dos campañas de prueba independientes, realizadas durante el desarrollo del proyecto, **ninguna de las dos integrada al CI** (ver sección 7.3 y 10).

### 8.1 Prueba de volumen realizada durante el desarrollo

Objetivo: verificar si el sistema soporta ~3 administradores, ~80 usuarios finales, 100+ equipos y
varios años de historial. Ejecutada en una base de datos separada y temporal
(`ciprijal_activos_carga`, ya eliminada), nunca contra la base real. Se cargaron 15 administradores,
400 usuarios finales, 5 ubicaciones, 8 tipos de activo, 600 activos, 5,400 asignaciones históricas
(firmas de tamaño realista incluidas), 1,500 incidencias, 1,000 órdenes de mantenimiento y 2,000
gastos, con fechas distribuidas en 3 años. Se midió el tiempo de la consulta a base de datos de
cada pantalla (Prisma Client → PostgreSQL), no el tiempo de carga completa de la página en el
navegador.

**Resultado:** a ese volumen, ninguna pantalla superó los 150 ms de consulta. `/assignments` fue la
más pesada (132.5 ms promedio con 5,400 filas) — es además el único listado sin paginar que crece
para siempre (cada entrega/devolución es un registro histórico permanente). `/assets` mostró el
mismo patrón en menor grado (61.5 ms con 600 equipos), agravado porque su consulta trae **todas**
las filas de `asset_expenses` de cada activo solo para sumarlas, en vez de un total agregado.
Dashboard, Reportes y el portal del Usuario Final ya están acotados con `take`/agregados y no
crecen con el historial. Recomendaciones principales: paginar `/assignments` y `/assets`, y cambiar
la consulta de gastos de `getAssets()` a un `_sum` agregado.

### 8.2 Pruebas funcionales de extremo a extremo

Herramienta: Playwright Test, contra una segunda instancia de la propia aplicación (puerto 3001) y
una base de datos de prueba separada (`ciprijal_activos_e2e`), con datos ficticios. Proyecto de
pruebas independiente, **no incluido en este repositorio** — no existe ninguna carpeta `tests/`
ni configuración de Playwright dentro de este repositorio.

**Resultado final: 14 de 14 casos pasan**, cubriendo login y redirección por rol, alta de activos y
usuarios, asignación con doble firma (entrega y devolución), reglas de negocio (mantenimiento
bloquea asignación; firma de devolución pendiente bloquea desactivación de usuario), permisos entre
usuarios y seguridad de sesión (cierre forzado al desactivar un usuario con sesión abierta).

Durante la primera corrida se encontró y corrigió un defecto real del sistema: el botón "Reactivar
usuario" (`src/components/features/users/DeactivateUserButton.tsx`) quedaba inhabilitado mostrando
"Procesando…" después de una desactivación/reactivación exitosa, porque el componente nunca
restablecía su estado local `pending` en el camino de éxito (sí lo hacía en el de error). Corregido
en el commit `ef4353c` agregando el `setPending(false)` faltante.

---

## 9. Respaldo, restauración y solución de problemas comunes

### 9.1 Respaldo y restauración (documentado en `MODELO_BASE_DATOS.md`)

```bash
# Respaldo (formato comprimido personalizado de pg_dump)
pg_dump -Fc "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).dump

# Restauración
pg_restore -d "$DATABASE_URL" backup_YYYYMMDD_HHMMSS.dump
```

No hay ningún script propio del proyecto que automatice el respaldo — son los comandos estándar de
PostgreSQL, usando la misma `DATABASE_URL` que ya configura la aplicación.

**No existe hoy ningún respaldo automatizado, porque el sistema no está desplegado** (ver nota de
alcance al inicio de este manual) — no hay ningún servidor ni base de datos de producción corriendo
de la cual respaldar. Al desplegar el sistema, se recomienda **programar respaldos periódicos**
(por ejemplo, mediante una tarea programada del sistema operativo o del proveedor de hospedaje que
se elija) usando los comandos de `pg_dump`/`pg_restore` anteriores, con una periodicidad y
retención que el área de Sistemas de CIPRIJAL defina según sus propias políticas.

### 9.2 Estado del despliegue a producción

El sistema **no se ha desplegado en ningún servidor** — el despliegue está fuera del alcance de
este proyecto (ver nota de alcance al inicio de este manual) y queda a cargo del área de Sistemas
de CIPRIJAL. `ARQUITECTURA.md` §8.2 documenta Railway como **una opción posible** de hospedaje
(PaaS con PostgreSQL administrado, build automático desde GitHub y backups automáticos incluidos),
no como un plan decidido del proyecto ni como algo ya ejecutado. El área de Sistemas puede optar
por Railway, por cualquier otro proveedor, o por un servidor propio que cumpla los requisitos
estimados de la sección 2.1 — la elección final no está tomada.

### 9.3 Problemas comunes

La siguiente tabla mezcla dos tipos de entradas, distinguidas en la columna "Origen": problemas
**observados de forma real** durante el desarrollo y las pruebas de este proyecto (contrastados
contra el código y las pruebas realizadas durante el desarrollo), y **recomendaciones generales** sobre el uso de las
herramientas del proyecto (Prisma, PostgreSQL) que no corresponden a un incidente puntual ya
ocurrido, sino a una precaución conocida de esas herramientas.

| Síntoma | Causa | Solución | Origen |
|---|---|---|---|
| `prisma migrate dev`/`db push` modifican o resetean datos que no se querían tocar | Son comandos destructivos por diseño en ciertos escenarios | Usar siempre `prisma migrate deploy` contra bases de datos con datos que importa conservar; reservar `migrate dev`/`db push` solo para desarrollo local desde cero | Recomendación general (no es un incidente puntual ya ocurrido en este proyecto) |
| Al conectar Prisma a una base de datos con `DATABASE_URL` sin usuario explícito (`postgresql://localhost:5432/...`) la autenticación falla, aunque `psql` sí conecta sin usuario | `psql` toma el usuario del sistema operativo por defecto; Prisma no lo asume igual | Incluir el usuario explícitamente en `DATABASE_URL` (`postgresql://usuario@localhost:5432/...`) | Observado durante el desarrollo y las pruebas de este proyecto |
| Un registro recién creado no aparece en el primer listado que debería mostrarlo en `/assets` o en el selector de "Nueva asignación" | No identificada con certeza (se descartó caché explícita: no hay `unstable_cache`, `revalidate` ni `'use cache'` en esas rutas) — hallazgo todavía abierto, sin relación con el punto siguiente | Recargar la pantalla una vez; en la segunda carga el dato ya aparece de forma consistente | Observado durante las pruebas E2E de este proyecto, **sin resolver** |
| El portal `/my-assets` parecía no reflejar una devolución recién registrada por el admin (`tests/04-asignaciones-firmas.spec.ts` fallaba de forma intermitente) | Investigado a fondo: la causa real era **doble, y de la propia prueba** — buscaba el texto "Pendiente de firma de devolución" en toda la página en vez de en la fila del activo correspondiente, y las corridas repetidas dejaban residuo de ejecuciones anteriores que inflaban las coincidencias. Además, por consistencia preventiva, se detectó que `createAssignmentAction`, `returnAssignmentAction` y `updateIncidentAction` no llamaban `revalidatePath('/my-assets')`, a diferencia del resto de acciones que sí afectan esa pantalla | **Corregido.** La prueba ahora acota la búsqueda a la fila del activo y no depende de recargar la página; se agregó `revalidatePath('/my-assets')` a las tres acciones mencionadas (commit `6acaad4`). Verificación manual directa (admin registra la devolución, se espera, el usuario entra a `/my-assets` en una ventana de incógnito) confirmó que el portal muestra correctamente la devolución pendiente | Observado durante las pruebas E2E de este proyecto, **ya corregido y verificado manualmente** |
| El botón "Reactivar usuario" se queda en "Procesando…" para siempre | Ver sección 8.2 | Corregido en el commit `ef4353c` | Observado durante las pruebas E2E de este proyecto, ya corregido |
| Un teléfono con menos de 10 dígitos no muestra el mensaje de error del servidor | El atributo HTML `pattern="[0-9]{10}"` del campo bloquea el envío del formulario antes de que la petición llegue al servidor | No es un defecto — el dato de todas formas no se guarda; es un matiz de validación en dos capas (navegador + servidor), documentado en las pruebas funcionales realizadas durante el desarrollo | Observado durante las pruebas E2E de este proyecto |

---

## 10. Limitaciones conocidas y mejoras futuras

Contrastado contra el código real; cuando existe, se cita la referencia del catálogo de hallazgos
y mejoras futuras del propio proyecto (`PRODUCT_BACKLOG.md`, secciones AUD-xx y MF-xx).

1. **Los estados `Robado` y `Perdido` de un activo existen en el modelo de datos
   (`AssetStatus`) pero no son seleccionables desde ninguna interfaz.** El formulario de edición de
   activo (`AssetEditForm.tsx`) filtra explícitamente esos dos valores de su lista desplegable. Las
   consultas de lectura (filtros de `/assets`, exportación CSV, alertas del dashboard) sí
   contemplan ambos estados, pero no hay ningún flujo que los escriba — quedan reservados en el
   modelo de datos para una eventual ampliación futura.
2. **El sistema no envía correos electrónicos de ningún tipo.** Las variables `SMTP_*` están en
   `.env.example` explícitamente marcadas como "no implementadas en v1.0". Toda entrega de
   contraseña (alta de usuario o restablecimiento) debe hacerse por un medio manual y seguro fuera
   del sistema.
3. **No existe autoservicio de contraseña.** Un usuario no tiene forma, en ningún lugar del
   sistema, de cambiar su propia contraseña; solo el Administrador TI puede restablecerla desde la
   pantalla de edición de ese usuario (`resetPasswordAction`). Tampoco se obliga a cambiar la
   contraseña inicial (`mustChangePassword` existe como columna pero siempre se fija en `false`).
   Mejora futura ya catalogada: MF-14 (edición del propio perfil).
4. **Las pruebas E2E (Playwright) no están integradas al pipeline de CI.** Viven en un proyecto
   completamente separado, fuera de este repositorio, y se ejecutan solo manualmente contra una
   base de datos de prueba aislada. El CI de GitHub Actions (sección 7.3) no las dispara ni las
   conoce.
5. **No hay auditoría real.** La tabla `audit_logs` existe en el schema y está diseñada como de
   solo inserción, pero ningún Server Action escribe en ella — no hay hoy un historial de quién
   hizo qué. Mejora futura catalogada: MF-13.
6. **Tablas sin ninguna implementación real:** `Document` (documentos adjuntos) y
   `MaintenanceSchedule` (programación de mantenimiento preventivo) existen en el schema de la base
   de datos pero ningún código las usa. Varios campos heredados de `AssetAssignment`
   (`signedAt`, `signaturePath`, `signatureIp`, `deliveryDocumentId`, `returnDocumentId`) tampoco
   se usan — documentado como AUD-11.
7. **Sin desbloqueo manual de cuentas.** Tras 5 intentos fallidos, la única forma de recuperar el
   acceso es esperar los 15 minutos; no hay ninguna acción de Administrador TI para desbloquear
   antes. Catalogado como MF-16.
8. **Listados sin paginar que crecen de forma indefinida** (`/assignments`, en menor medida
   `/assets`) — ver sección 8.1. No representa un problema de rendimiento al volumen de datos
   medido en la prueba de volumen, pero sí un riesgo a mediano plazo según el propio reporte.
9. **`Location.name` no tiene una restricción `@unique` real en PostgreSQL** — solo una
   verificación manual en el Server Action, con una ventana de condición de carrera teórica para
   duplicados. Catalogado como AUD-03.
10. **Dependencias instaladas sin uso real:** `react-hook-form`,
    `@hookform/resolvers`, `sonner` y `next-themes` (ver sección 1.1). Catalogado como AUD-02.
    (`@auth/prisma-adapter`, que antes aparecía en este mismo punto, se eliminó del proyecto en el
    commit `4c9a724` — ver sección 10.12.)
11. **Credenciales de activo y campos `biosPassword`/`devicePassword` sin cifrado real** — ver
    sección 6.9. Catalogado como AUD-10.
12. **Vulnerabilidades reportadas por `npm audit` — corregidas parcialmente, estado actual.**
    Las tres vulnerabilidades críticas de producción que describía la versión anterior de este
    manual ya se corrigieron:

    - **`next-auth`** (crítica, `GHSA-8fpg-xm3f-6cx3` — un error de configuración podía dejar los
      chequeos de autenticación "abiertos" en vez de bloquear el acceso): actualizado de
      `5.0.0-beta.29` a `5.0.0-beta.32` en el commit `177e5b6`.
    - **`next`** (crítica, varias — incluidas `GHSA-2xp9-vwfh-vxw4` y `GHSA-2464-fhr4-w9xw`, de
      ejecución remota de código en la API de optimización de imágenes al procesar archivos
      AVIF/SVG): actualizado de `16.2.9` a `16.4.6` en el commit `344b81b`.
    - **`@auth/prisma-adapter`** (crítica, por arrastrar una versión vieja de `@auth/core`):
      **eliminada por completo** del proyecto en el commit `4c9a724` — no se usaba en ningún lugar
      del código (ver sección 1.1).

    **Cifras finales de `npm audit --omit=dev`** (solo dependencias de producción, ejecución de
    solo lectura, verificada varias veces durante este trabajo): **6 vulnerabilidades — 1 moderada,
    5 altas, 0 críticas** (`@prisma/config`, `baseline-browser-mapping`, `deepmerge-ts`, `prisma`,
    `source-map-js`, `zod`). Bajó de las 13 originales (1 moderada, 8 altas, 4 críticas). Como ya
    se señalaba antes, esta cifra cambia con el tiempo según se publican nuevos avisos — no
    representa un estado permanente.

    **Sobre el aviso de "bypass de middleware" (`GHSA-6gpp-xcg3-4w24`) que afectaba a `next`:**
    revisado su texto oficial — exige **dos condiciones a la vez**: build hecho con Turbopack *y*
    configuración de `i18n.locales` con un solo idioma. Este proyecto no usa Turbopack en el build
    de producción (`"build": "next build"`, sin `--turbopack`; solo `"dev"` lo usa) ni tiene
    ninguna configuración de `i18n` en `next.config.ts`. **No aplicaba a este proyecto**,
    independientemente de la versión de `next` instalada — se corrigió de todas formas al
    actualizar `next` por las demás vulnerabilidades reales.

    **Sobre `zod` (alta, `GHSA-mrhx-c7xc-m3w5`, agotamiento de memoria):** la función afectada
    (`z.array()` sin límites de tamaño, en el mecanismo interno `handleArrayResult`/`$ZodArray`)
    **no existe en la implementación de Zod 3.x** que usa el proyecto — esos nombres son exclusivos
    del código interno de Zod 4 que el propio paquete `zod` empaqueta como vista previa opcional
    (`zod/v4`), nunca importado aquí. Además, se confirmó por búsqueda en todo `src/` que el
    proyecto **no usa `z.array()` en ningún esquema**. La vulnerabilidad no aplica en la práctica.
    No existe una versión 3.x que "corrija" algo que no está roto en esa línea; la corrección
    oficial solo existe en Zod 4. Migrar a Zod 4 queda registrado como mejora futura (es un cambio
    de versión mayor, con cambios de API, que requiere revisar cada formulario del sistema antes de
    aceptarlo) — no es un cambio urgente dado que la vulnerabilidad real no afecta a este código.
13. **Validaciones de servidor con asimetrías menores** entre formularios similares — por ejemplo,
    `createUserAction` no captura el error de colisión de correo concurrente (`P2002`) a diferencia
    de otras acciones que sí lo hacen (AUD-04), y `Asset.purchasePrice` no rechaza valores negativos
    a diferencia de los campos de costo de gastos y mantenimiento (AUD-05). No se detectaron
    pérdidas de datos asociadas, solo mensajes de error menos específicos en esos casos puntuales.
14. **Catálogo más amplio de mejoras funcionales planeadas pero no implementadas**
    (gestión de proveedores/contratos, licencias de software, módulo financiero de depreciación,
    inventario físico con QR, integración con Active Directory/LDAP, certificados SSL, reserva de
    activos compartidos, seguros, descubrimiento automático de red, analítica avanzada, app móvil
    nativa, integración con ERP) — todas catalogadas con su justificación de prioridad en
    `PRODUCT_BACKLOG.md` (MF-01 a MF-12), fuera del alcance de la versión actual.

---

## 11. Lista de verificación previa al despliegue

Checklist dirigida a quien finalmente despliegue el sistema (área de Sistemas de CIPRIJAL — ver
nota de alcance al inicio de este manual). Ninguno de estos puntos se ejecutó como parte de este
manual; se listan para que quien despliegue no parta de cero.

- [ ] **Servidor:** aprovisionar conforme a la estimación de la sección 2.1 (Ubuntu Server LTS, 2
      núcleos, 4 GB RAM, 20 GB de almacenamiento, Node.js 20, PostgreSQL 14+), o la opción de
      hospedaje elegida (Railway u otra).
- [ ] **Dominio y HTTPS:** configurar un dominio propio con certificado TLS antes de exponer el
      sistema — varias protecciones del proyecto dependen de servir por HTTPS (ver el punto de la
      cookie `Secure`, más abajo, y las cabeceras de `next.config.ts`, sección 6.7).
- [ ] **Variables de entorno:** definir `DATABASE_URL`, `AUTH_SECRET` (generado con
      `openssl rand -base64 32` o equivalente — nunca reutilizar el de desarrollo), `AUTH_URL`
      (la URL pública real del sistema, con `https://`), y `NODE_ENV=production`. No escribir
      ninguna de estas en el repositorio.
- [ ] **Migraciones:** aplicar con `npm run db:migrate:deploy` (nunca `db:migrate` ni `db:push` en
      producción — ver sección 7.1).
- [ ] **Usuario administrador inicial:** ejecutar `npm run db:seed` una sola vez, con
      `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` definidos solo en el entorno de producción (no
      reutilizar ninguna contraseña de prueba usada durante el desarrollo).
- [ ] **Cookie de sesión `Secure`:** una vez desplegado por HTTPS, verificar directamente (por
      ejemplo inspeccionando la cabecera `Set-Cookie` de un login real) que `authjs.session-token`
      se emite con el atributo `Secure` activo — ver sección 6.8.
- [ ] **Respaldos:** programar respaldos periódicos de la base de datos (`pg_dump`/`pg_restore`,
      sección 9.1) con la periodicidad y retención que defina el área de Sistemas — hoy no existe
      ningún respaldo automatizado porque el sistema nunca se ha desplegado.
- [ ] **Seguridad de dependencias:** volver a ejecutar `npm audit --omit=dev` justo antes de
      publicar (las cifras de la sección 10.12 son de la fecha de este manual y cambian con el
      tiempo), y revisar si conviene actualizar algo más antes de salir a producción.
