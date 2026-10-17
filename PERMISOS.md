# MATRIZ DE PERMISOS
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

El sistema tiene exactamente dos roles: **Administrador TI** (`admin_ti`) y **Usuario Final** (`usuario_final`). No existen roles intermedios.

Cada celda indica si la acción está permitida para ese rol: "Sí", "No" o "Solo propios" cuando aplica únicamente a los recursos del propio usuario.

---

## 1. INVENTARIO DE HARDWARE

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver listado completo de activos | Sí | No |
| Buscar y filtrar activos | Sí | No |
| Ver detalle de un activo | Sí | No |
| Registrar nuevo activo | Sí | No |
| Editar activo existente | Sí | No |
| Cambiar estado de activo | Sí | No |
| Dar de baja activo | Sí | No |
| Ver historial de estados de activo | Sí | No |
| Imprimir / descargar etiqueta QR | Sí | No |
| Subir / gestionar documentos del activo | Sí | No |

> **Nota:** El Usuario Final no tiene acceso al inventario general bajo ninguna circunstancia.

---

## 2. ASIGNACIONES (PRÉSTAMOS)

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver todas las asignaciones activas | Sí | No |
| Ver historial de asignaciones de un activo | Sí | No |
| Crear nueva asignación (entregar equipo) | Sí | No |
| Registrar devolución de equipo | Sí | No |
| **Firmar la devolución como responsable de TI que recibe el equipo** (nombre resuelto desde su propia sesión/BD) | Sí | No |
| **Ver mis equipos asignados actualmente** | Sí | Sí |
| **Firmar la recepción de mi propio equipo** (desde `/my-assets`, solo si está pendiente de firma; nombre resuelto desde BD, no del cliente) | No | Solo propios |
| **Consultar mi responsiva de entrega firmada** (página HTML imprimible) | Sí | Solo propios |

> **Nota:** no se genera ningún PDF automático — la responsiva es una página HTML imprimible vía el navegador.

---

## 3. INCIDENCIAS

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver todas las incidencias | Sí | No |
| **Ver mis incidencias** | Sí | Solo propios |
| **Reportar incidencia** (sobre equipos propios) | Sí | Solo propios |
| Reportar incidencia sobre cualquier equipo | Sí | No |
| Cambiar estado de incidencia | Sí | No |
| Asignar incidencia a una OT de mantenimiento | Sí | No |
| Resolver / cerrar incidencia | Sí | No |
| Ver detalle de incidencia ajena | Sí | No |

---

## 4. MANTENIMIENTO

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver órdenes de trabajo | Sí | No |
| Crear orden de trabajo | Sí | No |
| Editar orden de trabajo | Sí | No |
| Cerrar / completar orden de trabajo | Sí | No |
| Cancelar orden de trabajo | Sí | No |
| Ver programación de mantenimientos preventivos | Sí | No |
| Crear / editar programación preventiva | Sí | No |

---

## 5. ALERTAS Y NOTIFICACIONES

> **Pendiente de implementación.** El módulo de Alertas no está construido todavía: la ruta `/alerts` existe como carpeta reservada sin página activa, no hay modelo de alertas en la base de datos ni lógica de generación o envío de correo. La siguiente tabla describe los permisos previstos para cuando el módulo se implemente, no una funcionalidad disponible hoy.

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver panel de alertas del sistema | Sí | No |
| Marcar alerta como leída | Sí | No |
| Posponer alerta | Sí | No |
| Resolver alerta | Sí | No |
| Recibir email de alerta de garantía / mantenimiento | Sí | No |
| Recibir email de resolución de su incidencia | No | Sí |

---

## 6. REPORTES Y DASHBOARD

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver dashboard con KPIs operativos | Sí | No |
| Ver panel de reportes (`/reports`): contadores y agrupaciones de activos, top de gastos, incidencias y mantenimientos abiertos | Sí | No |
| Exportar CSV de activos (con filtros) | Sí | No |
| Exportar CSV de asignaciones (con filtros) | Sí | No |

> **Pendiente de implementación.** No existen reportes individuales configurables por tipo (inventario, asignaciones, mantenimiento, incidencias, bajas, garantías) ni exportación en PDF o Excel — hoy solo hay el panel fijo de `/reports` más las dos exportaciones CSV listadas arriba.

---

## 7. USUARIOS Y PERFILES

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver listado de usuarios | Sí | No |
| Crear usuario | Sí | No |
| Editar cualquier usuario | Sí | No |
| Activar / desactivar usuario | Sí | No |
| Cambiar rol de usuario | Sí | No |
| **Ver su propio perfil** | Sí | Sí |
| **Editar su propio perfil** (nombre, teléfono) | Sí | Sí |
| **Cambiar su propia contraseña** | Sí | Sí |

---

## 8. ADMINISTRACIÓN DEL SISTEMA

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Gestionar localidades (crear, editar, desactivar) | Sí | No |

> **Pendiente de implementación.** El modelo `audit_logs` existe en la base de datos, pero ninguna Server Action escribe en él actualmente y no existe UI de consulta (`/audit` es una carpeta reservada sin página activa). Las acciones de ver, filtrar y exportar el log de auditoría son permisos previstos para cuando el módulo se construya, no funcionalidad disponible hoy.

---

## 9. DOCUMENTOS ADJUNTOS

> **Pendiente de implementación.** El modelo `Document` existe en el schema de Prisma, pero no hay ninguna Server Action ni UI para subir, ver o eliminar documentos adjuntos a un activo. La siguiente tabla describe los permisos previstos para cuando el módulo se construya.

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Subir documento a un activo | Sí | No |
| Ver documentos de cualquier activo | Sí | No |
| Eliminar (desactivar) un documento | Sí | No |

---

## 10. RESUMEN EJECUTIVO

### Administrador TI puede:
Todo. Control operativo completo sobre activos, usuarios, asignaciones, mantenimiento, incidencias, alertas, reportes, auditoría y configuración del sistema.

### Usuario Final puede únicamente:
1. Ver su perfil y editarlo (nombre, teléfono, contraseña).
2. Ver la lista de equipos que tiene asignados actualmente, incluyendo si están pendientes de firma.
3. Firmar digitalmente la recepción de los equipos que le son entregados, desde `/my-assets`, cuando la asignación esté pendiente de firma.
4. Consultar su propia responsiva de entrega (y de devolución, una vez devuelto el equipo).
5. Reportar incidencias exclusivamente sobre los equipos que tiene asignados.
6. Ver el estado de sus propias incidencias.
7. Recibir notificación por email cuando una incidencia suya es resuelta — **pendiente de implementación** (no hay envío de correo en el sistema actual).

---

## 11. IMPLEMENTACIÓN TÉCNICA

La verificación de permisos ocurre en **tres niveles independientes** (defensa en profundidad):

1. **`src/proxy.ts` (antes de cualquier página):** Verifica que existe sesión válida y bloquea acceso a rutas de `admin_ti` si el rol es `usuario_final`. En Next.js 16 este archivo reemplaza al antiguo `middleware.ts`.

2. **Server Actions (servidor):** Cada mutación sensible llama a `requireAdminTI()` o `requireAuthenticatedUser()` (los únicos helpers reutilizables en `src/lib/auth.ts`) antes de ejecutar cualquier lógica. No existe un helper `requireOwnership()` genérico — la verificación de que un recurso pertenece al usuario autenticado se hace de forma explícita dentro de cada acción, comparando el `id` de sesión contra el dueño del registro (por ejemplo, `assignment.userId !== session.user.id` en `signDeliveryAction`).

3. **UI (cliente):** Los botones y enlaces que un rol no tiene permitido simplemente no se renderizan. Esto es una mejora de UX, no de seguridad — la seguridad real está en los niveles 1 y 2.

> **Principio:** Si la seguridad de una acción depende solo de que el botón no aparezca en el frontend, el diseño está mal.
