# PRODUCT BACKLOG
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

---

## CONVENCIONES

**Prioridades:**
- 🔴 **Crítica** — Sin esto el sistema no puede operar.
- 🟠 **Alta** — Valor de negocio inmediato. Debe entrar en v1.0.
- 🟡 **Media** — Mejora significativa pero no bloquea el uso.
- 🟢 **Baja** — Deseable. Entra si hay tiempo.

**Estimación (puntos de historia):** 1 (trivial) · 2 · 3 · 5 · 8 · 13 (compleja)

**Estados:** `pendiente` · `en_progreso` · `completado`

---

## ÉPICA 1: AUTENTICACIÓN Y ACCESO

**Objetivo:** Permitir que los usuarios entren al sistema de forma segura y accedan solo a lo que les corresponde.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-01 | Como Administrador TI, quiero iniciar sesión con mi email y contraseña para acceder al sistema. | 🔴 | 3 | — |
| HU-02 | Como Usuario Final, quiero iniciar sesión con mi email y contraseña para ver mis equipos. | 🔴 | 1 | HU-01 |
| HU-03 | Como sistema, quiero bloquear una cuenta tras 5 intentos fallidos consecutivos por 15 minutos para prevenir fuerza bruta. | 🔴 | 2 | HU-01 |
| HU-04 | Como sistema, quiero redirigir automáticamente a `/login` cualquier petición sin sesión válida. | 🔴 | 2 | HU-01 |
| HU-05 | Como sistema, quiero que el Administrador TI no pueda acceder a rutas de Usuario Final exclusivas, y viceversa, devolviendo 403. | 🔴 | 3 | HU-01 |
| HU-06 | Como cualquier usuario, quiero cerrar sesión para terminar mi sesión de forma segura. | 🟠 | 1 | HU-01 |
| HU-07 | Como usuario nuevo, quiero ser obligado a cambiar mi contraseña en el primer inicio de sesión. | 🟡 | 2 | HU-01 |
| HU-08 | Como cualquier usuario, quiero cambiar mi contraseña desde mi perfil ingresando la contraseña actual. | 🟠 | 2 | HU-01 |

---

## ÉPICA 2: GESTIÓN DE USUARIOS

**Objetivo:** El Administrador TI puede administrar completamente las cuentas del sistema.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-09 | Como Administrador TI, quiero crear usuarios con nombre, email, rol, puesto, teléfono, modalidad y localidad. | 🔴 | 3 | HU-01 |
| HU-10 | Como Administrador TI, quiero editar los datos de cualquier usuario. | 🟠 | 2 | HU-09 |
| HU-11 | Como Administrador TI, quiero desactivar un usuario que ya no labora en la empresa. | 🟠 | 3 | HU-09 |
| HU-12 | Como sistema, quiero impedir la desactivación de un usuario con asignaciones activas, mostrando la lista de equipos pendientes. | 🔴 | 3 | HU-11, HU-28 |
| HU-13 | Como Administrador TI, quiero ver el listado de todos los usuarios con filtros por rol, estado y localidad. | 🟠 | 2 | HU-09 |
| HU-14 | Como cualquier usuario, quiero ver y editar mi propio perfil (nombre, teléfono). | 🟠 | 2 | HU-01 |

---

## ÉPICA 3: LOCALIDADES

**Objetivo:** Administrar el catálogo de localidades operativas de CIPRIJAL.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-15 | Como Administrador TI, quiero crear, editar y desactivar localidades (ciudades/estados donde opera CIPRIJAL). | 🟠 | 2 | HU-01 |
| HU-16 | Como sistema, quiero impedir desactivar una localidad que tenga equipos o usuarios activos asociados. | 🟠 | 2 | HU-15 |

---

## ÉPICA 4: INVENTARIO DE HARDWARE

**Objetivo:** Control completo del catálogo de activos de hardware de CIPRIJAL.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-17 | Como Administrador TI, quiero registrar un equipo con tipo (6 tipos), nombre, número de serie obligatorio, marca, modelo y condición. | 🔴 | 5 | HU-01, HU-15 |
| HU-18 | Como sistema, quiero rechazar el registro de un equipo sin número de serie mostrando un error claro. | 🔴 | 1 | HU-17 |
| HU-19 | Como sistema, quiero rechazar el registro de un equipo con un número de serie duplicado. | 🔴 | 1 | HU-17 |
| HU-20 | Como sistema, quiero generar automáticamente el código interno (HW-AAAA-NNNN) al registrar un activo. | 🔴 | 2 | HU-17 |
| HU-21 | Como Administrador TI, quiero registrar especificaciones técnicas adicionales por tipo de equipo (CPU, RAM, IMEI, etc.) en un campo flexible. | 🟠 | 3 | HU-17 |
| HU-22 | Como Administrador TI, quiero editar los datos de un activo existente. | 🟠 | 2 | HU-17 |
| HU-23 | Como Administrador TI, quiero ver el listado de activos con filtros por tipo, estado, localidad y búsqueda por texto. | 🔴 | 5 | HU-17 |
| HU-24 | Como Administrador TI, quiero ver el detalle completo de un activo (información, historial de estados, asignaciones, mantenimientos, incidencias, documentos). | 🟠 | 5 | HU-17 |
| HU-25 | Como Administrador TI, quiero cambiar el estado de un activo (entre: registrado, en almacén, asignado, en mantenimiento, dado de baja) con confirmación y motivo. | 🔴 | 3 | HU-17 |
| HU-26 | Como Administrador TI, quiero dar de baja un activo con motivo obligatorio. El activo no debe poder eliminarse si tiene asignación activa. | 🔴 | 3 | HU-17, HU-28 |
| HU-27 | Como Administrador TI, quiero adjuntar documentos (facturas, manuales, fotografías) a un activo. | 🟡 | 3 | HU-17 |

---

## ÉPICA 5: ASIGNACIONES Y CUSTODIA

**Objetivo:** Control formal de a quién pertenece cada equipo, con acta y firma digital.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-28 | Como Administrador TI, quiero asignar un equipo a un usuario seleccionando condición y accesorios incluidos. | 🔴 | 5 | HU-17, HU-09 |
| HU-29 | Como sistema, quiero impedir que un activo tenga dos asignaciones activas simultáneamente. | 🔴 | 2 | HU-28 |
| HU-30 | Como sistema, quiero generar automáticamente el acta de resguardo en PDF al crear una asignación. | 🔴 | 5 | HU-28 |
| HU-31 | Como Usuario Final, quiero visualizar el acta de resguardo de mi equipo y firmarlo digitalmente con una casilla de aceptación. | 🔴 | 5 | HU-30 |
| HU-32 | Como sistema, quiero registrar la firma digital con fecha/hora UTC, IP del firmante e ID de sesión. | 🔴 | 2 | HU-31 |
| HU-33 | Como Administrador TI, quiero registrar la devolución de un equipo indicando condición de retorno. | 🔴 | 3 | HU-28 |
| HU-34 | Como Administrador TI, quiero ver el historial completo de asignaciones de un activo. | 🟠 | 2 | HU-28 |
| HU-35 | Como Usuario Final, quiero ver la lista de equipos que tengo asignados actualmente. | 🔴 | 2 | HU-28 |
| HU-36 | Como cualquier usuario, quiero descargar el acta de resguardo de mis propios equipos. | 🟠 | 2 | HU-30 |
| HU-37 | Como Administrador TI, quiero ver el listado de todas las asignaciones activas con filtros por usuario, tipo de equipo y fecha. | 🟠 | 3 | HU-28 |

---

## ÉPICA 6: INCIDENCIAS

**Objetivo:** Canal formal para que los usuarios reporten fallas y el Administrador TI las gestione.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-38 | Como Usuario Final, quiero reportar una incidencia sobre uno de mis equipos asignados indicando título, descripción y prioridad. | 🔴 | 5 | HU-35 |
| HU-39 | Como sistema, quiero impedir que un Usuario Final reporte incidencias sobre equipos que no tiene asignados. El backend devuelve 403. | 🔴 | 2 | HU-38 |
| HU-40 | Como Administrador TI, quiero crear incidencias directamente sobre cualquier activo. | 🟠 | 2 | HU-23 |
| HU-41 | Como Administrador TI, quiero ver todas las incidencias con filtros por estado, prioridad, tipo de hardware y período. | 🔴 | 3 | HU-38 |
| HU-42 | Como Administrador TI, quiero cambiar el estado de una incidencia (abrir → en revisión → en proceso → resuelta/cerrada). | 🔴 | 3 | HU-41 |
| HU-43 | Como Administrador TI, quiero registrar la resolución de una incidencia con texto descriptivo obligatorio. | 🔴 | 2 | HU-42 |
| HU-44 | Como Usuario Final, quiero ver el estado actual e historial de mis incidencias reportadas. | 🟠 | 2 | HU-38 |
| HU-45 | Como Usuario Final, quiero recibir un email cuando mi incidencia sea marcada como resuelta. | 🟡 | 3 | HU-43 |

---

## ÉPICA 7: MANTENIMIENTO

**Objetivo:** Control del ciclo de mantenimiento preventivo y correctivo de los activos.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-46 | Como Administrador TI, quiero crear una orden de trabajo (preventivo, correctivo, garantía) para un activo. | 🔴 | 5 | HU-17 |
| HU-47 | Como sistema, quiero cambiar el estado del activo a `in_maintenance` al crear una orden de trabajo. | 🔴 | 1 | HU-46 |
| HU-48 | Como Administrador TI, quiero cerrar una orden de trabajo registrando resultado, descripción y costo. | 🔴 | 3 | HU-46 |
| HU-49 | Como sistema, quiero devolver el activo a su estado anterior al cerrar la orden de trabajo. | 🔴 | 2 | HU-48 |
| HU-50 | Como Administrador TI, quiero vincular una incidencia a una orden de trabajo correctivo. | 🟠 | 2 | HU-46, HU-38 |
| HU-51 | Como Administrador TI, quiero programar mantenimientos preventivos periódicos para un activo con frecuencia configurable. | 🟠 | 3 | HU-17 |
| HU-52 | Como Administrador TI, quiero ver el historial de mantenimientos de un activo desde su ficha. | 🟠 | 2 | HU-46 |
| HU-53 | Como Administrador TI, quiero ver el listado de todas las órdenes de trabajo con filtros por estado, tipo y período. | 🟠 | 3 | HU-46 |

---

## ÉPICA 8: ALERTAS Y NOTIFICACIONES

**Objetivo:** Proactividad — el sistema avisa antes de que los problemas ocurran.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-54 | Como sistema, quiero generar alertas 90, 60 y 30 días antes del vencimiento de garantía de un activo. | 🟠 | 3 | HU-17 |
| HU-55 | Como sistema, quiero generar alertas 15 y 7 días antes de un mantenimiento preventivo programado. | 🟠 | 3 | HU-51 |
| HU-56 | Como sistema, quiero generar una alerta inmediata cuando un usuario con equipos asignados es desactivado. | 🟠 | 2 | HU-11 |
| HU-57 | Como sistema, quiero generar una alerta inmediata al Administrador TI cuando un Usuario Final reporta una incidencia. | 🟠 | 2 | HU-38 |
| HU-58 | Como sistema, quiero generar una alerta si un activo acumula 3+ mantenimientos correctivos en 6 meses. | 🟡 | 3 | HU-46 |
| HU-59 | Como Administrador TI, quiero ver el panel de alertas activas con severidad, filtros y acciones (leer, posponer, resolver). | 🟠 | 3 | HU-54 |
| HU-60 | Como sistema, quiero enviar emails de alerta al Administrador TI por vencimiento de garantía y mantenimiento. | 🟡 | 3 | HU-54, HU-55 |
| HU-61 | Como sistema, quiero mostrar un contador de alertas no leídas en el header de la aplicación. | 🟡 | 2 | HU-59 |

---

## ÉPICA 9: REPORTES Y EXPORTACIÓN

**Objetivo:** El Administrador TI puede obtener información exportable para operación y auditoría.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-62 | Como Administrador TI, quiero generar un reporte del inventario completo con filtros por tipo, estado, localidad y fecha. | 🟠 | 5 | HU-23 |
| HU-63 | Como Administrador TI, quiero generar un reporte de activos asignados por usuario. | 🟠 | 3 | HU-37 |
| HU-64 | Como Administrador TI, quiero generar un reporte del historial completo de un activo específico. | 🟠 | 3 | HU-24 |
| HU-65 | Como Administrador TI, quiero generar un reporte de órdenes de mantenimiento con filtros. | 🟡 | 3 | HU-53 |
| HU-66 | Como Administrador TI, quiero generar un reporte de incidencias por período. | 🟡 | 3 | HU-41 |
| HU-67 | Como Administrador TI, quiero generar un reporte de activos dados de baja. | 🟡 | 2 | HU-26 |
| HU-68 | Como Administrador TI, quiero generar un reporte de activos con garantía próxima a vencer. | 🟡 | 2 | HU-54 |
| HU-69 | Como sistema, quiero ofrecer exportación en PDF, Excel (xlsx) y CSV para todos los reportes. | 🟠 | 5 | HU-62 |

---

## ÉPICA 10: DASHBOARD

**Objetivo:** Vista ejecutiva del estado operativo del inventario en tiempo real.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-70 | Como Administrador TI, quiero ver en el dashboard el total de activos agrupados por estado. | 🟠 | 3 | HU-23 |
| HU-71 | Como Administrador TI, quiero ver en el dashboard la distribución de activos por tipo de hardware. | 🟠 | 2 | HU-23 |
| HU-72 | Como Administrador TI, quiero ver en el dashboard las alertas activas agrupadas por severidad. | 🟡 | 2 | HU-59 |
| HU-73 | Como Administrador TI, quiero ver en el dashboard las incidencias abiertas y en proceso. | 🟡 | 2 | HU-41 |
| HU-74 | Como Administrador TI, quiero ver en el dashboard los activos con garantía por vencer en los próximos 90 días. | 🟡 | 2 | HU-54 |

---

## ÉPICA 11: AUDITORÍA

**Objetivo:** Trazabilidad completa e inmutable de todas las operaciones del sistema.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-75 | Como sistema, quiero registrar automáticamente en `audit_logs` toda creación, modificación y baja de activos. | 🔴 | 3 | HU-17 |
| HU-76 | Como sistema, quiero registrar en auditoría todo inicio y cierre de sesión. | 🔴 | 1 | HU-01 |
| HU-77 | Como sistema, quiero registrar en auditoría toda creación y cierre de asignaciones. | 🔴 | 1 | HU-28 |
| HU-78 | Como sistema, quiero registrar en auditoría toda firma digital de actas. | 🔴 | 1 | HU-31 |
| HU-79 | Como sistema, quiero registrar en auditoría toda exportación de reportes. | 🟠 | 1 | HU-62 |
| HU-80 | Como Administrador TI, quiero consultar el log de auditoría con filtros por entidad, acción, usuario y rango de fechas. | 🟠 | 3 | HU-75 |
| HU-81 | Como Administrador TI, quiero exportar el log de auditoría filtrado en CSV. | 🟡 | 2 | HU-80 |

---

## ÉPICA 12: CÓDIGOS QR

**Objetivo:** Identificación física rápida de activos mediante QR imprimibles.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-82 | Como sistema, quiero generar un código QR único por activo al momento de su registro. El QR codifica el código interno. | 🟠 | 2 | HU-17 |
| HU-83 | Como Administrador TI, quiero descargar la etiqueta QR de un activo en formato de tarjeta imprimible (PDF). | 🟡 | 3 | HU-82 |

---

## ÉPICA 13: INFRAESTRUCTURA Y DESPLIEGUE

**Objetivo:** Base técnica del proyecto lista para desarrollo y producción.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias |
|---|---|:---:|:---:|---|
| HU-84 | Como equipo de desarrollo, quiero tener el proyecto Next.js configurado con TypeScript estricto, ESLint, Prettier y Husky en menos de 30 minutos. | 🔴 | 3 | — |
| HU-85 | Como equipo de desarrollo, quiero tener el schema de Prisma inicial con todos los modelos definidos y la migración inicial aplicada. | 🔴 | 3 | HU-84 |
| HU-86 | Como equipo de desarrollo, quiero tener un pipeline de CI en GitHub Actions que ejecute lint, typecheck y tests en cada PR. | 🔴 | 2 | HU-84 |
| HU-87 | Como equipo de desarrollo, quiero tener el proyecto desplegado en Railway (app + PostgreSQL) con deploy automático en push a `main`. | 🔴 | 3 | HU-84 |
| HU-88 | Como equipo de desarrollo, quiero tener un script de seed que cargue: 1 Administrador TI inicial, las 6 localidades de prueba y 5 activos de ejemplo. | 🟠 | 2 | HU-85 |

---

## RESUMEN DE BACKLOG

| Épica | HUs | Puntos estimados | Prioridad dominante |
|---|:---:|:---:|---|
| E-01: Autenticación | 8 | 16 | 🔴 Crítica |
| E-02: Usuarios | 6 | 15 | 🔴 Crítica |
| E-03: Localidades | 2 | 4 | 🟠 Alta |
| E-04: Inventario | 11 | 30 | 🔴 Crítica |
| E-05: Asignaciones | 10 | 29 | 🔴 Crítica |
| E-06: Incidencias | 8 | 22 | 🔴 Crítica |
| E-07: Mantenimiento | 8 | 19 | 🔴 Crítica |
| E-08: Alertas | 8 | 21 | 🟠 Alta |
| E-09: Reportes | 8 | 26 | 🟠 Alta |
| E-10: Dashboard | 5 | 11 | 🟠 Alta |
| E-11: Auditoría | 7 | 12 | 🔴 Crítica |
| E-12: QR | 2 | 5 | 🟠 Alta |
| E-13: Infraestructura | 5 | 13 | 🔴 Crítica |
| **TOTAL** | **88** | **223** | |

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
FASE 0 — Infraestructura base
  E-13 (HU-84, 85, 86, 87, 88)

FASE 1 — Fundamentos del negocio
  E-01 (Auth completa)
  E-02 (Usuarios)
  E-03 (Localidades)
  E-04 (Inventario — HU-17 a HU-26)
  E-11 (Auditoría — HU-75, 76)

FASE 2 — Asignaciones e Incidencias
  E-05 (Asignaciones completas)
  E-06 (Incidencias)
  E-07 (Mantenimiento)
  E-11 (Auditoría — HU-77, 78, 79)

FASE 3 — Visibilidad y alertas
  E-08 (Alertas)
  E-09 (Reportes)
  E-10 (Dashboard)
  E-12 (QR)
  E-11 (Auditoría — HU-80, 81)
  E-04 (Documentos — HU-27)

FASE 4 — Calidad y despliegue
  UAT, tests de carga, correcciones, Go-Live
```
