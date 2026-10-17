# DECISIONES TÉCNICAS
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-27
**Estado:** Vigente

Este documento registra cada decisión técnica significativa tomada en el proyecto: qué se eligió, por qué, y qué alternativas fueron descartadas. Debe actualizarse cada vez que una decisión cambie.

Las decisiones de negocio y arquitectura de alto nivel están en `ARQUITECTURA.md` (ADRs). Este documento es complementario: se enfoca en las herramientas y configuraciones concretas.

**Principios que guían estas decisiones:** ante dos soluciones que resuelven el mismo problema, se prefiere siempre la más simple sobre la más compleja. El código se escribe para que otra persona lo entienda y modifique con confianza, no para impresionar — se evitan abstracciones sin un uso concreto inmediato, patrones de diseño adoptados por moda, y optimizaciones sin evidencia de un problema real. Toda dependencia o herramienta nueva debe justificarse con una razón concreta, no con popularidad.

---

## DT-001 — Next.js como framework full-stack único

**Decisión:** Un único proyecto Next.js 16 con App Router para frontend, API y lógica de servidor.

**Por qué:**
- Elimina la complejidad de mantener dos repositorios separados (frontend React + backend NestJS), dos builds y la gestión de CORS.
- Los Server Components acceden directamente a Prisma sin capa HTTP intermedia — las páginas de listado no hacen fetch, simplemente leen datos en el servidor.
- Los Server Actions eliminan el boilerplate de formularios: el componente llama directamente a una función de servidor sin necesidad de un endpoint REST intermedio.
- Los tipos TypeScript del backend (modelos de Prisma) se comparten con el frontend de forma nativa, sin generadores de código ni contratos de API manuales.
- Un solo `npm run dev`, un solo deploy.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| React SPA + NestJS API | Dos proyectos, dos builds, CORS, duplicación de tipos, overhead operacional sin beneficio para la escala de CIPRIJAL |
| React SPA + Express.js API | Menos structure que NestJS, sin ventajas sobre Next.js full-stack |
| Remix | Menor adopción, ecosistema más pequeño, equipo no familiarizado |
| SvelteKit | Ecosistema más pequeño, componentes shadcn/ui no disponibles |

---

## DT-002 — Next.js 16 (en lugar de 14 o 15)

**Decisión:** Se usa la versión instalada por `create-next-app` al momento de inicialización: Next.js 16.2.9.

**Por qué:**
- La documentación especifica "Next.js 14+", lo que significa versión mínima, no máxima.
- `create-next-app` instala siempre la versión estable más reciente.
- Next.js 16 es retrocompatible con el código escrito para 14/15.
- Usar la versión más reciente reduce el riesgo de encontrar bugs ya corregidos y aprovecha las últimas optimizaciones.

**Cambio notable en Next.js 16:**
El archivo de middleware fue renombrado de `middleware.ts` a `proxy.ts`. El proyecto usa `src/proxy.ts` (ver también `ARQUITECTURA.md` §5.1).

---

## DT-003 — TypeScript con modo estricto

**Decisión:** TypeScript 5.x con `"strict": true` en `tsconfig.json`.

**Por qué:**
- Elimina clases enteras de bugs en tiempo de compilación en lugar de en producción.
- Prisma genera tipos automáticamente desde `schema.prisma`. Con strict mode, el compilador verifica que el código de acceso a datos coincide con el schema.
- Para un sistema de auditoría empresarial donde la corrección de datos es crítica, los tipos son una capa de seguridad adicional.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| JavaScript plano | Sin verificación de tipos. Los errores de tipado en acceso a BD serían silenciosos hasta producción |
| TypeScript sin strict | Permite `any` implícitos y omite verificaciones que previenen bugs reales |

---

## DT-004 — PostgreSQL 15 como base de datos

**Decisión:** PostgreSQL 15 como única base de datos.

**Por qué:**
- Los datos de activos TI son relacionales: activos → asignaciones → usuarios → localidades. PostgreSQL tiene integridad referencial nativa.
- Soporte JSONB para el campo `specs` de activos (especificaciones técnicas variables por tipo de hardware) sin necesidad de una base de datos NoSQL separada.
- Soporte nativo de `TIMESTAMPTZ` para fechas en UTC con zona horaria.
- Índices parciales (usados para la restricción de asignación única activa: `WHERE returned_at IS NULL`).
- Railway provee PostgreSQL administrado con backups automáticos.
- El equipo de CIPRIJAL tiene más probabilidad de encontrar soporte y documentación para PostgreSQL que para alternativas.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| MySQL / MariaDB | Menor soporte de JSONB, índices parciales con más restricciones, menor robustez en integridad referencial |
| MongoDB | Sin integridad referencial nativa. Para datos relacionales complejos añade complejidad sin beneficio |
| SQLite | No apto para producción con múltiples usuarios concurrentes |
| Supabase | Vendor lock-in innecesario. PostgreSQL directo es más simple y portátil |

---

## DT-005 — Prisma ORM

**Decisión:** Prisma ORM 6.x para acceso a la base de datos.

**Por qué:**
- El archivo `schema.prisma` es la fuente de verdad: define modelos, relaciones, enums e índices. El cliente TypeScript se genera automáticamente, eliminando la clase de bugs donde el modelo del ORM no coincide con la BD real.
- `prisma migrate` genera SQL versionado y reversible. Cada migración es un archivo SQL legible en `prisma/migrations/`.
- DX superior: autocompletado completo, queries tipadas, validación en tiempo de compilación.
- Compatible nativo con Next.js — el singleton de `src/lib/prisma.ts` previene conexiones duplicadas en desarrollo con hot reload.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| TypeORM | Diseñado para NestJS con decoradores. Peor DX en TypeScript puro. Migraciones menos predecibles |
| Drizzle | Más joven, menor ecosistema, mayor configuración inicial |
| Kysely | Query builder sin ORM — requiere más código para operaciones comunes |
| SQL directo (pg) | Sin tipos, sin migrations versionadas, mayor superficie de error |
| Sequelize | API antigua, soporte TypeScript inferior a Prisma |

---

## DT-006 — NextAuth.js v5 (Auth.js) con sesiones en cookie

**Decisión:** NextAuth.js versión 5 beta con sesiones en cookie `httpOnly` firmada.

**Por qué:**
- Integración nativa con Next.js App Router — funciona con Server Components y Server Actions sin configuración adicional.
- Las cookies `httpOnly` no son accesibles desde JavaScript del navegador, eliminando el riesgo de robo de sesión por XSS.
- No requiere Redis ni ninguna base de datos de sesiones. La cookie firmada con `NEXTAUTH_SECRET` es autosuficiente.
- El logout es inmediato: NextAuth elimina la cookie. Sin tokens residuales.
- `@auth/prisma-adapter` conecta NextAuth directamente con los modelos de Prisma para persistir sesiones si se necesita en el futuro.

**Por qué v5 (beta) en lugar de v4:**
NextAuth v4 no tiene soporte completo para Next.js App Router y Server Components. v5 fue reescrita específicamente para este modelo de renderizado. El proyecto arranca con v5 para evitar una migración futura.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| JWT expuesto al cliente + Redis | Requiere Redis (no en stack v1.0). Los JWT de larga duración son inseguros sin revocación |
| Implementación propia de JWT | Mayor superficie de error. Reinventar la rueda en seguridad es un anti-patrón |
| Clerk / Auth0 | Servicios de pago con vendor lock-in. Para un sistema interno no aportan valor suficiente |
| Lucia Auth | Menor adopción y documentación |

---

## DT-007 — Tailwind CSS 4

**Decisión:** Tailwind CSS 4.x con configuración en CSS (sin `tailwind.config.ts`).

**Por qué:**
- Es la versión actual estable al momento de inicializar el proyecto. La documentación especifica "3.x" como mínimo.
- Tailwind v4 configura todo mediante CSS custom properties en `globals.css`, eliminando el archivo `tailwind.config.ts`. El resultado es el mismo CSS optimizado.
- Bundle CSS mínimo: solo se incluyen las clases que se usan en el código.
- Compatible con React Server Components (no require JavaScript en el cliente).
- `prettier-plugin-tailwindcss` ordena clases automáticamente.

**Diferencia importante con v3:**
Tailwind v4 no usa `tailwind.config.ts`. La personalización de temas se hace con `@theme inline { ... }` en `globals.css`. Los tokens del tema CIPRIJAL están ahí definidos.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| CSS Modules | Más verboso, sin utilidades, mayor tiempo de desarrollo |
| Styled Components | No compatible con React Server Components |
| Ant Design | Sistema de diseño cerrado. No compatible con RSC. Difícil de personalizar |
| Chakra UI | Menor compatibilidad con RSC. Bundle más pesado |

---

## DT-008 — shadcn/ui como biblioteca de componentes

**Decisión:** shadcn/ui (estilo `base-nova`, basado en `@base-ui/react`) para los componentes de UI.

**Por qué:**
- Los componentes se copian al repositorio como código propio (`src/components/ui/`). No es una dependencia de npm con versiones externas — el código es nuestro y modificable sin restricciones.
- Cada componente es independiente: se añaden uno a uno según se necesitan. No se instala una librería completa de la que se usa el 20%.
- Compatible con React Server Components.
- Tailwind v4 nativo.
- `base-nova` usa `@base-ui/react` (de los autores de Material UI) como primitivos, que provee accesibilidad (ARIA) sin estilos impuestos.

**Por qué `base-nova` y no el estilo clásico `default`:**
`create-next-app` con shadcn@4 instala `base-nova` por defecto con Tailwind v4. Los componentes son equivalentes en funcionalidad; la diferencia es que `base-nova` usa `@base-ui/react` en lugar de Radix UI.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| Ant Design | Requiere configuración especial para RSC. Estilos fijos sin flexibilidad |
| Material UI (MUI) | Vendor lock-in. Bundle pesado. Estilos difíciles de alinear con identidad CIPRIJAL |
| Headless UI | Menos componentes disponibles. Solo para Tailwind v3 |
| Radix UI (directo) | Sin estilos. shadcn/ui es Radix + estilos Tailwind, lo mejor de los dos mundos |

---

## DT-009 — ESLint 9 con flat config

**Decisión:** ESLint 9 con configuración en formato `eslint.config.mjs` (flat config).

**Por qué:**
- ESLint 9 es la versión actual. El formato `flat config` es el estándar desde ESLint 9.
- `eslint-config-next` provee las reglas específicas para Next.js (React hooks, Server Components, etc.).
- Integrado con lint-staged para ejecutarse solo sobre archivos modificados en cada commit.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| ESLint 8 con `.eslintrc.json` | Formato deprecado. Migración inevitable si se actualiza ESLint |
| Solo TypeScript (sin ESLint) | TypeScript verifica tipos pero no patrones de código (React hooks, imports, etc.) |
| Biome | Alternativa más rápida pero menor compatibilidad con el ecosistema Next.js |

---

## DT-010 — Prettier como formateador

**Decisión:** Prettier 3.x con `prettier-plugin-tailwindcss`.

**Por qué:**
- Formato consistente sin debates sobre estilo en code reviews.
- `prettier-plugin-tailwindcss` ordena las clases de Tailwind en el orden oficial, lo que facilita la lectura y revisión de componentes.
- Integrado con lint-staged: se ejecuta automáticamente en cada commit sobre los archivos modificados.

**Configuración elegida (`singleQuote: true, semi: false, trailingComma: 'all'`):**
- Single quotes: estándar en la comunidad JavaScript moderna.
- Sin punto y coma: reducción de ruido visual.
- Trailing commas: facilita los diffs de git (añadir un elemento al final no modifica la línea anterior).

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| Sin formateador | Los diffs de git incluyen cambios de formato mezclados con cambios de lógica |
| Biome (formatter) | Menor integración con el ecosistema Next.js actual |

---

## DT-011 — Husky + lint-staged

**Decisión:** Husky 9 para git hooks + lint-staged para ejecutar herramientas solo sobre archivos modificados.

**Por qué:**
- Previene que código con errores de lint o formato llegue al repositorio.
- `lint-staged` ejecuta ESLint y Prettier solo sobre los archivos del commit — no sobre todo el proyecto — lo que mantiene el hook rápido.
- La alternativa (solo CI) deja el feedback para después de pushear. Los hooks lo dan antes de comitear.

**Hook configurado (`pre-commit`):**
```bash
npx lint-staged
# Ejecuta: eslint --fix + prettier --write sobre *.ts, *.tsx
# Ejecuta: prettier --write sobre *.json, *.md, *.css
```

---

## DT-012 — Railway como plataforma de despliegue

**Decisión:** Railway (PaaS) como plataforma de despliegue en lugar de un VPS con Docker + Nginx.

**Por qué:**
- Railway detecta Next.js automáticamente desde el repositorio GitHub. No hay Dockerfile que mantener.
- SSL automático con certificados Let's Encrypt.
- PostgreSQL administrado con backups automáticos incluidos.
- Deploy automático en cada push a `main`: el equipo no necesita conocimiento de infraestructura.
- Variable `DATABASE_URL` inyectada automáticamente desde el servicio PostgreSQL de Railway.
- Para un equipo pequeño, el tiempo ahorrado en operaciones justifica el costo.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| VPS propio (Ubuntu + Docker + Nginx) | Requiere gestión de SSL, actualizaciones de seguridad, configuración de Docker. Overhead operacional innecesario |
| Vercel | Sin soporte oficial para PostgreSQL administrado. Diseñado para frontend, no full-stack con DB |
| AWS / GCP / Azure | Sobreingeniería para el volumen de CIPRIJAL. Curva de aprendizaje alta |
| Heroku | Más caro que Railway para características equivalentes |

---

## DT-013 — Sin Redis ni colas de trabajo en v1.0

**Decisión:** No se usa Redis, BullMQ ni ninguna solución de colas en la versión 1.0.

**Por qué:**
- El volumen de CIPRIJAL no justifica la complejidad operacional de una cola de trabajos.
- **Estado actual:** no hay envío de emails ni generación de PDF/Excel implementados en v1.0 — los reportes se limitan a un panel con contadores y exportación CSV (ver MODELO_BASE_DATOS.md §6 y REGLAS_NEGOCIO.md §RN-ALT).
- **Si se implementaran en el futuro:** emails con Nodemailer en un Route Handler síncrono sería suficiente para alertas puntuales (no newsletters masivos); reportes en PDF/Excel también podrían generarse de forma síncrona con un indicador de carga en el frontend, dado el volumen esperado (hasta 50,000 activos).
- Eliminar Redis simplifica el despliegue y el modelo mental del sistema.

**Criterio para agregar en el futuro:** Si los endpoints de generación de reportes superan consistentemente 10 segundos, o si el volumen de emails de alerta supera 100 por hora, se agrega una solución de colas. La lógica de negocio no necesita cambiar — solo el transport.

---

## DT-014 — UUID v4 como clave primaria en todas las tablas

**Decisión:** Todas las claves primarias son UUID v4 generados con `@default(uuid())` en Prisma.

**Por qué:**
- Previene la enumeración de recursos: un atacante no puede adivinar que el registro siguiente al ID `42` es el `43`.
- Los códigos de negocio legibles (ej: `HW-2026-001`) son campos separados, no las PKs expuestas en la API.
- Facilita la fusión de datos de múltiples instancias sin conflictos de ID.

**Alternativas descartadas:**

| Alternativa | Razón del descarte |
|---|---|
| Integer autoincrement | Permite enumeración de recursos. `GET /api/assets/1` → `GET /api/assets/2` |
| ULID / CUID | Ventajas marginales sobre UUID v4 que no justifican añadir dependencias |

---

## DT-015 — Soft delete selectivo (no universal)

**Decisión:** Ningún registro se elimina físicamente, pero el mecanismo exacto varía según la naturaleza de cada entidad — no es un campo `deletedAt`/`deletedBy` idéntico en todas las tablas.

**Mecanismo real por tipo de entidad:**
- **Con `deletedAt` + `deletedBy`:** `Asset`, `AssetCredential`.
- **Solo con `deletedAt`:** `User`, `Location`.
- **Con bandera `isActive` (sin `deletedAt`):** `AssetType`.
- **Sin ningún mecanismo de borrado lógico — son registros históricos inmutables:** `AssetAssignment`, `AssetExpense`, `Incident`, `MaintenanceOrder`, `MaintenanceSchedule`, `AuditLog`, `AssetTechnicalInfo`.

**Por qué:**
- Los activos dados de baja y los usuarios desactivados mantienen su historial de asignaciones e incidencias — por eso sí tienen `deletedAt`.
- Las tablas de historial (asignaciones, gastos, incidencias, mantenimientos) nunca se editan ni se marcan como inactivas: son el registro permanente en sí mismo, no necesitan un segundo mecanismo de "borrado lógico" sobre algo que ya es inmutable por definición.
- Permite recuperación de datos si se elimina algo por error, sin inflar con un campo `deletedAt` sin uso en tablas donde el concepto no aplica.

**Implementación:** Las queries de listado sobre entidades con `deletedAt` incluyen `where: { deletedAt: null }`. No existe un helper compartido tipo `withSoftDelete()` — el filtro se repite explícitamente en cada query donde aplica.

---

## DT-016 — Tema visual CIPRIJAL

**Decisión:** Paleta de verdes profesionales como color primario del sistema.

**Por qué:**
- CIPRIJAL exporta limón persa y aguacate Hass — el verde es la identidad natural de la empresa.
- Los verdes en tono oscuro/profesional (`oklch(0.449 0.089 152.2)` ≈ `#2d6a4f`) transmiten seriedad y confianza, apropiados para un sistema empresarial interno.
- Fondos blancos y grises neutros mantienen la legibilidad en uso prolongado.
- Se evitó un diseño saturado o llamativo: es un sistema de trabajo, no una aplicación de consumo.

**Colores definidos en `src/app/globals.css`:**
- `--primary`: `oklch(0.449 0.089 152.2)` — Verde principal (botones, highlights)
- `--primary-light`: `oklch(0.566 0.098 152.8)` — Verde medio
- `--primary-lighter`: `oklch(0.747 0.081 152.0)` — Verde claro (scrollbar)
- `--primary-muted`: `oklch(0.946 0.039 152.0)` — Verde muy suave (fondos)
- `--sidebar-bg`: `#1a2332` — Azul marino oscuro (sidebar profesional)
- `--ring`: `oklch(0.566 0.098 152.8)` — Verde en anillos de foco

---

## Historial de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-06-27 | Documento inicial — todas las decisiones de la Fase 1 |
