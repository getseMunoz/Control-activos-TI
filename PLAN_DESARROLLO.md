# PLAN DE DESARROLLO
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.1  
**Fecha:** 2026-06-25  
**Cronograma oficial:** Julio 2026 — Noviembre 2026

---

## 1. METODOLOGÍA

Se adopta **Scrum adaptado** con sprints de 2 semanas porque:

- El equipo es pequeño (1-3 desarrolladores).
- Se requieren entregas incrementales con validaciones del equipo de TI de CIPRIJAL.
- El cronograma de 5 meses exige ritmo constante con entregables visibles.

**Ceremonias mínimas:**
- Planificación de sprint: inicio de cada sprint (2h).
- Demo y revisión: fin de cada sprint con el equipo de TI de CIPRIJAL (1h).
- Retrospectiva: fin de cada sprint (30min, solo el equipo técnico).

**Definition of Done por historia:**
- Código escrito y revisado (code review).
- Tests unitarios escritos y pasando para lógica de negocio crítica.
- Funcionalidad probada manualmente en el entorno de desarrollo.
- Sin errores de linting ni de TypeScript (`tsc --noEmit` en verde).
- Mergeado a la rama `develop`.

---

## 2. EQUIPO MÍNIMO RECOMENDADO

| Rol | Dedicación | Responsabilidad |
|---|---|---|
| Tech Lead / Arquitecto | 100% | Decisiones técnicas, revisión de código, backend core |
| Desarrollador Full-Stack Senior | 100% | Backend + Frontend módulos de negocio |
| Desarrollador Full-Stack Junior/Mid | 100% | Frontend, tests, APIs secundarias |
| Stakeholder TI CIPRIJAL | 10% | Validación funcional en demos de sprint |

**Equipo mínimo viable:** 2 desarrolladores Full-Stack (no recomendado, impacta los plazos).

---

## 3. CRONOGRAMA OFICIAL — JULIO A NOVIEMBRE 2026

```
JULIO              AGOSTO             SEPTIEMBRE         OCTUBRE            NOVIEMBRE
├─── Fase 0 ───┤├────── Fase 1 ──────┤├──── Fase 2 ────┤├──── Fase 3 ────┤├─── Fase 4 ───┤
S1   S2   S3   S4   S5   S6   S7   S8   S9  S10  S11  S12  S13  S14  S15  S16  S17  S18  S19  S20
[F] [F] [I1] [I1] [I2] [I2] [A1] [A1] [A2] [A2] [R1] [R1] [R2] [R2] [Q1] [Q1] [Q2] [Q2] [D]  [D]

F  = Fundamentos       A  = Asignaciones e Incidencias     Q  = Calidad y UAT
I  = Inventario        R  = Alertas y Reportes             D  = Despliegue y Go-Live
```

**Fechas clave:**

| Hito | Fecha objetivo |
|---|---|
| Inicio del proyecto | 1 julio 2026 |
| Sistema base con login funcional | 14 julio 2026 |
| Inventario de hardware operativo | 11 agosto 2026 |
| Asignaciones e incidencias completas | 8 septiembre 2026 |
| Alertas, reportes y dashboard completos | 6 octubre 2026 |
| Inicio de pruebas UAT | 7 octubre 2026 |
| Sistema listo para producción | 17 noviembre 2026 |
| **Go-Live (entrada en operación real)** | **24 noviembre 2026** |

---

## 4. FASES DE DESARROLLO

### FASE 0 — FUNDAMENTOS
**Período:** 1 julio – 14 julio 2026 (Semanas 1–2)  
**Objetivo:** Infraestructura técnica lista para que el desarrollo de módulos de negocio pueda comenzar.

**Tareas:**
- [ ] Configurar repositorio Git con estructura de ramas (main, develop, feature/*, hotfix/*).
- [ ] Configurar pipeline CI/CD (GitHub Actions): lint + type check + tests en cada PR.
- [ ] Inicializar proyecto Next.js 14 con App Router, TypeScript estricto, ESLint, Prettier y Husky.
- [ ] Instalar y configurar Tailwind CSS + shadcn/ui (componentes base: Button, Input, Table, Form, Dialog).
- [ ] Configurar Prisma ORM: `schema.prisma` con todos los modelos, migración inicial.
- [ ] Configurar NextAuth.js: proveedor de credenciales (email + contraseña bcrypt), sesión en cookie.
- [ ] Implementar `middleware.ts` de Next.js para protección de rutas por rol.
- [ ] Implementar funciones `requireAdminTI()` y `requireOwnership()` en `lib/auth.ts`.
- [ ] Crear migración inicial con todas las tablas del modelo de datos.
- [ ] Layout base del frontend: App Router groups `(auth)` y `(dashboard)`, sidebar de navegación.
- [ ] Configurar proyecto en Railway: servicio Next.js + PostgreSQL administrado, variables de entorno.
- [ ] Script de seed: 1 Administrador TI inicial + 3 localidades de prueba.

**Entregable:** Sistema con login funcional, roles operativos y despliegue en Railway configurado.

**Criterio de éxito:** `npm run dev` levanta el sistema localmente. Un Administrador TI puede autenticarse y navegar. El deploy a Railway en push a `main` funciona automáticamente.

---

### FASE 1 — INVENTARIO DE HARDWARE
**Período:** 15 julio – 11 agosto 2026 (Semanas 3–6)

#### Sprint 1 (15 julio – 28 julio): Registro de equipos

**Server (Next.js Route Handlers + Server Actions):**
- [ ] Route Handlers CRUD de activos: `GET /api/assets`, `POST /api/assets`, `GET /api/assets/[id]`, `PATCH /api/assets/[id]`, `DELETE /api/assets/[id]`.
- [ ] Validación con Zod: número de serie obligatorio — el Server Action rechaza el formulario si está vacío.
- [ ] Unicidad del número de serie: validación en Prisma (`@unique`) + verificación previa en el servicio con error descriptivo.
- [ ] Verificación de `requireAdminTI()` en todos los endpoints de escritura de activos (POST/PATCH/DELETE devuelven 403 para `usuario_final`).
- [ ] Generación automática del código interno (HW-AAAA-NNNN, secuencial por año).
- [ ] Búsqueda y filtros en listado de activos con Prisma (`where` dinámico por tipo, estado, localidad, texto libre).
- [ ] Registro automático en `audit_logs` en toda operación de creación, edición y baja.
- [ ] Campo `specs` (JSONB) para especificaciones técnicas variables por tipo de activo.
- [ ] CRUD de localidades (Route Handlers protegidos para `admin_ti`).
- [ ] CRUD de usuarios del sistema.

**Frontend (Server + Client Components):**
- [ ] Listado de activos: Server Component con tabla (shadcn/ui Table), filtros, paginación y búsqueda.
- [ ] Formulario de creación de activo: campos dinámicos según tipo seleccionado (Client Component).
- [ ] Vista de detalle del activo: tabs de Información, Historial de estados y Documentos (Server Component).
- [ ] Formulario de edición de activo — solo visible para Administrador TI.
- [ ] Gestión de localidades y usuarios en módulo de Administración.

#### Sprint 2 (29 julio – 11 agosto): Estados y gestión de usuarios

**Backend:**
- [ ] Endpoint de cambio de estado del activo con validación de transiciones permitidas.
- [ ] Historial de estados del activo (cada transición queda registrada).
- [ ] CRUD de usuarios del sistema (solo Administrador TI puede crear/editar usuarios).
- [ ] Activar/desactivar usuarios. Cambio de rol (admin_ti ↔ usuario_final).
- [ ] Endpoints de cambio de contraseña y reset de contraseña.
- [ ] Perfil del usuario autenticado (ambos roles pueden ver y editar su propio perfil).

**Frontend:**
- [ ] Cambio de estado desde el detalle del activo (modal de confirmación + motivo obligatorio).
- [ ] Historial de estados visible en la pestaña de historial.
- [ ] Módulo de Administración: gestión de usuarios (crear, editar, activar/desactivar, asignar rol).
- [ ] Página de perfil de usuario.
- [ ] Dashboard operativo con contadores: activos por estado, activos por tipo de hardware.

**Entregable Fase 1:** El Administrador TI puede registrar, consultar, filtrar y gestionar el ciclo de vida de todos los equipos de hardware de CIPRIJAL.

---

### FASE 2 — ASIGNACIONES E INCIDENCIAS
**Período:** 12 agosto – 8 septiembre 2026 (Semanas 7–10)

#### Sprint 3 (12 agosto – 25 agosto): Asignaciones con firma digital

**Server (Server Actions + Route Handlers):**
- [ ] Server Action de creación de asignación: valida activo en estado `registered`/`in_storage`, usuario activo, y que no haya asignación activa.
- [ ] Constraint de asignación única activa: índice parcial `UNIQUE ON asset_id WHERE returned_at IS NULL` + verificación en servicio.
- [ ] Server Action de devolución: cierra asignación, registra condición de retorno, cambia estado del activo a `in_storage`.
- [ ] Historial de asignaciones: inmutable, solo lectura.
- [ ] Generación del acta de resguardo PDF en el servidor (react-pdf o similar).
- [ ] Server Action de firma digital: registra `signed_at = NOW()` y `signature_ip` desde los headers de la petición.
- [ ] Alerta automática al Administrador TI cuando se desactiva un usuario con asignaciones activas.

**Frontend (Server + Client Components):**
- [ ] Modal de asignación: buscar usuario, seleccionar condición del activo y accesorios incluidos.
- [ ] Modal de devolución: registrar condición de retorno y observaciones.
- [ ] Tabla de asignaciones activas con filtros (Server Component con filtros URL).
- [ ] Vista "Mis Equipos" para el Usuario Final (Server Component — filtra por `userId` de la sesión).
- [ ] Flujo de firma de acta: visualizar PDF en iframe → casilla de aceptación → botón confirmar (Client Component).
- [ ] Descarga del acta firmada para Administrador TI y Usuario Final receptor.
- [ ] Historial de asignaciones en la ficha del activo.

#### Sprint 4 (26 agosto – 8 septiembre): Incidencias y mantenimiento

**Backend:**
- [ ] CRUD de incidencias (creadas por Usuario Final sobre sus equipos asignados, o por Admin TI).
- [ ] Validación: Usuario Final solo puede crear incidencias sobre activos que tenga asignados en ese momento.
- [ ] Estados de incidencia: Abierta → En revisión → En proceso → Resuelta / Cerrada.
- [ ] CRUD de órdenes de trabajo de mantenimiento (preventivo y correctivo).
- [ ] Generación de número de OT (OT-YYYY-NNNN).
- [ ] Vínculo entre incidencia y orden de trabajo (una OT puede originarse de una incidencia).
- [ ] Cambio de estado del activo al crear OT (pasa a "En Mantenimiento").
- [ ] Programación de mantenimientos preventivos por activo (fecha y descripción del trabajo).
- [ ] Cierre de OT: registro de resultado, costo del mantenimiento, descripción del trabajo realizado.
- [ ] Notificación al Usuario Final cuando su incidencia es resuelta.

**Frontend:**
- [ ] Vista "Mis Incidencias" para Usuario Final: historial y estado de sus reportes.
- [ ] Formulario de nueva incidencia para Usuario Final: solo muestra sus equipos asignados.
- [ ] Módulo de Incidencias para Admin TI: listado con filtros, detalle, gestión de estado.
- [ ] Módulo de Mantenimiento para Admin TI: listado de OTs, creación, detalle, cierre.
- [ ] Formulario de cierre de OT: resultado, costo y descripción.
- [ ] Programación de mantenimientos preventivos por activo.

**Entregable Fase 2:** Los empleados pueden reportar fallas desde el sistema. El Administrador TI gestiona el ciclo completo de asignaciones, devolucion e incidencias.

---

### FASE 3 — ALERTAS Y REPORTES
**Período:** 9 septiembre – 6 octubre 2026 (Semanas 11–14)

#### Sprint 5 (9 septiembre – 22 septiembre): Sistema de alertas

**Backend:**
- [ ] Motor de alertas: job diario que evalúa condiciones y genera alertas en `alert_instances`.
- [ ] Alerta: vencimiento de garantía de activo (90, 60 y 30 días antes).
- [ ] Alerta: mantenimiento preventivo próximo (15 y 7 días antes).
- [ ] Alerta: mantenimiento preventivo vencido (día del vencimiento).
- [ ] Alerta: activo con 3 mantenimientos correctivos en 6 meses → recomendación de baja.
- [ ] Alerta: activo sin movimiento de inventario > 12 meses.
- [ ] Alerta: empleado desactivado con activos asignados (inmediata).
- [ ] Alerta: nueva incidencia reportada por Usuario Final (inmediata).
- [ ] Integración con email: Nodemailer para envío de notificaciones (síncrono en Route Handler).
- [ ] Posponer alerta (con justificación obligatoria) y marcar como leída.
- [ ] Configuración de umbrales de alerta desde Administración.

**Frontend:**
- [ ] Panel de alertas para Administrador TI: listado, severidad, posponer, resolver.
- [ ] Campana de notificaciones en el header con contador de alertas activas.
- [ ] Notificación al Usuario Final cuando una alerta afecta sus propios equipos.

#### Sprint 6 (23 septiembre – 6 octubre): Reportes, dashboard y QR

**Backend:**
- [ ] Generación de reportes en PDF (pdfkit o Puppeteer).
- [ ] Generación de reportes en Excel (ExcelJS).
- [ ] Exportación a CSV de cualquier listado.
- [ ] Generación de reportes en Route Handler síncrono (suficiente para el volumen de CIPRIJAL).
- [ ] Endpoints de KPIs para el dashboard (queries directas a Prisma, sin caché en v1.0).
- [ ] Generación de código QR por activo (codifica el código interno).
- [ ] Endpoint de log de auditoría con filtros avanzados (usuario, acción, entidad, rango de fechas).

**Reportes incluidos en v1.0:**

| Reporte | Filtros | Formatos |
|---|---|---|
| Inventario completo de hardware | Tipo, estado, ubicación, fecha | PDF, Excel, CSV |
| Activos asignados por usuario | Usuario, tipo, fecha | PDF, Excel |
| Historial completo de un activo | Código interno | PDF |
| Órdenes de mantenimiento | Estado, tipo, período | PDF, Excel |
| Incidencias por período | Estado, usuario, tipo de hardware | PDF, Excel |
| Activos dados de baja | Período, motivo, tipo | PDF, Excel |
| Activos próximos a vencer garantía | Rango de fechas | PDF, Excel |

**Frontend:**
- [ ] Dashboard ejecutivo: contadores de activos por estado y tipo, alertas activas, últimas asignaciones, últimos mantenimientos.
- [ ] Centro de reportes: selección de tipo, filtros y formato de exportación.
- [ ] Indicador de progreso durante generación del reporte (spinner en Client Component).
- [ ] Generación y descarga de etiqueta con código QR del activo (formato de tarjeta imprimible).
- [ ] Módulo de auditoría: tabla con filtros completos, paginada.

**Entregable Fase 3:** El sistema tiene visibilidad completa con alertas proactivas, reportes exportables y dashboard operativo.

---

### FASE 4 — CALIDAD, DESPLIEGUE Y GO-LIVE
**Período:** 7 octubre – 30 noviembre 2026 (Semanas 15–22)

#### Sprint 7 (7 octubre – 20 octubre): Pruebas y hardening

- [ ] Pruebas de carga: simular 200 usuarios concurrentes (k6 o Artillery).
- [ ] Revisión de seguridad: validar OWASP Top 10, verificar que `usuario_final` no puede acceder a endpoints restringidos.
- [ ] Prueba exhaustiva del guard de ownership: intentar acceder a activos ajenos desde cuenta de Usuario Final.
- [ ] Optimización de queries lentas detectadas en pruebas de carga.
- [ ] Cobertura de tests unitarios ≥ 70% en servicios de negocio críticos.
- [ ] Tests de integración: flujos principales (registro de activo, asignación con firma, reporte de incidencia, mantenimiento).
- [ ] Pruebas de UAT (User Acceptance Testing) con el equipo de TI de CIPRIJAL.
- [ ] Prueba de restauración de backup (simular recuperación completa desde cero).

#### Sprint 8 (21 octubre – 3 noviembre): Correcciones post-UAT y documentación

- [ ] Correcciones y ajustes identificados en UAT.
- [ ] Ajustes de UX/usabilidad reportados por los usuarios en UAT.
- [ ] Manual de usuario para Administrador TI (operaciones más frecuentes).
- [ ] Manual de usuario para Usuario Final (firmar acta, reportar incidencia, ver mis equipos).
- [ ] Runbook de operación del sistema (backups, actualizaciones, resolución de problemas comunes).
- [ ] Documentación de los Route Handlers y Server Actions en comentarios inline y en CASOS_USO.md.

#### Sprint 9 (4 noviembre – 17 noviembre): Setup de producción y migración de datos

- [ ] Configuración del entorno de producción en Railway: variables de entorno, PostgreSQL administrado, SSL automático, dominio personalizado.
- [ ] El despliegue a producción es automático en Railway (push a `main` → Railway auto-deploy). Verificar que el pipeline CI/CD pasa antes del Go-Live.
- [ ] Configuración de backups automáticos diarios con retención de 30 días para el inicio.
- [ ] Carga inicial de datos: importación del inventario existente de CIPRIJAL (si hay datos en Excel u hojas de cálculo).
- [ ] Validación de datos importados: verificar unicidad de números de serie, consistencia de estados.
- [ ] Entrenamiento al equipo de TI de CIPRIJAL (sesión de 2-3 horas).
- [ ] Entrenamiento a muestra de Usuarios Finales (sesión de 30 minutos: firmar acta y reportar incidencia).
- [ ] Verificación final del sistema en producción con datos reales.

#### Sprint 10 (18 noviembre – 30 noviembre): Go-Live y estabilización

- [ ] **Go-Live oficial: 24 noviembre 2026.**
- [ ] Primera semana de operación con soporte activo del equipo de desarrollo.
- [ ] Monitoreo intensivo: revisar logs diariamente, verificar alertas del sistema.
- [ ] Canal de reporte de problemas para el equipo de TI de CIPRIJAL durante la primera semana.
- [ ] Cierre formal del proyecto: entrega de accesos, credenciales, documentación y código fuente.

**Entregable Fase 4:** Sistema en producción, operando con datos reales de CIPRIJAL, con el equipo capacitado.

---

## 5. GESTIÓN DE RIESGOS

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Pérdida de datos en producción | Baja | Crítico | Backups diarios automáticos + prueba de restauración en Sprint 7 |
| Usuario Final accede a recursos ajenos | Baja | Alto | Ownership guard implementado desde Fase 0, probado exhaustivamente en Sprint 7 |
| Rendimiento insuficiente | Baja | Medio | Índices correctos desde Fase 1, pruebas de carga en Sprint 7 |
| Falla del servidor en producción | Baja | Alto | Runbook de recuperación documentado, RTO < 4h |
| Datos de importación iniciales sucios | Alta | Medio | Proceso formal de limpieza y validación en Sprint 9 |

### Riesgos de Proyecto

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Cambio de requisitos durante el desarrollo | Media | Alto | Cambios grandes van al backlog post v1.0. El alcance de v1.0 está congelado. |
| Disponibilidad del stakeholder de CIPRIJAL | Media | Medio | Demos agendadas con anticipación. Decisiones documentadas por escrito. |
| Subestimación de complejidad | Media | Medio | Buffer de 2 semanas en el cronograma (Sprints 9-10 tienen holgura). |
| Rotación del equipo de desarrollo | Baja | Alto | Documentación técnica al día. Código legible sin dependencia de conocimiento implícito. |

### Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Baja adopción por resistencia al cambio | Media | Alto | Involucrar usuarios en demos. Entrenamiento. La firma digital de actas es un incentivo concreto. |
| Inventario existente desactualizado o incompleto | Alta | Medio | El proceso de carga inicial es también un proceso de depuración del inventario. |

---

## 6. DEPENDENCIAS ENTRE FASES

```
Fase 0 (Fundamentos: Auth, Base, Railway)
    │
    └── Fase 1 (Inventario de Hardware)
            │
            └── Fase 2 (Asignaciones + Incidencias)
                    │
                    └── Fase 3 (Alertas + Reportes + Dashboard)
                                │
                                └── Fase 4 (Calidad + Despliegue + Go-Live)
```

**Dependencias críticas:**
- El módulo de usuarios (Fase 0) es prerequisito de todos los demás módulos.
- El módulo de inventario (Fase 1) es prerequisito de asignaciones e incidencias (Fase 2).
- Las asignaciones (Fase 2) son prerequisito de las alertas de empleado desactivado (Fase 3).
- Los mantenimientos (Fase 2) son prerequisito de las alertas de mantenimiento vencido (Fase 3).

---

## 7. ESTÁNDARES DE CÓDIGO

### Convención de Ramas Git

```
main              → Código en producción. Solo acepta merges de release/*.
develop           → Rama de integración.
feature/NNN-desc  → Funcionalidad nueva (NNN = número de tarea).
bugfix/NNN-desc   → Corrección de bug.
hotfix/NNN-desc   → Corrección urgente que va directo a main.
release/vX.Y.Z    → Preparación de release. Sale de develop, va a main.
```

### Convención de Commits (Conventional Commits)

```
feat(assets): enforce mandatory serial number on hardware registration
fix(auth): resolve ownership guard not filtering user_final correctly
test(assignments): add integration test for digital signature flow
chore(deps): update Prisma to 5.x and regenerate client
```

### Estándares de Testing

- Los tests unitarios van junto al archivo que prueban: `assets.service.spec.ts`.
- Los tests de integración van en `test/` en la raíz del backend.
- Cada historia de usuario requiere al menos: 1 test del happy path, 1 test del caso de error principal.
- El guard de ownership del `usuario_final` debe tener tests explícitos de denegación de acceso.

---

## 8. CRITERIOS DE ACEPTACIÓN DEL PROYECTO

El proyecto v1.0 se considera exitoso cuando:

1. El Administrador TI puede registrar el 100% de los equipos de hardware con número de serie único.
2. Todo activo registrado tiene un estado definido y una ubicación asignada.
3. Los activos asignados a empleados tienen acta de resguardo firmada digitalmente.
4. Los Usuarios Finales pueden reportar incidencias sobre sus equipos desde el sistema.
5. El Administrador TI gestiona el ciclo completo de mantenimiento (OT creada, ejecutada, cerrada).
6. Las alertas de vencimiento de garantía y mantenimiento preventivo funcionan y envían emails.
7. El sistema genera reportes de inventario exportables (PDF/Excel/CSV).
8. El log de auditoría registra todas las operaciones del sistema.
9. Un Usuario Final no puede acceder a recursos que no le pertenecen (probado en Sprint 7).
10. El sistema opera 30 días consecutivos en producción sin intervención técnica.
