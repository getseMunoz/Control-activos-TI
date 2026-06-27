# ESPECIFICACION TECNICA
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0  
**Fecha:** 2026-06-25  
**Estado:** Borrador para revisión

---

## 1. PRINCIPIOS ARQUITECTÓNICOS

Las decisiones tecnológicas de este sistema se guían por los siguientes principios:

1. **Confiabilidad sobre velocidad de entrega:** Este es un sistema de registro empresarial. Los datos deben ser siempre consistentes y correctos.
2. **Operabilidad interna:** El sistema debe poder ser operado y mantenido por el equipo de TI de CIPRIJAL sin dependencia permanente de consultores externos.
3. **Escalabilidad progresiva:** Comenzar con una arquitectura simple y robusta que pueda crecer, en lugar de una arquitectura compleja prematura.
4. **Seguridad por diseño:** La seguridad no es un módulo adicional; está integrada en cada capa del sistema.
5. **Trazabilidad completa:** Toda acción debe ser rastreable hasta el usuario y momento exacto.
6. **Dependencias mínimas a terceros:** Evitar dependencias de servicios externos que puedan no estar disponibles o generar costos variables impredecibles.

---

## 2. STACK TECNOLÓGICO

### 2.1 Framework Full-Stack

| Tecnología | Versión mínima | Justificación |
|---|---|---|
| Next.js | 14+ (App Router) | Framework full-stack React con App Router. Unifica frontend y backend en un único proyecto y proceso de despliegue. Soporte nativo para Server Components, Server Actions y Route Handlers. Estándar de facto para aplicaciones React en producción. |
| Node.js | 20 LTS | Runtime de Next.js. Estabilidad de largo plazo. |
| TypeScript | 5.x | Tipado estático en frontend y backend simultáneamente desde el mismo proyecto. Elimina errores en tiempo de ejecución. |

**¿Por qué Next.js full-stack y no React SPA + API separada?**
Un SPA con NestJS separado implica dos proyectos, dos builds, gestión de CORS y duplicación de tipos TypeScript. Next.js permite que los Server Components accedan directamente a la base de datos sin pasar por HTTP, y los Server Actions eliminan boilerplate de formularios. Para un equipo pequeño y un sistema de escala de CIPRIJAL, esta arquitectura reduce complejidad operacional sin sacrificar nada.

**Capas de servidor dentro de Next.js:**

```
app/api/          → Route Handlers (endpoints HTTP REST cuando se necesitan)
server/actions/   → Server Actions (mutaciones desde formularios y botones)
server/queries/   → Funciones de lectura ejecutadas en el servidor
server/services/  → Lógica de negocio reutilizable
lib/prisma.ts     → Singleton del cliente Prisma
```

### 2.2 Frontend (UI)

| Tecnología | Versión mínima | Justificación |
|---|---|---|
| React | 18+ (incluido en Next.js) | Integrado en Next.js. Server Components por defecto; Client Components solo donde se necesita interactividad. |
| Tailwind CSS | 3.x | Estilos utility-first. Bundle CSS mínimo (solo clases usadas). Sin conflictos con Server Components. |
| shadcn/ui | — | Componentes copiados al repositorio como código propio. Table, Form, Dialog, Button, Input, Select, Badge, Card, Tabs, Calendar, Toast, Dropdown. Modificables sin restricciones. |
| Recharts | 2.x | Gráficos para el dashboard (distribución por tipo de activo, incidencias por mes). Basado en D3.js, compatible con React. |
| react-pdf / pdfkit (server) | — | Generación de PDFs en el servidor (actas de resguardo, reportes exportables). |

**¿Por qué Tailwind + shadcn/ui?**
Los componentes de shadcn/ui son código propio del proyecto — no una dependencia con versiones externas que puedan cambiar. Tailwind produce el CSS más ligero posible. Ambas herramientas tienen soporte nativo para React Server Components, lo cual es un requisito con Next.js App Router.

### 2.3 Base de Datos

| Tecnología | Versión mínima | Justificación |
|---|---|---|
| PostgreSQL | 15+ | Base de datos relacional robusta. ACID, integridad referencial, soporte JSONB para especificaciones técnicas variables por tipo de activo, window functions y CTEs para reportes complejos. |
| Prisma ORM | 5.x | ORM moderno para TypeScript. El schema (`prisma/schema.prisma`) es la fuente de verdad: genera tipos TypeScript automáticamente, gestiona migrations con historial versionado y provee un cliente con autocompletado total. |

**¿Por qué Prisma y no TypeORM?**
Prisma genera tipos TypeScript directamente desde el schema de la BD, lo que elimina la clase de errores donde el modelo del ORM no coincide con la BD real. Las migrations de Prisma son más predecibles y su DX es superior para proyectos Next.js. TypeORM está atado a la arquitectura de NestJS (decoradores, DI) que ya no usamos.

**¿Por qué no MongoDB?**
Los datos de activos TI son altamente relacionales: activos tienen asignaciones, que tienen empleados, que tienen departamentos, que tienen localidades. La integridad referencial de PostgreSQL es fundamental para un sistema de auditoría.

### 2.4 Autenticación y Autorización

**Estrategia: NextAuth.js (Auth.js) con sesiones en cookie**

- NextAuth.js maneja el flujo completo de autenticación integrado con Next.js.
- La sesión se almacena en una cookie `httpOnly` firmada con `NEXTAUTH_SECRET`. No hay Redis, no hay tokens JWT expuestos al cliente.
- La cookie tiene atributos: `HttpOnly · Secure · SameSite=Lax`. No es accesible desde JavaScript del navegador.
- Contenido de la sesión: `{ userId, role, name, email }` — `role` es `admin_ti` o `usuario_final`.
- Contraseñas hasheadas con bcrypt (cost factor 12) antes de guardarse en la BD.
- Autorización por rol: middleware de Next.js (`middleware.ts`) bloquea rutas completas según el rol antes de que lleguen a cualquier componente.
- Autorización por propiedad: verificada dentro de cada Server Action y Route Handler con la función `requireOwnership()`.

**¿Por qué no JWT con refresh tokens?**
Los refresh tokens requieren Redis para poder revocarse. Sin Redis en v1.0, los JWT de larga duración son inseguros y los de corta duración requieren infraestructura adicional. Las sesiones en cookie de NextAuth son más simples, igualmente seguras y no requieren ningún servicio externo.

### 2.5 Sin Caché ni Colas de Trabajo (v1.0)

No se usa Redis ni ninguna cola de trabajos en background en v1.0.

- **Email:** Se envía de forma síncrona en Route Handlers con Nodemailer. Para el volumen de CIPRIJAL (alertas puntuales, no newsletters), esto es suficiente.
- **Reportes:** Se generan de forma síncrona en el servidor. Se muestra un indicador de carga en el frontend mientras se genera.
- **Caché:** PostgreSQL con índices adecuados es suficiente para la escala de CIPRIJAL sin caché en memoria.

Si el volumen crece, se puede añadir una solución de colas sin modificar la lógica de negocio existente.

### 2.6 Almacenamiento de Archivos

**v1.0:** Sistema de archivos local en el servidor de Railway. Los documentos adjuntos a activos (manuales, fotografías) se almacenan en disco.
**Futuro:** Migración a almacenamiento S3-compatible (AWS S3, Cloudflare R2) sin cambios en la lógica de negocio.

### 2.7 Infraestructura de Despliegue

| Componente | Tecnología |
|---|---|
| Plataforma de despliegue | Railway (PaaS) — auto-detecta Next.js desde GitHub |
| Base de datos en producción | PostgreSQL administrado por Railway (backups automáticos incluidos) |
| SSL / HTTPS | Automático en Railway (certificados gestionados) |
| CI/CD | GitHub Actions (lint, typecheck, tests) + Railway (deploy automático en push a `main`) |
| Variables de entorno | Gestionadas en el dashboard de Railway — nunca en el repositorio |

### 2.8 Herramientas de Desarrollo

| Herramienta | Uso |
|---|---|
| ESLint + Prettier | Linting y formateo estandarizado |
| Jest / Vitest | Testing unitario (lógica de servicio) |
| Playwright | Testing end-to-end de flujos críticos |
| Husky + lint-staged | Pre-commit hooks para garantizar calidad |
| Conventional Commits | Estándar de mensajes de commit |
| Prisma Studio | UI visual de la BD en desarrollo (`npx prisma studio`) |
| Bruno / Insomnia | Colecciones de prueba de Route Handlers |

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### 3.1 Rendimiento

| Indicador | Objetivo |
|---|---|
| Tiempo de respuesta API (p95) | < 500ms para consultas simples |
| Tiempo de respuesta API (p95) | < 3 segundos para reportes complejos (con caché) |
| Generación de reporte PDF | < 10 segundos |
| Carga inicial del frontend | < 3 segundos en conexión de 10 Mbps |
| Usuarios concurrentes soportados | 200 sin degradación |
| Activos en inventario | Hasta 50,000 sin impacto en rendimiento |
| Tiempo de respuesta de búsqueda | < 1 segundo para búsqueda en 50,000 activos |

**Estrategias de rendimiento:**
- Paginación obligatoria en todas las listas (máximo 100 registros por página).
- Índices de base de datos en todos los campos de búsqueda y filtrado frecuente.
- Server Components de Next.js eliminan JavaScript innecesario en el cliente (páginas más rápidas).
- Compresión GZIP automática en Railway / Next.js.
- Query optimization: Prisma `select` específico, nunca traer columnas innecesarias.
- Connection pooling de Prisma (pool interno configurable con `connection_limit`).

### 3.2 Disponibilidad

| Indicador | Objetivo |
|---|---|
| Disponibilidad objetivo | 99.5% (aproximadamente 22h de downtime al año) |
| Ventana de mantenimiento | Domingos entre 00:00 y 06:00 |
| Tiempo máximo de recuperación (RTO) | 4 horas |
| Punto máximo de pérdida de datos (RPO) | 24 horas (con backup diario) |

### 3.3 Seguridad

**Autenticación y Sesión:**
- Máximo 5 intentos de login fallidos antes de bloqueo temporal (implementado en la lógica de NextAuth).
- Bloqueo de cuenta por 15 minutos después de intentos fallidos.
- Logout: NextAuth elimina la cookie de sesión. Inmediato y sin estado externo.
- Las sesiones expiran tras 30 minutos de inactividad (configurable en `maxAge` de NextAuth).
- Contraseñas: mínimo 8 caracteres, al menos 1 mayúscula, 1 número, 1 carácter especial.

**Comunicación:**
- Todo el tráfico HTTP redirigido a HTTPS (gestionado automáticamente por Railway).
- Certificados SSL automáticos en Railway (Let's Encrypt).
- Headers de seguridad HTTP: HSTS, CSP, X-Frame-Options, X-Content-Type-Options — configurados en `next.config.ts` mediante `headers()`.

**Autorización:**
- Toda petición verificada contra la sesión de NextAuth y el rol del usuario (`admin_ti` o `usuario_final`).
- El middleware de Next.js (`middleware.ts`) protege rutas completas antes de que lleguen a cualquier código.
- Los Server Actions y Route Handlers verifican adicionalmente propiedad del recurso con `requireOwnership()`.
- Principio de mínimo privilegio: el Usuario Final solo puede acceder a sus propios equipos, incidencias y perfil. Todo lo demás devuelve 403.

**Datos Sensibles:**
- Ningún dato sensible se loguea en los logs del sistema.
- Las variables de entorno con credenciales se gestionan en Railway — nunca en el repositorio.

**API y Validaciones:**
- Rate limiting en Route Handlers con la librería `next-rate-limit` o middleware personalizado.
- Validación de inputs con Zod en todos los Server Actions y Route Handlers.
- Prevención de SQL Injection mediante Prisma (queries parametrizadas automáticas).
- Los Route Handlers de Next.js son same-origin por defecto — no hay CORS que configurar.
- Todos los IDs expuestos son UUIDs (evita enumeración de recursos).

**Infraestructura:**
- La base de datos Railway PostgreSQL no es accesible desde internet — solo la aplicación Next.js puede conectarse mediante `DATABASE_URL` privada.
- Backups automáticos de PostgreSQL gestionados por Railway.

### 3.4 Escalabilidad

**Escalabilidad Vertical (Fase 1 y 2):**
El sistema está diseñado para funcionar eficientemente en un solo servidor. Aumentar CPU/RAM del servidor es la primera estrategia de escalado.

**Escalabilidad Horizontal (si el crecimiento lo requiere):**
- Next.js en Railway escala automáticamente añadiendo más instancias. Las sesiones de NextAuth son stateless (cookie firmada) — no requieren estado compartido entre instancias.
- La base de datos puede escalarse con read replicas de PostgreSQL para distribuir consultas de lectura pesadas (reportes, dashboards).
- No hay estado en Redis que migrar — no hay acoplamiento a infraestructura de caché.

**Particionamiento de datos:**
- No se aplica particionamiento en v1.0. Una tabla `audit_logs` estándar con índices en `entityId` y `createdAt` es suficiente para la escala de CIPRIJAL. Se puede añadir particionamiento como mejora futura si el volumen lo justifica.

### 3.5 Mantenibilidad

- Cobertura de tests unitarios mínima: 70% de las clases de servicio (lógica de negocio crítica).
- Cobertura de tests de integración: al menos los flujos principales (registro de activo, asignación, baja).
- API documentada con Swagger y mantenida actualizada.
- Mensajes de error descriptivos en español para el usuario final.
- Logs estructurados en formato JSON para facilitar análisis con herramientas de observabilidad.
- Variables de configuración externalizadas (sin hardcode de valores de negocio en el código).
- Migrations de base de datos versionadas y reversibles.

### 3.6 Recuperación ante Desastres

**Estrategia de Backup:**
- Backup automático de PostgreSQL diariamente a las 02:00 AM.
- Retención de backups: 7 diarios, 4 semanales, 12 mensuales.
- Backup de archivos adjuntos: sincronización diaria a ubicación secundaria.
- Prueba de restauración de backup: mensualmente (proceso documentado).

**Procedimiento de Recuperación:**
- Script documentado de restauración del sistema completo desde cero.
- Tiempo estimado de restauración completa: < 4 horas.
- Checklist de verificación post-restauración.

---

## 4. API REST — CONVENCIONES

### 4.1 Estructura de URLs

```
/api/v1/{recurso}                    → Colección
/api/v1/{recurso}/{id}               → Recurso individual
/api/v1/{recurso}/{id}/{subrecurso}  → Subrecurso relacionado
```

Ejemplos:
```
GET    /api/v1/assets                     → Listar activos (paginado, con filtros)
POST   /api/v1/assets                     → Crear activo
GET    /api/v1/assets/:id                 → Obtener activo
PATCH  /api/v1/assets/:id                 → Actualizar campos del activo
DELETE /api/v1/assets/:id                 → Dar de baja lógicamente (no eliminar)
GET    /api/v1/assets/:id/assignments     → Historial de asignaciones del activo
GET    /api/v1/assets/:id/maintenances    → Historial de mantenimientos
POST   /api/v1/assets/:id/assign          → Asignar activo
POST   /api/v1/assets/:id/decommission    → Solicitar baja del activo
```

### 4.2 Respuestas Estándar

**Éxito (colección):**
```json
{
  "data": [...],
  "meta": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "totalPages": 63
  }
}
```

**Éxito (recurso individual):**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "El número de serie SNX-12345 ya existe en el sistema",
  "timestamp": "2026-06-25T14:30:00Z",
  "path": "/api/v1/assets"
}
```

### 4.3 Filtros, Ordenamiento y Paginación

Todos los endpoints de colección soportan:
```
GET /api/v1/assets?page=1&limit=20&sort=createdAt&order=desc&status=active&category=laptop&search=dell
```

---

## 5. ESTRUCTURA DE DIRECTORIOS DEL PROYECTO

Proyecto único Next.js. No hay carpetas `backend/` ni `frontend/` separadas — todo convive en la misma raíz.

```
ciprijal-activos-ti/
├── prisma/
│   ├── schema.prisma             → Modelos de datos (fuente de verdad del schema)
│   └── migrations/               → Historial versionado de migraciones
│
├── src/
│   ├── app/                      → Next.js App Router
│   │   ├── layout.tsx            → Layout raíz
│   │   ├── (auth)/login/         → Ruta pública de autenticación
│   │   ├── (dashboard)/          → Grupo de rutas protegidas
│   │   │   ├── layout.tsx        → Layout con sidebar + verificación de sesión
│   │   │   ├── dashboard/
│   │   │   ├── assets/
│   │   │   ├── assignments/
│   │   │   ├── incidents/
│   │   │   ├── maintenance/
│   │   │   ├── reports/
│   │   │   ├── alerts/
│   │   │   ├── audit/
│   │   │   ├── admin/
│   │   │   └── profile/
│   │   └── api/                  → Route Handlers
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── assets/route.ts
│   │       ├── assets/[id]/route.ts
│   │       ├── assignments/route.ts
│   │       ├── incidents/route.ts
│   │       └── reports/[type]/route.ts
│   │
│   ├── components/
│   │   ├── ui/                   → Componentes shadcn/ui (código propio)
│   │   └── features/             → Componentes por módulo de negocio
│   │
│   ├── server/
│   │   ├── actions/              → Server Actions (mutaciones)
│   │   ├── queries/              → Funciones de lectura server-side
│   │   └── services/             → Lógica de negocio reutilizable
│   │
│   ├── lib/
│   │   ├── prisma.ts             → Singleton Prisma Client
│   │   ├── auth.ts               → Configuración NextAuth.js
│   │   └── utils.ts
│   │
│   ├── middleware.ts             → Protección de rutas (sesión + rol)
│   └── types/                   → Tipos TypeScript compartidos
│
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .github/
    └── workflows/
        └── ci.yml               → Lint, typecheck, tests en cada PR
```

---

## 6. INTEGRACIONES EXTERNAS

### 6.1 Email (SMTP)

**Propósito:** Envío de notificaciones y alertas.
**Implementación:** Nodemailer en un Route Handler de Next.js. Configuración SMTP externa (servidor de correo corporativo de CIPRIJAL, Gmail, o cualquier proveedor SMTP).
**Manejo de fallos:** Si el envío falla, el error se registra en los logs del servidor y la notificación queda en estado "pendiente" en la base de datos para visualización en el panel de alertas. No hay cola de reintentos en v1.0.

### 6.2 LDAP / Active Directory (Fase 3)

**Propósito:** Autenticación corporativa y sincronización de usuarios/estructura organizacional.  
**Implementación:** Librería `ldapts` para Node.js. Modo mixto: los usuarios pueden autenticarse con credenciales locales O con sus credenciales de dominio corporativo.

### 6.3 Futuras Integraciones (Roadmap, sin fecha comprometida)

- **ERP / Contabilidad (MF-03, MF-12):** Exportación de datos de depreciación y TCO al sistema contable. Requiere que el módulo financiero esté implementado primero.
- **ITSM (Service Management):** Integración con herramientas como Jira Service Management o Freshservice para sincronizar tickets de mantenimiento.
- **Monitoreo de Red (MF-09):** Integración con herramientas de network scanning (Nmap, Lansweeper) para descubrimiento automático de activos.
- **Active Directory / LDAP (MF-05):** Autenticación corporativa y sincronización de usuarios.

---

## 7. OBSERVABILIDAD

### 7.1 Logging

- **Niveles:** ERROR, WARN, INFO, DEBUG (configurable por entorno).
- **Formato:** JSON estructurado con campos: timestamp, level, message, context, userId, requestId, duration.
- **Almacenamiento:** Archivos locales con rotación diaria. Retención: 90 días.
- **Futuro:** Envío a stack ELK (Elasticsearch + Logstash + Kibana) o Grafana Loki si el volumen lo requiere.

### 7.2 Métricas

- Endpoint `/api/health` para verificación de estado del sistema.
- Endpoint `/api/metrics` con métricas de Prometheus (requests/seg, latencia p95/p99, errores, uso de memoria).
- Futuro: Dashboard en Grafana.

---

## 8. ENTORNOS

| Entorno | Propósito | Base de Datos | Dominio |
|---|---|---|---|
| Development | Desarrollo local | PostgreSQL local (Docker) | localhost |
| Staging | Pruebas de integración y UAT | PostgreSQL en servidor de pruebas | staging.ciprijal.internal |
| Production | Operación real | PostgreSQL en servidor de producción | activos.ciprijal.internal |

**Variables de entorno por entorno:**
- `DATABASE_URL`: Connection string de PostgreSQL (provista automáticamente por Railway en producción)
- `NEXTAUTH_SECRET`: Secreto para firmar las cookies de sesión de NextAuth (mínimo 32 caracteres)
- `NEXTAUTH_URL`: URL base de la aplicación (ej: `https://activos.ciprijal.com`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Configuración de email
- `STORAGE_PATH`: Ruta local de almacenamiento de archivos adjuntos

---

## 9. REQUERIMIENTOS DE INFRAESTRUCTURA (PRODUCCIÓN)

El sistema se despliega en Railway (PaaS). No se gestiona hardware propio.

| Componente | Recurso Railway |
|---|---|
| Aplicación Next.js | Servicio "Next.js" — Railway auto-detecta y construye desde el repositorio |
| Base de datos | Servicio "PostgreSQL" administrado por Railway — backups automáticos incluidos |
| SSL / Dominio | Dominio custom configurable en Railway con SSL automático |
| Escala inicial | Plan Starter de Railway es suficiente para hasta ~50 usuarios concurrentes |

**Desarrollo local (sin Railway):**
- Node.js 20 LTS instalado localmente.
- PostgreSQL 15 local (o via Docker: `docker run -p 5432:5432 postgres:15`).
- Variables de entorno en `.env.local` (nunca commiteado al repositorio).

### Servidor Recomendado (hasta 200 usuarios)

| Componente | Especificación recomendada |
|---|---|
| CPU | 8 vCPU / cores |
| RAM | 16 GB |
| Almacenamiento SO | 100 GB SSD |
| Almacenamiento Datos | 500 GB SSD NVMe |
| Red | 1 Gbps |
| SO | Ubuntu Server 22.04 LTS |
| Backup | Disco externo o NAS para backups |

> **Nota:** Estos requerimientos son para instalación on-premise. Si CIPRIJAL prefiere infraestructura en la nube, se puede adaptar a AWS, Azure o cualquier proveedor con especificaciones equivalentes.
