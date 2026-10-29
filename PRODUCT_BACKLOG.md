# PRODUCT BACKLOG
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

---

## CONVENCIONES

**Prioridades:**
- **Crítica** — Sin esto el sistema no puede operar.
- **Alta** — Valor de negocio inmediato. Debe entrar en v1.0.
- **Media** — Mejora significativa pero no bloquea el uso.
- **Baja** — Deseable. Entra si hay tiempo.

**Estimación (puntos de historia):** 1 (trivial) · 2 · 3 · 5 · 8 · 13 (compleja)

**Estado actual (añadido tras verificación contra el código real):**
- **Implementado** — el comportamiento descrito existe y fue verificado en el código actual.
- **En proceso** — existe una parte del comportamiento, pero no coincide del todo con la historia (falta un filtro, una vista global, o el mecanismo difiere).
- **Futuro / fuera del alcance actual** — no existe ninguna implementación; en algunos casos el modelo de datos existe en el schema pero sin Server Action, query ni interfaz asociada.

Los puntos de historia, prioridades y dependencias originales **no se recalculan** — se conservan como planeación histórica. El estado es la única columna nueva. Cuando una historia necesita una aclaración, se añade como nota breve después de la tabla, no dentro de la celda de Estado.

---

## ÉPICA 1: AUTENTICACIÓN Y ACCESO

**Objetivo:** Permitir que los usuarios entren al sistema de forma segura y accedan solo a lo que les corresponde.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-01 | Como Administrador TI, quiero iniciar sesión con mi email y contraseña para acceder al sistema. | Crítica | 3 | — | Implementado |
| HU-02 | Como Usuario Final, quiero iniciar sesión con mi email y contraseña para ver mis equipos. | Crítica | 1 | HU-01 | Implementado |
| HU-03 | Como sistema, quiero bloquear una cuenta tras 5 intentos fallidos consecutivos por 15 minutos para prevenir fuerza bruta. | Crítica | 2 | HU-01 | Implementado |
| HU-04 | Como sistema, quiero redirigir automáticamente a `/login` cualquier petición sin sesión válida. | Crítica | 2 | HU-01 | Implementado |
| HU-05 | Como sistema, quiero que el Administrador TI no pueda acceder a rutas de Usuario Final exclusivas, y viceversa, devolviendo 403. | Crítica | 3 | HU-01 | Implementado |
| HU-06 | Como cualquier usuario, quiero cerrar sesión para terminar mi sesión de forma segura. | Alta | 1 | HU-01 | Implementado |
| HU-07 | Como usuario nuevo, quiero ser obligado a cambiar mi contraseña en el primer inicio de sesión. | Media | 2 | HU-01 | Futuro / fuera del alcance actual |
| HU-08 | Como cualquier usuario, quiero cambiar mi contraseña desde mi perfil ingresando la contraseña actual. | Alta | 2 | HU-01 | Futuro / fuera del alcance actual |

**Notas:** HU-05, el bloqueo es una redirección (`src/proxy.ts`), no un código HTTP 403 literal. HU-07, el campo `mustChangePassword` existe en el schema pero ningún flujo lo verifica. HU-08, no existe página de perfil ni acción de cambio de contraseña.

---

## ÉPICA 2: GESTIÓN DE USUARIOS

**Objetivo:** El Administrador TI puede administrar completamente las cuentas del sistema.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-09 | Como Administrador TI, quiero crear usuarios con nombre, email, rol, puesto, teléfono, modalidad y localidad. | Crítica | 3 | HU-01 | Implementado |
| HU-10 | Como Administrador TI, quiero editar los datos de cualquier usuario. | Alta | 2 | HU-09 | Implementado |
| HU-11 | Como Administrador TI, quiero desactivar un usuario que ya no labora en la empresa. | Alta | 3 | HU-09 | Implementado |
| HU-12 | Como sistema, quiero impedir la desactivación de un usuario con asignaciones activas, indicando cuántos equipos tiene pendientes. | Crítica | 3 | HU-11, HU-28 | Implementado |
| HU-13 | Como Administrador TI, quiero ver el listado de todos los usuarios con filtros por rol, estado y localidad. | Alta | 2 | HU-09 | En proceso |
| HU-14 | Como cualquier usuario, quiero ver y editar mi propio perfil (nombre, teléfono). | Alta | 2 | HU-01 | Futuro / fuera del alcance actual |

**Notas:** HU-12, el bloqueo indica un conteo de equipos, no una lista detallada. HU-13, el listado existe pero sin los filtros descritos. HU-14, no existe página de perfil para ningún rol.

---

## ÉPICA 3: LOCALIDADES

**Objetivo:** Administrar el catálogo de localidades operativas de CIPRIJAL.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-15 | Como Administrador TI, quiero crear, editar y desactivar localidades (ciudades/estados donde opera CIPRIJAL). | Alta | 2 | HU-01 | Implementado |
| HU-16 | Como sistema, quiero impedir desactivar una localidad que tenga equipos o usuarios activos asociados. | Alta | 2 | HU-15 | Implementado |

---

## ÉPICA 4: INVENTARIO DE HARDWARE

**Objetivo:** Control completo del catálogo de activos de hardware de CIPRIJAL.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-17 | Como Administrador TI, quiero registrar un equipo con tipo (catálogo administrable), nombre, número de serie obligatorio, marca y modelo. | Crítica | 5 | HU-01, HU-15 | Implementado |
| HU-18 | Como sistema, quiero rechazar el registro de un equipo sin número de serie mostrando un error claro. | Crítica | 1 | HU-17 | Implementado |
| HU-19 | Como sistema, quiero rechazar el registro de un equipo con un número de serie duplicado. | Crítica | 1 | HU-17 | Implementado |
| HU-20 | Como sistema, quiero generar automáticamente el código interno (HW-AAAA-NNNN) al registrar un activo. | Crítica | 2 | HU-17 | Implementado |
| HU-21 | Como Administrador TI, quiero registrar especificaciones técnicas adicionales por tipo de equipo (CPU, RAM, IMEI, etc.) en un campo flexible. | Alta | 3 | HU-17 | Implementado |
| HU-22 | Como Administrador TI, quiero editar los datos de un activo existente. | Alta | 2 | HU-17 | Implementado |
| HU-23 | Como Administrador TI, quiero ver el listado de activos con filtros por tipo, estado, localidad y búsqueda por texto. | Crítica | 5 | HU-17 | Implementado |
| HU-24 | Como Administrador TI, quiero ver el detalle completo de un activo (información, historial de estados, asignaciones, mantenimientos, incidencias, documentos). | Alta | 5 | HU-17 | En proceso |
| HU-25 | Como Administrador TI, quiero cambiar el estado de un activo (entre: en almacén, asignado, en mantenimiento, dado de baja, robado, perdido) con confirmación. | Crítica | 3 | HU-17 | Implementado |
| HU-26 | Como Administrador TI, quiero dar de baja un activo. El activo no debe poder eliminarse si tiene asignación activa. | Crítica | 3 | HU-17, HU-28 | Implementado |
| HU-27 | Como Administrador TI, quiero adjuntar documentos (facturas, manuales, fotografías) a un activo. | Media | 3 | HU-17 | Futuro / fuera del alcance actual |

**Notas:** HU-17, el tipo es un catálogo administrable (`AssetType`), no un enum fijo; no existe campo de condición. HU-21, está cubierto por `AssetTechnicalInfo`, un módulo dedicado, no un JSON libre. HU-24, el detalle no incluye documentos adjuntos (módulo no implementado) ni un historial de estados dedicado. HU-25, los estados reales son `in_storage, assigned, in_maintenance, decommissioned, stolen, lost`; no existe "registrado"; sin motivo obligatorio. HU-26, no hay campo de motivo de baja dedicado. HU-27, el modelo `Document` existe en el schema sin ninguna acción ni interfaz.

---

## ÉPICA 5: ASIGNACIONES Y CUSTODIA

**Objetivo:** Control formal de a quién pertenece cada equipo, con responsiva y firma digital.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-28 | Como Administrador TI, quiero asignar un equipo a un usuario, registrando accesorios incluidos. | Crítica | 5 | HU-17, HU-09 | Implementado |
| HU-29 | Como sistema, quiero impedir que un activo tenga dos asignaciones activas simultáneamente. | Crítica | 2 | HU-28 | Implementado |
| HU-30 | Como Usuario Final, quiero poder ver que mi asignación recién creada queda pendiente de firma de recepción. | Crítica | 5 | HU-28 | Implementado |
| HU-31 | Como Usuario Final, quiero revisar los datos de mi equipo asignado y firmar digitalmente mi recepción con un dibujo de firma, desde `/my-assets/assignments/[assignmentId]/sign`. | Crítica | 5 | HU-30 | Implementado |
| HU-32 | Como sistema, quiero registrar la firma digital (imagen PNG en Base64) junto con la fecha/hora y el nombre del firmante obtenido de la base de datos del usuario autenticado. | Crítica | 2 | HU-31 | Implementado |
| HU-33 | Como Administrador TI, quiero registrar la devolución de un equipo y firmar como responsable de TI que lo recibe físicamente. | Crítica | 3 | HU-28 | Implementado |
| HU-34 | Como Administrador TI, quiero ver el historial completo de asignaciones de un activo. | Alta | 2 | HU-28 | Implementado |
| HU-35 | Como Usuario Final, quiero ver la lista de equipos que tengo asignados actualmente. | Crítica | 2 | HU-28 | Implementado |
| HU-36 | Como cualquier usuario, quiero consultar e imprimir la responsiva de mis propios equipos (entrega y devolución). | Alta | 2 | HU-30 | Implementado |
| HU-37 | Como Administrador TI, quiero ver el listado de todas las asignaciones activas con filtros por usuario, tipo de equipo y fecha. | Alta | 3 | HU-28 | Implementado |

**Notas:** HU-28, sin firma al crear; sin campo de condición. HU-30/31/32, no hay PDF; la firma es un dibujo en canvas, no checkbox; no se registra IP ni ID de sesión; el nombre viene siempre de la base de datos. HU-33, firma obligatoria del Administrador TI que recibe el equipo, resuelta desde su propia sesión, no desde el usuario asignado; sin campo de condición de retorno. HU-36, son páginas HTML imprimibles, no un archivo PDF descargable.

---

## ÉPICA 6: INCIDENCIAS

**Objetivo:** Canal formal para que los usuarios reporten fallas y el Administrador TI las gestione.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-38 | Como Usuario Final, quiero reportar una incidencia sobre uno de mis equipos asignados indicando título, descripción y prioridad. | Crítica | 5 | HU-35 | Implementado |
| HU-39 | Como sistema, quiero impedir que un Usuario Final reporte incidencias sobre equipos que no tiene asignados. | Crítica | 2 | HU-38 | Implementado |
| HU-40 | Como Administrador TI, quiero crear incidencias directamente sobre cualquier activo. | Alta | 2 | HU-23 | Implementado |
| HU-41 | Como Administrador TI, quiero ver todas las incidencias con filtros por estado, prioridad, tipo de hardware y período. | Crítica | 3 | HU-38 | En proceso |
| HU-42 | Como Administrador TI, quiero cambiar el estado de una incidencia (abrir → en revisión → en proceso → resuelta/cerrada). | Crítica | 3 | HU-41 | Implementado |
| HU-43 | Como Administrador TI, quiero registrar la resolución de una incidencia con texto descriptivo obligatorio. | Crítica | 2 | HU-42 | Implementado |
| HU-44 | Como Usuario Final, quiero ver el estado actual e historial de mis incidencias reportadas. | Alta | 2 | HU-38 | Implementado |
| HU-45 | Como Usuario Final, quiero recibir un email cuando mi incidencia sea marcada como resuelta. | Media | 3 | HU-43 | Futuro / fuera del alcance actual |

**Notas:** HU-41, las incidencias se gestionan por activo (`/assets/[id]/incidents`), sin vista global con filtros cruzados. HU-45, no hay envío de correo (sin SMTP configurado).

---

## ÉPICA 7: MANTENIMIENTO

**Objetivo:** Control del ciclo de mantenimiento preventivo y correctivo de los activos.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-46 | Como Administrador TI, quiero crear una orden de trabajo (preventivo, correctivo, garantía) para un activo. | Crítica | 5 | HU-17 | Implementado |
| HU-47 | Como sistema, quiero cambiar el estado del activo a `in_maintenance` al crear una orden de trabajo. | Crítica | 1 | HU-46 | Futuro / fuera del alcance actual |
| HU-48 | Como Administrador TI, quiero cerrar una orden de trabajo registrando resultado, descripción y costo. | Crítica | 3 | HU-46 | Implementado |
| HU-49 | Como sistema, quiero devolver el activo a su estado anterior al cerrar la orden de trabajo. | Crítica | 2 | HU-48 | Futuro / fuera del alcance actual |
| HU-50 | Como Administrador TI, quiero vincular una incidencia a una orden de trabajo correctivo. | Alta | 2 | HU-46, HU-38 | Implementado |
| HU-51 | Como Administrador TI, quiero programar mantenimientos preventivos periódicos para un activo con frecuencia configurable. | Alta | 3 | HU-17 | Futuro / fuera del alcance actual |
| HU-52 | Como Administrador TI, quiero ver el historial de mantenimientos de un activo desde su ficha. | Alta | 2 | HU-46 | Implementado |
| HU-53 | Como Administrador TI, quiero ver el listado de todas las órdenes de trabajo con filtros por estado, tipo y período. | Alta | 3 | HU-46 | En proceso |

**Notas:** HU-47/49, no existe ningún automatismo que cambie el estado del activo al crear o cerrar una OT; el cambio, si se requiere, lo hace manualmente el Administrador TI. HU-48, el resultado es obligatorio; descripción y costo son opcionales. HU-51, el modelo `MaintenanceSchedule` existe en el schema sin ninguna acción, query ni interfaz. HU-53, las órdenes se gestionan por activo, sin vista global con esos filtros.

---

## ÉPICA 8: ALERTAS Y NOTIFICACIONES — Futuro / fuera del alcance actual

**Objetivo original:** Proactividad — el sistema avisa antes de que los problemas ocurran.

Ninguna historia de esta épica está implementada. No existe modelo de alertas en el schema, no hay lógica de generación ni envío de correo (sin SMTP configurado). La ruta `/alerts` existe como carpeta reservada sin página activa. El dashboard sí muestra contadores operativos (incidencias abiertas, mantenimientos activos) a modo de resumen, pero no es el sistema de alertas con severidad/posponer/resolver que describen estas historias.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-54 | Como sistema, quiero generar alertas 90, 60 y 30 días antes del vencimiento de garantía de un activo. | Alta | 3 | HU-17 | Futuro / fuera del alcance actual |
| HU-55 | Como sistema, quiero generar alertas 15 y 7 días antes de un mantenimiento preventivo programado. | Alta | 3 | HU-51 | Futuro / fuera del alcance actual |
| HU-56 | Como sistema, quiero generar una alerta inmediata cuando un usuario con equipos asignados es desactivado. | Alta | 2 | HU-11 | Futuro / fuera del alcance actual |
| HU-57 | Como sistema, quiero generar una alerta inmediata al Administrador TI cuando un Usuario Final reporta una incidencia. | Alta | 2 | HU-38 | Futuro / fuera del alcance actual |
| HU-58 | Como sistema, quiero generar una alerta si un activo acumula 3+ mantenimientos correctivos en 6 meses. | Media | 3 | HU-46 | Futuro / fuera del alcance actual |
| HU-59 | Como Administrador TI, quiero ver el panel de alertas activas con severidad, filtros y acciones (leer, posponer, resolver). | Alta | 3 | HU-54 | Futuro / fuera del alcance actual |
| HU-60 | Como sistema, quiero enviar emails de alerta al Administrador TI por vencimiento de garantía y mantenimiento. | Media | 3 | HU-54, HU-55 | Futuro / fuera del alcance actual |
| HU-61 | Como sistema, quiero mostrar un contador de alertas no leídas en el header de la aplicación. | Media | 2 | HU-59 | Futuro / fuera del alcance actual |

**Nota:** HU-56, en su lugar, la desactivación simplemente se bloquea (ver HU-12).

---

## ÉPICA 9: REPORTES Y EXPORTACIÓN

**Objetivo:** El Administrador TI puede obtener información exportable para operación y auditoría.

Lo que existe realmente hoy: un panel único en `/reports` con contadores y agrupaciones (activos por estado/tipo/ubicación, top de gastos, incidencias y mantenimientos abiertos), más exportación CSV de activos y de asignaciones (con filtros), como rutas separadas del panel de reportes. No existen reportes individuales configurables por tipo con selección de filtros y formato.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-62 | Como Administrador TI, quiero generar un reporte del inventario completo con filtros por tipo, estado, localidad y fecha. | Alta | 5 | HU-23 | Futuro / fuera del alcance actual |
| HU-63 | Como Administrador TI, quiero generar un reporte de activos asignados por usuario. | Alta | 3 | HU-37 | Futuro / fuera del alcance actual |
| HU-64 | Como Administrador TI, quiero generar un reporte del historial completo de un activo específico. | Alta | 3 | HU-24 | Futuro / fuera del alcance actual |
| HU-65 | Como Administrador TI, quiero generar un reporte de órdenes de mantenimiento con filtros. | Media | 3 | HU-53 | Futuro / fuera del alcance actual |
| HU-66 | Como Administrador TI, quiero generar un reporte de incidencias por período. | Media | 3 | HU-41 | Futuro / fuera del alcance actual |
| HU-67 | Como Administrador TI, quiero generar un reporte de activos dados de baja. | Media | 2 | HU-26 | Futuro / fuera del alcance actual |
| HU-68 | Como Administrador TI, quiero generar un reporte de activos con garantía próxima a vencer. | Media | 2 | HU-54 | Futuro / fuera del alcance actual |
| HU-69 | Como sistema, quiero ofrecer exportación en PDF, Excel (xlsx) y CSV para todos los reportes. | Alta | 5 | HU-62 | Futuro / fuera del alcance actual |
| HU-69-B *(no estimada originalmente)* | Como Administrador TI, quiero ver un panel de reportes con contadores y agrupaciones (activos por estado/tipo/ubicación, top de gastos, incidencias y mantenimientos abiertos). | — | — | — | Implementado |
| HU-69-C *(no estimada originalmente)* | Como Administrador TI, quiero exportar en CSV el listado de activos y el de asignaciones, con los filtros activos aplicados. | — | — | — | Implementado |

**Notas:** HU-62/64, existe exportación CSV de activos con filtros, pero no un "reporte" configurable dentro del panel. HU-69, solo existe CSV, para activos y asignaciones, no para "reportes". HU-69-B y HU-69-C describen la funcionalidad real existente, no contempladas como historias en la redacción original del backlog.

---

## ÉPICA 10: DASHBOARD

**Objetivo:** Vista ejecutiva del estado operativo del inventario en tiempo real.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-70 | Como Administrador TI, quiero ver en el dashboard el total de activos agrupados por estado. | Alta | 3 | HU-23 | Implementado |
| HU-71 | Como Administrador TI, quiero ver en el dashboard la distribución de activos por tipo de hardware. | Alta | 2 | HU-23 | Implementado |
| HU-72 | Como Administrador TI, quiero ver en el dashboard las alertas activas agrupadas por severidad. | Media | 2 | HU-59 | En proceso |
| HU-73 | Como Administrador TI, quiero ver en el dashboard las incidencias abiertas y en proceso. | Media | 2 | HU-41 | Implementado |
| HU-74 | Como Administrador TI, quiero ver en el dashboard los activos con garantía por vencer en los próximos 90 días. | Media | 2 | HU-54 | Futuro / fuera del alcance actual |

**Nota:** HU-72, el dashboard muestra indicadores operativos (incidencias, mantenimientos, asignaciones) a modo de alertas, sin severidad ni el modelo de la Épica 8.

---

## ÉPICA 11: AUDITORÍA — Futuro / fuera del alcance actual

**Objetivo original:** Trazabilidad completa e inmutable de todas las operaciones del sistema.

El modelo `AuditLog` existe en el schema de Prisma (de solo inserción, con todos los campos descritos en las historias), pero ningún Server Action escribe en él actualmente. No existe interfaz de consulta — `/audit` es una carpeta reservada sin página activa.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-75 | Como sistema, quiero registrar automáticamente en `audit_logs` toda creación, modificación y baja de activos. | Crítica | 3 | HU-17 | Futuro / fuera del alcance actual |
| HU-76 | Como sistema, quiero registrar en auditoría todo inicio y cierre de sesión. | Crítica | 1 | HU-01 | Futuro / fuera del alcance actual |
| HU-77 | Como sistema, quiero registrar en auditoría toda creación y cierre de asignaciones. | Crítica | 1 | HU-28 | Futuro / fuera del alcance actual |
| HU-78 | Como sistema, quiero registrar en auditoría toda firma digital. | Crítica | 1 | HU-31 | Futuro / fuera del alcance actual |
| HU-79 | Como sistema, quiero registrar en auditoría toda exportación de reportes. | Alta | 1 | HU-62 | Futuro / fuera del alcance actual |
| HU-80 | Como Administrador TI, quiero consultar el log de auditoría con filtros por entidad, acción, usuario y rango de fechas. | Alta | 3 | HU-75 | Futuro / fuera del alcance actual |
| HU-81 | Como Administrador TI, quiero exportar el log de auditoría filtrado en CSV. | Media | 2 | HU-80 | Futuro / fuera del alcance actual |

---

## ÉPICA 12: CÓDIGOS QR — Futuro / fuera del alcance actual

**Objetivo original:** Identificación física rápida de activos mediante QR imprimibles.

El campo `qrCode` existe en el modelo `Asset` pero no se asigna en ningún flujo actual. No hay generación, renderizado ni impresión de códigos QR.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-82 | Como sistema, quiero generar un código QR único por activo al momento de su registro. El QR codifica el código interno. | Alta | 2 | HU-17 | Futuro / fuera del alcance actual |
| HU-83 | Como Administrador TI, quiero descargar la etiqueta QR de un activo en formato de tarjeta imprimible (PDF). | Media | 3 | HU-82 | Futuro / fuera del alcance actual |

---

## ÉPICA 13: INFRAESTRUCTURA Y DESPLIEGUE

**Objetivo:** Base técnica del proyecto lista para desarrollo y producción.

| ID | Historia de Usuario | Prioridad | Puntos | Dependencias | Estado |
|---|---|:---:|:---:|---|:---:|
| HU-84 | Como equipo de desarrollo, quiero tener el proyecto Next.js configurado con TypeScript estricto, ESLint, Prettier y Husky en menos de 30 minutos. | Crítica | 3 | — | Implementado |
| HU-85 | Como equipo de desarrollo, quiero tener el schema de Prisma inicial con todos los modelos definidos y la migración inicial aplicada. | Crítica | 3 | HU-84 | Implementado |
| HU-86 | Como equipo de desarrollo, quiero tener un pipeline de CI en GitHub Actions que ejecute lint, typecheck y build en cada PR. | Crítica | 2 | HU-84 | Implementado |
| HU-87 | Como equipo de desarrollo, quiero tener el proyecto desplegado en Railway (app + PostgreSQL) con deploy automático en push a `main`. | Crítica | 3 | HU-84 | Futuro / fuera del alcance actual |
| HU-88 | Como equipo de desarrollo, quiero tener un script de seed que cargue un Administrador TI inicial y una localidad base para operar el sistema desde cero. | Alta | 2 | HU-85 | Implementado |

**Notas:** HU-86, el pipeline real (`.github/workflows/ci.yml`) ejecuta typecheck, lint, format:check y build; no incluye tests automatizados. HU-87, Railway es el entorno previsto, aún no desplegado; la decisión final está sujeta a la empresa. HU-88, el seed real (`prisma/seed.ts`) crea 1 localidad ("Corporativo") y 1 Administrador TI, sin activos ni localidades adicionales (la redacción original mencionaba 6 localidades y 5 activos).

---

## RESUMEN DE BACKLOG

*(Tabla histórica — puntos y prioridades sin recalcular. No refleja el estado de implementación; ver estado por historia arriba.)*

| Épica | HUs | Puntos estimados | Prioridad dominante |
|---|:---:|:---:|---|
| E-01: Autenticación | 8 | 16 | Crítica |
| E-02: Usuarios | 6 | 15 | Crítica |
| E-03: Localidades | 2 | 4 | Alta |
| E-04: Inventario | 11 | 30 | Crítica |
| E-05: Asignaciones | 10 | 29 | Crítica |
| E-06: Incidencias | 8 | 22 | Crítica |
| E-07: Mantenimiento | 8 | 19 | Crítica |
| E-08: Alertas | 8 | 21 | Alta |
| E-09: Reportes | 8 | 26 | Alta |
| E-10: Dashboard | 5 | 11 | Alta |
| E-11: Auditoría | 7 | 12 | Crítica |
| E-12: QR | 2 | 5 | Alta |
| E-13: Infraestructura | 5 | 13 | Crítica |
| **TOTAL** | **88** | **223** | |

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

*(Planeación histórica — conservada tal cual, sin modificar.)*

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

---

## FUTURO / FUERA DEL ALCANCE ACTUAL

Catálogo de mejoras futuras consolidado en esta sección: sin fecha comprometida, política de versiones y criterios de priorización.

### Catálogo de mejoras futuras (sin fecha)

Las siguientes funcionalidades están identificadas pero **no tienen fecha de implementación comprometida**. Se priorizarán según las necesidades reales de CIPRIJAL.

| ID | Mejora | Qué es | Por qué esperar |
|---|---|---|---|
| MF-01 | Gestión de Proveedores y Contratos | Registro de proveedores, contratos de soporte, SLAs y alertas de vencimiento de contratos | Los beneficios son mayores una vez que el inventario está cargado y estabilizado |
| MF-02 | Gestión de Licencias de Software | Control de licencias (tipo, cantidad, vencimiento, cumplimiento), vinculación a activos o empleados | Requiere que el inventario de hardware esté consolidado primero |
| MF-03 | Módulo Financiero (Depreciación y TCO) | Depreciación automática, costo total de propiedad, presupuesto de TI vs. gasto real | Requiere al menos 6 meses de datos de mantenimiento para que el TCO sea significativo |
| MF-04 | Inventario Físico Asistido (Conciliación) | Toma de inventario periódico escaneando QR desde un teléfono, con reporte de conciliación | Depende de que el módulo de QR (Épica 12) exista primero |
| MF-05 | Integración con Active Directory / LDAP | Autenticación corporativa, sincronización automática de empleados | Sin prioridad confirmada por CIPRIJAL |
| MF-06 | Certificados SSL y Dominios | Registro de certificados/dominios con alertas de vencimiento | Activo digital crítico pero de bajo volumen |
| MF-07 | Reserva de Activos Compartidos | Calendario de reservas para equipos de uso compartido | Depende de la operación real post Go-Live |
| MF-08 | Módulo de Seguros | Registro de pólizas que cubren activos de TI | Sin prioridad confirmada |
| MF-09 | Descubrimiento Automático de Red | Network scanning para detectar dispositivos no registrados | Sin prioridad confirmada |
| MF-10 | Analítica Avanzada y Planificación | Tendencias históricas, calculadora de renovación, exportación a BI | Depende de tener suficiente historial acumulado |
| MF-11 | Aplicación Móvil Nativa | App iOS/Android con escaneo QR y modo offline | Alternativa a evaluar solo si surge necesidad de campo real |
| MF-12 | Integración con ERP / Contabilidad | Exportación de depreciación y gastos al sistema contable | Depende de MF-03 |
| MF-13 | Registro real en `audit_logs` | Implementar la escritura real en el modelo `AuditLog` para las acciones relevantes del sistema (alta/edición/baja de activos, asignaciones, usuarios, incidencias, mantenimiento, firmas, login/logout), tal como describen RN-AUD-02 a 04 | Requiere tocar la mayoría de las Server Actions existentes; se prioriza mejor como iniciativa dedicada que como ajuste puntual |
| MF-14 | Edición del propio perfil (Usuario Final) | Permitir que un Usuario Final edite su propio nombre, teléfono y contraseña desde una pantalla de perfil, sin poder modificar su rol, localidad ni estado de activación (RN-USR-06) | Nueva pantalla y Server Action; no es urgente mientras el Administrador TI gestione estos cambios |
| MF-15 | Crear orden de mantenimiento desde una incidencia | Conectar el campo `incidentId` de `MaintenanceOrder` (ya existente en el schema) con un flujo real en la interfaz que permita generar una orden de trabajo directamente desde una incidencia abierta (RN-INC-05) | El dato ya está modelado; falta solo el flujo de interfaz, acotado a los módulos de incidencias y mantenimiento |
| MF-16 | Desbloqueo manual de cuentas | Permitir que un Administrador TI desbloquee manualmente una cuenta bloqueada por intentos fallidos, antes de que expire el periodo automático de 15 minutos | Solo se justifica si el bloqueo automático genera fricción operativa real; de lo contrario, el desbloqueo por tiempo es suficiente |
| MF-17 | Notificaciones (toasts) y modo oscuro | Montar el componente `Toaster` (`sonner`) para dar retroalimentación visual tras cada acción, y activar un `ThemeProvider` (`next-themes`) para un modo oscuro real | Ambas dependencias ya están instaladas; requiere antes revisar que la paleta de colores (hoy con mucho estilo en línea) se vea bien en modo oscuro |

### Hallazgos de auditoría (deuda técnica, sin fecha)

Pendientes identificados en una auditoría de seguridad/calidad posterior a v1.0, verificados contra el código real. No son funcionalidades de negocio nuevas, sino correcciones y decisiones técnicas pendientes.

| ID | Hallazgo | Acción propuesta | Prioridad sugerida |
|---|---|---|:---:|
| AUD-01 | `npm audit` reporta 29 vulnerabilidades (5 críticas, 17 altas, 6 moderadas, 1 baja), todas en dependencias transitivas de desarrollo/build (Next.js, Prisma, ESLint, Tailwind, etc.) | Planificar actualización de dependencias y volver a correr `npm audit` tras cada actualización mayor | Media |
| AUD-02 | `@auth/prisma-adapter`, `react-hook-form`, `@hookform/resolvers`, `sonner` y `next-themes` están instaladas en `package.json` sin uso real de la funcionalidad para la que existen (`sonner` tiene un componente `Toaster` que nunca se monta en ningún layout; `next-themes` solo se referencia dentro de ese mismo componente, sin ningún `ThemeProvider` activo) | Quitarlas, o implementarlas si en algún momento se decide usarlas (ver MF-17 para activarlas) | Baja |
| AUD-03 | `Location.name` no tiene `@unique` real en PostgreSQL — solo un chequeo manual en el Server Action, con riesgo de duplicados en condición de carrera | Agregar `@unique` al campo y su migración correspondiente | Media |
| AUD-04 | `createUserAction` no captura el error `P2002` (colisión de email concurrente) — a diferencia de otros Server Actions que sí lo hacen | Agregar `try/catch` con manejo del error de duplicado | Baja |
| AUD-05 | `Asset.purchasePrice` no valida signo (rechazar negativos) en el servidor, a diferencia de `cost` en gastos y mantenimiento | Agregar validación de número no negativo en `assets.actions.ts` | Baja |
| AUD-06 | Las firmas (entrega y las dos de devolución) solo validan el prefijo `data:image/png;base64,` y el tamaño, no que el contenido sea un PNG real decodificable | Agregar validación real del contenido de la imagen antes de persistir | Baja |
| AUD-07 | No existen `CHECK` constraints en ninguna tabla de la base de datos; toda regla de rango/signo depende solo del código de la aplicación | Evaluar agregar `CHECK` constraints para las reglas más críticas (montos no negativos, fechas coherentes) | Media |
| AUD-08 | `isSessionUserValid()`, usada en `/api/auth/force-logout`, no tiene `try/catch` ante una eventual caída de la base de datos | Agregar manejo de error con degradación controlada | Baja |
| AUD-09 | `ADMIN_ONLY_PREFIXES` en `src/proxy.ts` incluye `/audit` y `/alerts`, prefijos que no corresponden a ninguna ruta real implementada | Quitar los prefijos no usados, o dejarlos si se retoman las Épicas 8 (Alertas) y 11 (Auditoría) | Baja |
| AUD-10 | `Asset.biosPassword`/`devicePassword` no tienen implementado el cifrado AES-256-GCM que un comentario anterior del schema sugería como ya existente | Si en el futuro se usan estos campos, implementar cifrado real antes de persistir cualquier valor (ver nota corregida en `prisma/schema.prisma` y en `MODELO_BASE_DATOS.md` §2.4) | Media (solo si se activa la funcionalidad) |
| AUD-11 | Existen modelos y campos sin ninguna implementación real: `MaintenanceSchedule`, `Document`, y los campos heredados de `AssetAssignment` (`signedAt`, `signaturePath`, `signatureIp`, `deliveryDocumentId`, `returnDocumentId`) | Decidir si se implementan (ver Épicas 4, 7 y RN-DOC en `REGLAS_NEGOCIO.md`) o se eliminan del schema en una futura migración de limpieza | Baja |

---

### Política de versiones

| Tipo | Cuándo | Ejemplo | Requiere migración |
|---|---|---|---|
| Patch (x.y.Z) | Bugfixes y mejoras menores sin cambio de schema | v1.0.1 | No |
| Minor (x.Y.z) | Nuevas funcionalidades, schema aditivo | v1.1.0 | Sí (aditiva) |
| Major (X.y.z) | Cambios arquitectónicos o breaking changes | v2.0.0 | Sí (puede ser compleja) |

### Criterios de priorización

Cuando se evalúe qué mejora implementar después de v1.0:

1. **Problema real identificado en operación:** ¿el equipo de TI de CIPRIJAL lo está pidiendo porque lo necesita hoy?
2. **Bloquea algún proceso crítico sin él:** ¿hay un workaround aceptable o es un punto de dolor constante?
3. **Esfuerzo estimado vs. impacto:** ¿cuánto tiempo toma y a cuántos usuarios beneficia?
4. **Dependencias técnicas:** ¿requiere que otro módulo esté primero?
