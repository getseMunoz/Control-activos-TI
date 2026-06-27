# REGLAS DE NEGOCIO
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

Este documento centraliza todas las reglas de negocio del sistema. Cada regla tiene un identificador único. Las marcadas como **(innegociable)** no pueden cambiarse sin aprobación formal del responsable de TI de CIPRIJAL.

---

## RN-ACT — Activos (Inventario)

**RN-ACT-01 (innegociable):** Solo el Administrador TI puede dar de alta, editar o dar de baja equipos. El Usuario Final tiene estrictamente prohibido registrar o modificar activos. El backend devuelve HTTP 403 independientemente de si el botón es visible en el frontend.

**RN-ACT-02 (innegociable):** El número de serie es obligatorio para todo equipo. No existe equipo sin número de serie en la base de datos (`serial_number NOT NULL`). El frontend y el backend validan este campo antes de cualquier inserción.

**RN-ACT-03:** El número de serie debe ser único dentro del sistema. No pueden existir dos activos activos con el mismo número de serie. (El índice parcial excluye registros con `deleted_at IS NOT NULL`.)

**RN-ACT-04:** El código interno (formato `HW-AAAA-NNNN`) es generado automáticamente por el sistema al crear el activo. No puede ser editado manualmente por ningún usuario.

**RN-ACT-05:** Los activos dados de baja nunca se eliminan físicamente de la base de datos. Se archivan con `status = decommissioned` y `deleted_at` con la fecha de baja. Todo su historial (asignaciones, mantenimientos, incidencias) se conserva íntegro.

**RN-ACT-06:** La baja de un activo la ejecuta el Administrador TI directamente, con confirmación explícita y motivo obligatorio. No existe flujo de aprobación de dos niveles.

**RN-ACT-07:** No se puede dar de baja un activo que tiene una asignación activa (`returned_at IS NULL`). El sistema debe exigir primero la devolución formal del equipo.

**RN-ACT-08:** El catálogo de tipos de hardware en v1.0 es fijo y comprende exactamente: `desktop`, `laptop`, `raspberry_pi`, `mobile_phone`, `radio`, `printer`. El tipo se almacena como enum en la base de datos.

**RN-ACT-09:** Cada activo registrado genera automáticamente un código QR único que codifica su código interno. El código QR se puede reimprimir en cualquier momento desde el detalle del activo.

**RN-ACT-10:** Un activo en mantenimiento activo no puede asignarse ni darse de baja hasta que la orden de trabajo se cierre o cancele.

---

## RN-ASGN — Asignaciones (Préstamos y Custodia)

**RN-ASGN-01 (innegociable):** Un activo solo puede tener una asignación activa a la vez. La base de datos enforza esta regla con un índice único parcial sobre `(asset_id) WHERE returned_at IS NULL`. El servicio también lo valida antes de insertar.

**RN-ASGN-02:** Solo el Administrador TI puede crear asignaciones (entregar equipos) y registrar devoluciones (cerrar asignaciones).

**RN-ASGN-03:** Para asignar un activo, este debe encontrarse en estado `registered` o `in_storage`. No se puede asignar un activo en estado `in_maintenance` o `decommissioned`.

**RN-ASGN-04:** Al crear una asignación, el estado del activo cambia automáticamente a `assigned`.

**RN-ASGN-05:** Al registrar la devolución de un activo, se debe registrar la condición del equipo al retorno. El estado del activo regresa a `in_storage`.

**RN-ASGN-06:** El acta de resguardo se genera en PDF automáticamente al crear la asignación. La asignación queda en estado "pendiente de firma" hasta que el Usuario Final la firme digitalmente.

**RN-ASGN-07:** La firma digital del acta consiste en: el Usuario Final acepta una casilla de confirmación, y el sistema registra la fecha/hora exacta (UTC), la dirección IP del cliente y el ID de sesión. No se usa criptografía PKI.

**RN-ASGN-08:** Una vez firmada el acta, no puede modificarse ni eliminarse. Solo puede generarse una nueva si se registra una devolución y una reasignación posterior.

**RN-ASGN-09:** El historial completo de asignaciones de un activo es inmutable. Ningún usuario puede editar o eliminar registros históricos de asignaciones.

**RN-ASGN-10:** Si se desactiva un Usuario Final que tiene asignaciones activas, el sistema muestra una alerta obligatoria al Administrador TI indicando los equipos que deben ser reasignados o devueltos.

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

**RN-INC-01 (innegociable):** Un Usuario Final solo puede reportar incidencias sobre equipos que tiene asignados activamente en ese momento (`returned_at IS NULL`). El backend valida esto y devuelve HTTP 403 si el activo no pertenece al usuario.

**RN-INC-02:** Solo el Administrador TI puede cambiar el estado de una incidencia, asignarla a una orden de mantenimiento o marcarla como resuelta/cerrada.

**RN-INC-03:** Al resolver una incidencia, la descripción de la resolución es obligatoria. No se puede marcar como resuelta sin texto de cierre.

**RN-INC-04:** El número de incidencia (formato `INC-AAAA-NNNN`) es generado automáticamente por el sistema. No puede ser editado.

**RN-INC-05:** Una incidencia puede originar una orden de trabajo de mantenimiento correctivo. La relación es `1 incidencia → 0..1 orden de trabajo`.

**RN-INC-06:** Las incidencias no se eliminan físicamente. Son registros históricos permanentes.

**RN-INC-07:** El Administrador TI también puede crear incidencias directamente (sin necesidad de que venga de un Usuario Final).

---

## RN-MNT — Mantenimiento

**RN-MNT-01:** Solo el Administrador TI puede crear, editar y cerrar órdenes de trabajo de mantenimiento.

**RN-MNT-02:** Al crear una orden de trabajo para un activo, su estado cambia automáticamente a `in_maintenance`.

**RN-MNT-03:** Al cerrar una orden de trabajo (estado `completed`), el estado del activo regresa a `in_storage` si no tiene asignación activa pendiente, o a `assigned` si la tenía antes del mantenimiento.

**RN-MNT-04:** Al cerrar una orden de trabajo, el resultado y la descripción del trabajo realizado son obligatorios.

**RN-MNT-05:** El número de OT (formato `OT-AAAA-NNNN`) es generado automáticamente por el sistema.

**RN-MNT-06:** Los mantenimientos preventivos se programan con una frecuencia configurable por activo (mensual, trimestral, semestral, anual). El valor por defecto recomendado para la mayoría de los equipos es semestral (cada 6 meses).

**RN-MNT-07:** El sistema genera alertas automáticas 15 y 7 días antes de la fecha de vencimiento de un mantenimiento preventivo programado.

**RN-MNT-08:** Si un activo acumula 3 o más mantenimientos correctivos en un período de 6 meses, el sistema genera una alerta de "recomendación de baja" para el Administrador TI.

**RN-MNT-09:** Las órdenes de trabajo no se eliminan físicamente. Son registros históricos permanentes.

---

## RN-ALT — Alertas

**RN-ALT-01:** Las alertas de vencimiento de garantía se generan con 90, 60 y 30 días de anticipación.

**RN-ALT-02:** Las alertas de mantenimiento preventivo vencido se generan el mismo día del vencimiento.

**RN-ALT-03:** La alerta de empleado desactivado con equipos asignados es inmediata y se genera en el momento de la desactivación.

**RN-ALT-04:** La alerta de nueva incidencia reportada se genera inmediatamente al crear la incidencia.

**RN-ALT-05:** Solo el Administrador TI puede marcar alertas como leídas, posponerlas o resolverlas.

**RN-ALT-06:** Al posponer una alerta, la justificación es obligatoria.

**RN-ALT-07:** Los emails de alerta se envían al Administrador TI. Los emails de resolución de incidencia se envían al Usuario Final que la reportó.

---

## RN-DOC — Documentos

**RN-DOC-01:** Los documentos adjuntos (facturas, manuales, certificados) se vinculan a un activo, asignación u orden de mantenimiento mediante los campos `entity_type` y `entity_id`.

**RN-DOC-02:** Solo el Administrador TI puede subir, editar o eliminar documentos.

**RN-DOC-03:** Los documentos no se eliminan físicamente. Se marcan como inactivos.

**RN-DOC-04:** El acta de resguardo firmada está disponible para descarga tanto para el Administrador TI como para el Usuario Final receptor del equipo.

---

## RN-AUD — Auditoría

**RN-AUD-01 (innegociable):** La tabla `audit_logs` es de solo inserción. Ningún usuario ni proceso puede modificar ni eliminar registros de auditoría.

**RN-AUD-02:** Se auditan obligatoriamente: creación, modificación y baja de activos; creación y cierre de asignaciones; cambio de estado de incidencias; creación y cierre de órdenes de mantenimiento; alta, edición y desactivación de usuarios; inicio y cierre de sesión; exportaciones de reportes; firma digital de actas.

**RN-AUD-03:** Cada registro de auditoría captura: entidad afectada, acción, valores anteriores, valores nuevos, ID y email del usuario que ejecutó la acción, IP del cliente, fecha/hora UTC exacta.

**RN-AUD-04:** Los datos del usuario en `audit_logs` se desnormalizan (se copia el email y el rol en el momento del evento). Esto garantiza que el historial se preserve aunque el usuario sea desactivado o su email cambie.

---

## RN-SEG — Seguridad

**RN-SEG-01 (innegociable):** Todas las rutas del sistema requieren sesión válida de NextAuth, excepto `/login`.

**RN-SEG-02 (innegociable):** Un Usuario Final no puede acceder a recursos de otros usuarios. El middleware de Next.js y los Server Actions verifican la propiedad del recurso en todas las operaciones.

**RN-SEG-03:** Los IDs expuestos en URLs y respuestas de API son siempre UUIDs. Nunca se exponen integers secuenciales (previene enumeración de recursos).

**RN-SEG-04:** Ningún dato sensible (contraseñas, IPs, credenciales) se incluye en logs del sistema.

**RN-SEG-05:** Las variables de entorno con credenciales nunca se commitean al repositorio. Se gestionan en Railway.
