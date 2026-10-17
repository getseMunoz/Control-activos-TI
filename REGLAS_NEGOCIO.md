# REGLAS DE NEGOCIO
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

Este documento centraliza todas las reglas de negocio del sistema. Cada regla tiene un identificador único. Las marcadas como **(innegociable)** no pueden cambiarse sin aprobación formal del responsable de TI de CIPRIJAL.

---

## RN-ACT — Activos (Inventario)

**RN-ACT-01 (innegociable):** Solo el Administrador TI puede dar de alta, editar o dar de baja equipos. El Usuario Final tiene estrictamente prohibido registrar o modificar activos. El backend rechaza la operación independientemente de si el botón es visible en el frontend.

**RN-ACT-02 (innegociable):** El número de serie es obligatorio para todo equipo. No existe equipo sin número de serie en la base de datos (`serial_number NOT NULL`). El frontend y el backend validan este campo antes de cualquier inserción.

**RN-ACT-03:** El número de serie debe ser único dentro del sistema. No pueden existir dos activos activos con el mismo número de serie. (El índice parcial excluye registros con `deleted_at IS NOT NULL`.)

**RN-ACT-04:** El código interno (formato `HW-AAAA-NNNN`) es generado automáticamente por el sistema al crear el activo. No puede ser editado manualmente por ningún usuario.

**RN-ACT-05:** Los activos dados de baja nunca se eliminan físicamente de la base de datos. El cambio a `status = decommissioned` y el archivado (`deleted_at`) son dos mecanismos independientes en el código actual — marcar un activo como `decommissioned` no establece `deleted_at` automáticamente. Todo su historial (asignaciones, mantenimientos, incidencias) se conserva íntegro en cualquier caso.

**RN-ACT-06:** La baja de un activo la ejecuta el Administrador TI directamente, sin flujo de aprobación de dos niveles. El campo de notas asociado es opcional en el código actual — no existe un campo de "motivo de baja" obligatorio dedicado.

**RN-ACT-07:** No se puede dar de baja un activo que tiene una asignación activa (`returned_at IS NULL`). El sistema debe exigir primero la devolución formal del equipo.

**RN-ACT-08:** El catálogo de tipos de hardware (`AssetType`) es una tabla administrable, no un enum fijo. El Administrador TI puede crear, editar y desactivar tipos desde la interfaz sin requerir cambios de código ni migración.

**RN-ACT-09 (futura):** se contempla que cada activo genere automáticamente un código QR único que codifique su código interno. El campo `qrCode` existe en el schema pero no se asigna en ningún flujo actual; no hay generación ni reimpresión de QR implementada.

**RN-ACT-10:** Un activo en mantenimiento activo no puede asignarse ni darse de baja hasta que la orden de trabajo se cierre o cancele.

---

## RN-ASGN — Asignaciones (Préstamos y Custodia)

**RN-ASGN-01 (innegociable):** Un activo solo puede tener una asignación activa a la vez. La base de datos enforza esta regla con un índice único parcial sobre `(asset_id) WHERE returned_at IS NULL`. El servicio también lo valida antes de insertar.

**RN-ASGN-02:** Solo el Administrador TI puede crear asignaciones (entregar equipos) y registrar devoluciones (cerrar asignaciones).

**RN-ASGN-03:** Para asignar un activo, este debe encontrarse en estado `in_storage`. No se puede asignar un activo en estado `in_maintenance`, `assigned`, `decommissioned`, `stolen` o `lost`.

**RN-ASGN-04:** Al crear una asignación, el estado del activo cambia automáticamente a `assigned`.

**RN-ASGN-05:** Al registrar la devolución de un activo, el estado del activo regresa a `in_storage`. No existe un campo de "condición del equipo al retorno" en el sistema actual.

**RN-ASGN-06:** El Administrador TI crea la asignación **sin firma**. La responsiva de entrega es una página HTML imprimible (no se genera PDF en servidor). La asignación queda marcada como "pendiente de firma de recepción" hasta que el propio Usuario Final la firme desde su portal (`/my-assets`).

**RN-ASGN-07:** La firma de recepción consiste en un dibujo gráfico capturado con canvas (mouse/touch), almacenado como imagen PNG en formato Data URL / Base64 en el campo `deliverySignatureData`. El nombre del firmante se obtiene del usuario autenticado consultado en la base de datos — nunca de un valor enviado por el cliente. No se registra IP ni ID de sesión, y no se usa criptografía PKI ni casilla de aceptación.

**RN-ASGN-07-B:** La devolución la firma el Administrador TI que recibe físicamente el equipo, con el mismo mecanismo de canvas/PNG Base64 (campo `returnSignatureData`). El nombre del firmante se resuelve desde la sesión del Administrador TI autenticado contra la base de datos — nunca desde el nombre del usuario al que estaba asignado el equipo ni desde un valor enviado por el cliente. El campo `returnedBy` registra al Administrador TI que recibió la devolución.

**RN-ASGN-08:** Una vez firmada una asignación (recepción o devolución), los campos de firma no se sobrescriben. No existe en el sistema actual un flujo de "nueva firma" sobre una asignación ya firmada.

**RN-ASGN-09:** El historial completo de asignaciones de un activo es inmutable. Ningún usuario puede editar o eliminar registros históricos de asignaciones.

**RN-ASGN-10:** Si se intenta desactivar un Usuario Final que tiene asignaciones activas, el sistema **bloquea la desactivación** con un mensaje que indica el número de equipos pendientes (no una lista detallada ni un sistema de alertas dedicado). El Administrador TI debe registrar las devoluciones antes de poder desactivar al usuario.

---

## RN-USR — Usuarios

**RN-USR-01 (innegociable):** El sistema tiene exactamente dos roles: `admin_ti` y `usuario_final`. No existen roles intermedios ni perfiles adicionales.

**RN-USR-02:** Solo el Administrador TI puede crear, editar y desactivar otros usuarios.

**RN-USR-03:** No se puede eliminar físicamente un usuario del sistema. Solo se puede desactivar (`is_active = false`). El historial de acciones del usuario se conserva en `audit_logs`.

**RN-USR-04 (innegociable):** No se puede desactivar un usuario que tiene asignaciones activas sin antes reasignar o devolver todos sus equipos. El sistema bloquea la desactivación si existen asignaciones pendientes.

**RN-USR-05:** El email de cada usuario debe ser único en el sistema. No puede haber dos cuentas con el mismo correo electrónico, ni siquiera si una está desactivada.

**RN-USR-06:** Un Usuario Final solo puede editar su propio perfil (nombre, teléfono, contraseña). No puede modificar su rol, localidad ni estado de activación.

**RN-USR-07:** Máximo 5 intentos de login fallidos consecutivos antes de bloqueo temporal de 15 minutos. El contador se reinicia con un login exitoso.

**RN-USR-08:** Las contraseñas se almacenan como hash bcrypt (cost factor mínimo 12). Nunca se almacena la contraseña en texto claro.

**RN-USR-09:** Las contraseñas deben cumplir: mínimo 8 caracteres, al menos 1 letra mayúscula, 1 número y 1 carácter especial.

---

## RN-LOC — Localidades

**RN-LOC-01:** No se puede desactivar ni eliminar una localidad que tenga equipos activos (`deleted_at IS NULL`) o usuarios activos asociados.

**RN-LOC-02:** Las localidades son un catálogo plano (sin jerarquía). Solo tienen nombre y descripción opcional. Representan ciudades, estados o regiones operativas de CIPRIJAL (ej: "Yucatán", "Tabasco").

**RN-LOC-03:** Solo el Administrador TI puede crear, editar y desactivar localidades.

---

## RN-INC — Incidencias

**RN-INC-01 (innegociable):** Un Usuario Final solo puede reportar incidencias sobre equipos que tiene asignados activamente en ese momento (`returned_at IS NULL`). El backend valida esto y rechaza la operación si el activo no pertenece al usuario.

**RN-INC-02:** Solo el Administrador TI puede cambiar el estado de una incidencia, asignarla a una orden de mantenimiento o marcarla como resuelta/cerrada.

**RN-INC-03:** Al resolver una incidencia, la descripción de la resolución es obligatoria. No se puede marcar como resuelta sin texto de cierre.

**RN-INC-04:** El número de incidencia (formato `INC-AAAA-NNNN`) es generado automáticamente por el sistema. No puede ser editado.

**RN-INC-05:** Una incidencia puede originar una orden de trabajo de mantenimiento correctivo. La relación es `1 incidencia → 0..1 orden de trabajo`.

**RN-INC-06:** Las incidencias no se eliminan físicamente. Son registros históricos permanentes.

**RN-INC-07:** El Administrador TI también puede crear incidencias directamente (sin necesidad de que venga de un Usuario Final).

---

## RN-MNT — Mantenimiento

**RN-MNT-01:** Solo el Administrador TI puede crear, editar y cerrar órdenes de trabajo de mantenimiento.

**RN-MNT-02:** Crear una orden de trabajo **no** cambia automáticamente el estado del activo a `in_maintenance` — el Administrador TI debe cambiarlo manualmente desde la edición del activo si lo desea. No hay vínculo automático entre la OT y el estado del activo en el código actual.

**RN-MNT-03:** Cerrar una orden de trabajo (estado `completed`) **no** revierte automáticamente el estado del activo — no existe esa lógica en el código actual. El cambio de estado, si se requiere, lo realiza manualmente el Administrador TI.

**RN-MNT-04:** Al cerrar una orden de trabajo, el resultado es obligatorio. La descripción del trabajo realizado es opcional en el sistema actual.

**RN-MNT-05:** El número de OT (formato `OT-AAAA-NNNN`) es generado automáticamente por el sistema.

> Las siguientes tres reglas son especificación futura — no están implementadas en el código actual.

**RN-MNT-06 (futura):** programar mantenimientos preventivos con una frecuencia configurable por activo (mensual, trimestral, semestral, anual). El modelo `MaintenanceSchedule` existe en el schema pero no tiene ninguna Server Action, query ni interfaz asociada.

**RN-MNT-07 (futura):** generar alertas automáticas 15 y 7 días antes del vencimiento de un mantenimiento preventivo programado.

**RN-MNT-08 (futura):** generar una alerta de "recomendación de baja" si un activo acumula 3 o más mantenimientos correctivos en 6 meses.

**RN-MNT-09:** Las órdenes de trabajo no se eliminan físicamente. Son registros históricos permanentes.

---

## RN-ALT — Alertas — Especificación futura / no implementada actualmente

> Todo este módulo es aspiracional. No existe modelo de alertas en el schema, no hay lógica de generación de ningún tipo, y no hay envío de correo (sin SMTP configurado). La ruta `/alerts` existe como carpeta reservada sin página activa. Las reglas siguientes describen el diseño previsto, no comportamiento actual.

**RN-ALT-01 (futura):** alertas de vencimiento de garantía, 90, 60 y 30 días antes.

**RN-ALT-02 (futura):** alerta de mantenimiento preventivo vencido, el mismo día del vencimiento.

**RN-ALT-03 (futura):** alerta inmediata al desactivar un empleado con equipos asignados. (En el sistema actual, en su lugar, la desactivación simplemente se **bloquea** — ver RN-ASGN-10.)

**RN-ALT-04 (futura):** alerta inmediata al reportarse una nueva incidencia.

**RN-ALT-05 (futura):** solo el Administrador TI podría marcar alertas como leídas, posponerlas o resolverlas.

**RN-ALT-06 (futura):** al posponer una alerta, la justificación sería obligatoria.

**RN-ALT-07 (futura):** los emails de alerta irían al Administrador TI; los de resolución de incidencia, al Usuario Final que la reportó.

---

## RN-DOC — Documentos adjuntos — Especificación futura / no implementada actualmente

> El modelo `Document` existe en el schema de Prisma, pero no hay ninguna Server Action, query ni interfaz para subir, ver o eliminar documentos. Las reglas siguientes describen el diseño previsto, no comportamiento actual.

**RN-DOC-01 (futura):** los documentos (facturas, manuales, certificados) se vincularían a un activo, asignación u orden de mantenimiento mediante `entity_type`/`entity_id` (patrón ya presente en el schema).

**RN-DOC-02 (futura):** solo el Administrador TI podría subir, editar o eliminar documentos.

**RN-DOC-03 (futura):** los documentos no se eliminarían físicamente, se marcarían como inactivos (`isActive`, ya presente en el schema).

**RN-DOC-04:** La responsiva de entrega firmada está disponible para consulta tanto para el Administrador TI como para el Usuario Final propietario de la asignación — esto **sí está implementado**, vía `/assignments/[id]/receipt`, y no depende del módulo de Documentos.

---

## RN-AUD — Auditoría

**RN-AUD-01 (innegociable):** La tabla `audit_logs` es de solo inserción. Ningún usuario ni proceso puede modificar ni eliminar registros de auditoría.

> Las siguientes tres reglas son especificación futura: el modelo `AuditLog` existe en el schema con todos los campos necesarios, pero ningún Server Action escribe en él — la tabla está vacía en todo momento.

**RN-AUD-02 (futura):** se auditaría obligatoriamente: creación, modificación y baja de activos; creación y cierre de asignaciones; cambio de estado de incidencias; creación y cierre de órdenes de mantenimiento; alta, edición y desactivación de usuarios; inicio y cierre de sesión; exportaciones de reportes; firmas.

**RN-AUD-03 (futura):** cada registro capturaría entidad afectada, acción, valores anteriores y nuevos, ID/email/rol del usuario, IP del cliente y fecha/hora UTC exacta.

**RN-AUD-04 (futura):** los datos del usuario se desnormalizarían (email y rol en el momento del evento) para preservar el historial aunque el usuario sea desactivado o su email cambie.

---

## RN-SEG — Seguridad

**RN-SEG-01 (innegociable):** Todas las rutas del sistema requieren sesión válida de NextAuth, excepto `/login`.

**RN-SEG-02 (innegociable):** Un Usuario Final no puede acceder a recursos de otros usuarios. `src/proxy.ts` bloquea el acceso a rutas completas según el rol; la verificación de que un recurso específico (ej. una asignación) pertenece al usuario autenticado se hace de forma explícita dentro de cada Server Action o página (comparando el `id` de la sesión contra el dueño del registro) — no existe un helper `requireOwnership()` genérico en el código.

**RN-SEG-03:** Los IDs expuestos en URLs y respuestas de API son siempre UUIDs. Nunca se exponen integers secuenciales (previene enumeración de recursos).

**RN-SEG-04:** Ningún dato sensible (contraseñas, IPs, credenciales) se incluye en logs del sistema.

**RN-SEG-05:** Las variables de entorno con credenciales nunca se commitean al repositorio. Se gestionan en Railway.
