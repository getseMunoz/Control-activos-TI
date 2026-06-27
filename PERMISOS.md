# MATRIZ DE PERMISOS
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

El sistema tiene exactamente dos roles: **Administrador TI** (`admin_ti`) y **Usuario Final** (`usuario_final`). No existen roles intermedios.

Leyenda: ✅ Permitido · ❌ Prohibido (HTTP 403) · 👤 Solo los propios

---

## 1. INVENTARIO DE HARDWARE

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver listado completo de activos | ✅ | ❌ |
| Buscar y filtrar activos | ✅ | ❌ |
| Ver detalle de un activo | ✅ | ❌ |
| Registrar nuevo activo | ✅ | ❌ |
| Editar activo existente | ✅ | ❌ |
| Cambiar estado de activo | ✅ | ❌ |
| Dar de baja activo | ✅ | ❌ |
| Ver historial de estados de activo | ✅ | ❌ |
| Imprimir / descargar etiqueta QR | ✅ | ❌ |
| Subir / gestionar documentos del activo | ✅ | ❌ |

> **Nota:** El Usuario Final no tiene acceso al inventario general bajo ninguna circunstancia.

---

## 2. ASIGNACIONES (PRÉSTAMOS)

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver todas las asignaciones activas | ✅ | ❌ |
| Ver historial de asignaciones de un activo | ✅ | ❌ |
| Crear nueva asignación (entregar equipo) | ✅ | ❌ |
| Registrar devolución de equipo | ✅ | ❌ |
| Generar acta de resguardo PDF | ✅ | ❌ |
| **Ver mis equipos asignados actualmente** | ✅ | ✅ |
| **Firmar digitalmente mi acta de resguardo** | ✅ | ✅ |
| **Descargar mi acta de resguardo firmada** | ✅ | 👤 |

---

## 3. INCIDENCIAS

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver todas las incidencias | ✅ | ❌ |
| **Ver mis incidencias** | ✅ | 👤 |
| **Reportar incidencia** (sobre equipos propios) | ✅ | 👤 |
| Reportar incidencia sobre cualquier equipo | ✅ | ❌ |
| Cambiar estado de incidencia | ✅ | ❌ |
| Asignar incidencia a una OT de mantenimiento | ✅ | ❌ |
| Resolver / cerrar incidencia | ✅ | ❌ |
| Ver detalle de incidencia ajena | ✅ | ❌ |

---

## 4. MANTENIMIENTO

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver órdenes de trabajo | ✅ | ❌ |
| Crear orden de trabajo | ✅ | ❌ |
| Editar orden de trabajo | ✅ | ❌ |
| Cerrar / completar orden de trabajo | ✅ | ❌ |
| Cancelar orden de trabajo | ✅ | ❌ |
| Ver programación de mantenimientos preventivos | ✅ | ❌ |
| Crear / editar programación preventiva | ✅ | ❌ |

---

## 5. ALERTAS Y NOTIFICACIONES

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver panel de alertas del sistema | ✅ | ❌ |
| Marcar alerta como leída | ✅ | ❌ |
| Posponer alerta | ✅ | ❌ |
| Resolver alerta | ✅ | ❌ |
| Recibir email de alerta de garantía / mantenimiento | ✅ | ❌ |
| Recibir email de resolución de su incidencia | ❌ | ✅ |

---

## 6. REPORTES Y DASHBOARD

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver dashboard con KPIs operativos | ✅ | ❌ |
| Generar reporte de inventario | ✅ | ❌ |
| Generar reporte de asignaciones | ✅ | ❌ |
| Generar reporte de mantenimiento | ✅ | ❌ |
| Generar reporte de incidencias | ✅ | ❌ |
| Generar reporte de activos dados de baja | ✅ | ❌ |
| Generar reporte de garantías por vencer | ✅ | ❌ |
| Exportar en PDF / Excel / CSV | ✅ | ❌ |

---

## 7. USUARIOS Y PERFILES

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Ver listado de usuarios | ✅ | ❌ |
| Crear usuario | ✅ | ❌ |
| Editar cualquier usuario | ✅ | ❌ |
| Activar / desactivar usuario | ✅ | ❌ |
| Cambiar rol de usuario | ✅ | ❌ |
| **Ver su propio perfil** | ✅ | ✅ |
| **Editar su propio perfil** (nombre, teléfono) | ✅ | ✅ |
| **Cambiar su propia contraseña** | ✅ | ✅ |

---

## 8. ADMINISTRACIÓN DEL SISTEMA

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Gestionar localidades (crear, editar, desactivar) | ✅ | ❌ |
| Ver log de auditoría | ✅ | ❌ |
| Filtrar log de auditoría | ✅ | ❌ |
| Exportar log de auditoría | ✅ | ❌ |

---

## 9. DOCUMENTOS

| Acción | Administrador TI | Usuario Final |
|---|:---:|:---:|
| Subir documento a un activo | ✅ | ❌ |
| Ver documentos de cualquier activo | ✅ | ❌ |
| Eliminar (desactivar) un documento | ✅ | ❌ |
| **Ver / descargar su propia acta de resguardo** | ✅ | 👤 |

---

## 10. RESUMEN EJECUTIVO

### Administrador TI puede:
Todo. Control operativo completo sobre activos, usuarios, asignaciones, mantenimiento, incidencias, alertas, reportes, auditoría y configuración del sistema.

### Usuario Final puede únicamente:
1. Ver su perfil y editarlo (nombre, teléfono, contraseña).
2. Ver la lista de equipos que tiene asignados actualmente.
3. Firmar digitalmente el acta de resguardo de los equipos que le son entregados.
4. Descargar su propio acta de resguardo firmada.
5. Reportar incidencias exclusivamente sobre los equipos que tiene asignados.
6. Ver el estado de sus propias incidencias.
7. Recibir notificación por email cuando una incidencia suya es resuelta.

---

## 11. IMPLEMENTACIÓN TÉCNICA

La verificación de permisos ocurre en **tres niveles independientes** (defensa en profundidad):

1. **`middleware.ts` de Next.js (borde):** Verifica que existe sesión válida y bloquea acceso a rutas de `admin_ti` si el rol es `usuario_final`. Se ejecuta antes de cualquier código de aplicación.

2. **Server Actions y Route Handlers (servidor):** Cada mutación o consulta sensible llama a `requireAdminTI()` o `requireOwnership()` antes de ejecutar cualquier lógica. Devuelve HTTP 403 si la verificación falla.

3. **UI (cliente):** Los botones y enlaces que un rol no tiene permitido simplemente no se renderizan. Esto es una mejora de UX, no de seguridad — la seguridad real está en los niveles 1 y 2.

> **Principio:** Si la seguridad de una acción depende solo de que el botón no aparezca en el frontend, el diseño está mal.
