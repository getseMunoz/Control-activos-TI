# CASOS DE USO
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

---

## CONVENCIONES

- **Actor:** Quién inicia la acción.
- **Precondiciones:** Estado del sistema que debe existir antes de ejecutar el caso de uso.
- **Flujo principal:** Secuencia de pasos del escenario exitoso.
- **Flujos alternativos:** Variaciones o errores relevantes.
- **Postcondiciones:** Estado del sistema después de ejecutar el caso de uso.

---

# SECCIÓN A — ADMINISTRADOR TI

---

## CU-ADM-01: Iniciar sesión

**Actor:** Administrador TI
**Precondiciones:** El usuario existe y está activo.

**Flujo principal:**
1. El usuario accede a `/login`.
2. Ingresa su email y contraseña.
3. El sistema verifica las credenciales contra la base de datos.
4. Si son correctas, NextAuth crea una sesión y establece la cookie segura.
5. El sistema registra el evento en `audit_logs` (acción: LOGIN).
6. El usuario es redirigido a `/dashboard`.

**Flujos alternativos:**
- **Credenciales incorrectas:** El sistema incrementa `failed_login_attempts`. Muestra mensaje genérico de error (no indica si el email o la contraseña es lo incorrecto).
- **5 intentos fallidos:** El sistema bloquea la cuenta por 15 minutos. Muestra mensaje de bloqueo con tiempo restante.
- **Cuenta desactivada:** El sistema rechaza el login con mensaje "Cuenta desactivada, contacta al Administrador TI".

**Postcondiciones:** Sesión activa. El usuario puede acceder a las funcionalidades de su rol.

---

## CU-ADM-02: Registrar nuevo activo

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`.

**Flujo principal:**
1. El Administrador TI navega a `/assets/new`.
2. Selecciona el tipo de hardware (desktop, laptop, raspberry_pi, mobile_phone, radio, printer).
3. El formulario muestra los campos relevantes para ese tipo (campos estándar + especificaciones técnicas dinámicas en `specs`).
4. Completa los campos obligatorios: nombre, número de serie, condición.
5. Completa los campos opcionales: marca, modelo, fecha de compra, proveedor, garantía, localidad, notas.
6. El sistema valida que el número de serie no exista en el sistema.
7. El sistema genera automáticamente el código interno (`HW-AAAA-NNNN`).
8. El sistema genera el código QR y lo asocia al activo.
9. El activo se crea con estado `registered`.
10. El sistema registra el evento en `audit_logs` (acción: CREATE, entidad: Asset).
11. El usuario es redirigido al detalle del activo recién creado.

**Flujos alternativos:**
- **Número de serie duplicado:** El sistema muestra error "Este número de serie ya existe en el sistema" sin guardar.
- **Campo obligatorio vacío:** Validación inline antes del submit; el formulario no se envía.

**Postcondiciones:** Nuevo activo registrado con estado `registered`, código interno y QR generados.

---

## CU-ADM-03: Editar activo

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`. El activo existe y no está dado de baja.

**Flujo principal:**
1. El Administrador TI accede al detalle del activo y hace clic en "Editar".
2. El formulario carga los datos actuales del activo.
3. Modifica los campos deseados. El número de serie y el código interno no pueden modificarse si el activo tiene historial (alternativa: solo el Administrador puede corregirlo bajo justificación).
4. Guarda los cambios.
5. El sistema registra el evento en `audit_logs` con los valores anteriores y los nuevos (acción: UPDATE).

**Postcondiciones:** Activo actualizado. Registro de auditoría creado.

---

## CU-ADM-04: Dar de baja un activo

**Actor:** Administrador TI
**Precondiciones:** El activo existe, no está dado de baja y **no tiene asignación activa**.

**Flujo principal:**
1. El Administrador TI accede al detalle del activo y selecciona "Dar de baja".
2. El sistema verifica que el activo no tenga asignación activa.
3. Aparece un modal de confirmación solicitando el motivo obligatorio (texto libre).
4. El Administrador confirma la baja.
5. El sistema cambia el estado del activo a `decommissioned` y establece `deleted_at`.
6. El sistema registra el evento en `audit_logs` (acción: DELETE, con el motivo en `new_values`).

**Flujos alternativos:**
- **Activo con asignación activa:** El sistema bloquea la acción y muestra "Este equipo está asignado. Registra la devolución antes de darlo de baja."

**Postcondiciones:** Activo en estado `decommissioned`. Historial completo conservado. No se elimina físicamente.

---

## CU-ADM-05: Asignar activo a usuario

**Actor:** Administrador TI
**Precondiciones:** Sesión activa. El activo existe, está en estado `registered` o `in_storage`, y no tiene asignación activa. El usuario receptor existe y está activo.

**Flujo principal:**
1. El Administrador TI accede al detalle del activo o al módulo de asignaciones.
2. Selecciona "Asignar equipo".
3. Busca y selecciona al usuario receptor.
4. Selecciona la condición del equipo al momento de la entrega.
5. Registra opcionalmente los accesorios incluidos y observaciones.
6. Confirma la asignación.
7. El sistema crea el registro en `asset_assignments` con `returned_at = NULL`.
8. El activo cambia de estado a `assigned`.
9. El sistema genera automáticamente el acta de resguardo en PDF.
10. El sistema registra el evento en `audit_logs`.
11. Se notifica al Usuario Final que tiene un equipo asignado pendiente de firma.

**Postcondiciones:** Asignación activa registrada. Acta PDF generada. Activo en estado `assigned`.

---

## CU-ADM-06: Registrar devolución de activo

**Actor:** Administrador TI
**Precondiciones:** El activo tiene una asignación activa.

**Flujo principal:**
1. El Administrador TI accede a la asignación activa (desde el detalle del activo o desde el módulo de asignaciones).
2. Selecciona "Registrar devolución".
3. Registra la condición del equipo al momento de la recepción y observaciones opcionales.
4. Confirma la devolución.
5. El sistema establece `returned_at = NOW()` y `returned_by = userId`.
6. El activo cambia de estado a `in_storage`.
7. El sistema genera el acta de devolución en PDF si aplica.
8. El sistema registra el evento en `audit_logs`.

**Postcondiciones:** Asignación cerrada. Activo en estado `in_storage`.

---

## CU-ADM-07: Gestionar una incidencia

**Actor:** Administrador TI
**Precondiciones:** Existe al menos una incidencia en estado diferente a `closed`.

**Flujo principal:**
1. El Administrador TI accede al módulo de Incidencias.
2. Visualiza la lista de incidencias con filtros por estado, prioridad, tipo de hardware y período.
3. Selecciona una incidencia para revisar.
4. Lee el detalle: equipo afectado, descripción, prioridad, usuario que reportó.
5. Cambia el estado a `in_review` o `in_progress`.
6. Opcionalmente, crea una orden de trabajo de mantenimiento correctivo vinculada a esta incidencia.
7. Cuando el problema está resuelto, ingresa la descripción de la resolución y cambia el estado a `resolved`.
8. El sistema envía notificación por email al Usuario Final que reportó.
9. El sistema registra el cambio de estado en `audit_logs`.

**Postcondiciones:** Incidencia resuelta. Usuario notificado. Registro en auditoría.

---

## CU-ADM-08: Crear orden de trabajo de mantenimiento

**Actor:** Administrador TI
**Precondiciones:** El activo existe y no está dado de baja.

**Flujo principal:**
1. El Administrador TI accede al módulo de Mantenimiento o al detalle del activo.
2. Selecciona "Nueva orden de trabajo".
3. Selecciona el tipo: preventivo, correctivo o reparación en garantía.
4. Completa: título, descripción, prioridad, fecha programada (si aplica), proveedor externo (si aplica).
5. Opcionalmente vincula la OT a una incidencia existente.
6. El sistema genera el número de OT (`OT-AAAA-NNNN`).
7. El activo cambia de estado a `in_maintenance`.
8. El sistema registra el evento en `audit_logs`.

**Postcondiciones:** Orden de trabajo activa. Activo en estado `in_maintenance`.

---

## CU-ADM-09: Cerrar orden de trabajo

**Actor:** Administrador TI
**Precondiciones:** Existe una OT en estado diferente a `completed` o `cancelled`.

**Flujo principal:**
1. El Administrador TI accede al detalle de la OT.
2. Registra el resultado (resolved, warranty_sent, unrepairable, cancelled).
3. Ingresa la descripción del trabajo realizado (obligatorio).
4. Registra el costo del mantenimiento si aplica.
5. Confirma el cierre.
6. El activo regresa al estado que tenía antes del mantenimiento (`in_storage` o `assigned`).
7. Si la OT estaba vinculada a una incidencia, la incidencia puede marcarse como resuelta.
8. El sistema registra el evento en `audit_logs`.

**Postcondiciones:** OT cerrada. Activo regresa a su estado previo.

---

## CU-ADM-10: Crear usuario

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`.

**Flujo principal:**
1. El Administrador TI accede a `/admin/users` y selecciona "Nuevo usuario".
2. Ingresa: nombre completo, email, contraseña temporal, rol, puesto, teléfono, modalidad, localidad.
3. El sistema valida que el email no exista previamente.
4. Crea el usuario con `is_active = true` y `must_change_password = true`.
5. El sistema registra el evento en `audit_logs`.
6. Opcionalmente, envía email de bienvenida con credenciales.

**Postcondiciones:** Usuario creado. En su primer login deberá cambiar la contraseña.

---

## CU-ADM-11: Desactivar usuario

**Actor:** Administrador TI
**Precondiciones:** El usuario a desactivar existe y está activo.

**Flujo principal:**
1. El Administrador TI accede al perfil del usuario y selecciona "Desactivar".
2. El sistema verifica si el usuario tiene asignaciones activas.
3. **Si tiene asignaciones activas:** El sistema muestra una advertencia con la lista de equipos y bloquea la desactivación hasta que se registren las devoluciones.
4. **Si no tiene asignaciones activas:** Muestra modal de confirmación.
5. El Administrador confirma.
6. El sistema establece `is_active = false`.
7. El sistema cierra la sesión activa del usuario si existe.
8. El sistema registra el evento en `audit_logs`.

**Postcondiciones:** Usuario desactivado, no puede iniciar sesión.

---

## CU-ADM-12: Gestionar alertas

**Actor:** Administrador TI
**Precondiciones:** Existen alertas activas en `alert_instances`.

**Flujo principal:**
1. El Administrador TI accede al panel de alertas (`/alerts`).
2. Visualiza las alertas ordenadas por severidad y fecha.
3. Para cada alerta puede:
   - Marcarla como leída.
   - Posponerla (con justificación obligatoria).
   - Resolverla (cuando la situación ha sido atendida).
4. La campana de notificaciones en el header muestra el contador de alertas activas no leídas.

**Postcondiciones:** Alertas gestionadas. Estado actualizado.

---

## CU-ADM-13: Generar reporte

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`.

**Flujo principal:**
1. El Administrador TI accede al centro de reportes (`/reports`).
2. Selecciona el tipo de reporte deseado.
3. Configura los filtros: período, estado, tipo de hardware, etc.
4. Selecciona el formato de salida: PDF, Excel o CSV.
5. Hace clic en "Generar".
6. El servidor procesa el reporte de forma síncrona (con indicador de carga).
7. El reporte se descarga automáticamente al completarse.
8. El sistema registra la exportación en `audit_logs` (acción: EXPORT).

**Postcondiciones:** Reporte descargado. Evento registrado en auditoría.

---

## CU-ADM-14: Consultar log de auditoría

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`.

**Flujo principal:**
1. El Administrador TI accede a `/audit`.
2. Aplica filtros opcionales: entidad, acción, usuario, rango de fechas.
3. Visualiza los registros en tabla paginada con los detalles de cada evento.
4. Puede expandir un registro para ver los valores anteriores y nuevos en formato JSON.
5. Puede exportar el resultado filtrado en CSV.

**Postcondiciones:** Ninguno (operación de solo lectura).

---

## CU-ADM-15: Gestionar localidades

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`.

**Flujo principal:**
1. El Administrador TI accede a la sección de Localidades en Administración.
2. Puede crear una nueva localidad (nombre, descripción).
3. Puede editar el nombre o descripción de una localidad existente.
4. Puede desactivar una localidad solo si no tiene equipos ni usuarios activos asociados.

**Flujos alternativos:**
- **Intento de desactivar localidad con equipos o usuarios activos:** El sistema muestra error indicando cuántos registros activos la referencia.

---

## CU-ADM-16: Ver dashboard

**Actor:** Administrador TI
**Precondiciones:** Sesión activa con rol `admin_ti`.

**Flujo principal:**
1. El Administrador TI accede a `/dashboard`.
2. El sistema muestra los KPIs operativos:
   - Total de activos por estado (registrado, en almacén, asignado, en mantenimiento, baja).
   - Distribución por tipo de hardware.
   - Número de alertas activas por severidad.
   - Incidencias abiertas / en proceso.
   - Últimas asignaciones realizadas.
   - Activos con garantía próxima a vencer (próximos 90 días).

---

---

# SECCIÓN B — USUARIO FINAL

---

## CU-UF-01: Iniciar sesión

**Actor:** Usuario Final
**Precondiciones:** El usuario existe y está activo.

**Flujo principal:** Igual que CU-ADM-01. La diferencia está en la redirección: el Usuario Final es enviado a `/profile` o a la vista "Mis equipos" en lugar del dashboard.

**Postcondiciones:** Sesión activa. El usuario solo puede acceder a los recursos permitidos para `usuario_final`.

---

## CU-UF-02: Ver mis equipos asignados

**Actor:** Usuario Final
**Precondiciones:** Sesión activa.

**Flujo principal:**
1. El Usuario Final accede a la sección "Mis Equipos".
2. El sistema muestra únicamente los activos que tienen una asignación activa para este usuario (`returned_at IS NULL`).
3. Para cada equipo ve: tipo, nombre, marca, modelo, fecha de asignación y estado del acta.
4. Puede hacer clic en un equipo para ver su detalle (solo información básica, no el detalle completo del inventario).

**Postcondiciones:** Ninguno (operación de solo lectura).

---

## CU-UF-03: Firmar acta de resguardo

**Actor:** Usuario Final
**Precondiciones:** El usuario tiene una asignación pendiente de firma (acta generada pero `signed_at IS NULL`).

**Flujo principal:**
1. El Usuario Final ve una notificación en su perfil / mis equipos indicando que tiene un acta pendiente de firma.
2. Selecciona el equipo con acta pendiente.
3. El sistema presenta el acta de resguardo en PDF renderizado en el navegador.
4. El usuario lee el acta.
5. El usuario activa la casilla "He leído y acepto el acta de resguardo del equipo descrito".
6. El usuario hace clic en "Firmar digitalmente".
7. El sistema registra: `signed_at = NOW()` y `signature_ip = IP del cliente`.
8. El sistema registra el evento en `audit_logs` (acción: SIGN).
9. El acta queda disponible para descarga con el estado "Firmada".

**Flujos alternativos:**
- **Usuario no activa la casilla:** El botón "Firmar" permanece deshabilitado.

**Postcondiciones:** Acta firmada. `signed_at` y `signature_ip` registrados. Asignación completa.

---

## CU-UF-04: Reportar incidencia

**Actor:** Usuario Final
**Precondiciones:** El usuario tiene al menos un equipo asignado activamente.

**Flujo principal:**
1. El Usuario Final accede a "Mis Incidencias" y selecciona "Nueva incidencia".
2. El formulario muestra únicamente los equipos que el usuario tiene asignados actualmente (el servidor filtra por `user_id` y `returned_at IS NULL`).
3. El Usuario Final selecciona el equipo afectado.
4. Ingresa: título (resumen del problema) y descripción detallada.
5. Selecciona la prioridad que considera (low, medium, high, critical).
6. Envía el reporte.
7. El sistema genera el número de incidencia (`INC-AAAA-NNNN`) y crea el registro con `status = open`.
8. El sistema notifica inmediatamente al Administrador TI por email y alerta en el sistema.
9. El sistema registra el evento en `audit_logs`.

**Flujos alternativos:**
- **Usuario sin equipos asignados:** El formulario muestra "No tienes equipos asignados actualmente. No puedes reportar incidencias."
- **Intento de reportar sobre un equipo ajeno:** El backend devuelve HTTP 403 aunque el frontend no debería permitirlo.

**Postcondiciones:** Incidencia creada. Administrador TI notificado.

---

## CU-UF-05: Ver estado de mis incidencias

**Actor:** Usuario Final
**Precondiciones:** Sesión activa.

**Flujo principal:**
1. El Usuario Final accede a "Mis Incidencias".
2. El sistema muestra solo las incidencias que el usuario reportó (filtro por `reported_by = userId`).
3. Visualiza: número de incidencia, equipo, título, estado actual, fecha de creación y resolución (si aplica).
4. Puede ver el detalle de cada incidencia (descripción, historial de cambios de estado, texto de resolución).

**Postcondiciones:** Ninguno (operación de solo lectura).

---

## CU-UF-06: Ver y editar perfil

**Actor:** Usuario Final
**Precondiciones:** Sesión activa.

**Flujo principal:**
1. El Usuario Final accede a `/profile`.
2. Ve su información: nombre, email, puesto, modalidad, localidad, teléfono.
3. Puede editar: nombre, teléfono.
4. Puede cambiar su contraseña (requiere contraseña actual + nueva contraseña que cumpla la política).
5. Guarda los cambios.
6. El sistema registra el evento en `audit_logs` (acción: UPDATE).

**Flujos alternativos:**
- **Contraseña actual incorrecta:** Error "Contraseña actual incorrecta".
- **Nueva contraseña no cumple la política:** Error con indicación de requisitos.

**Postcondiciones:** Perfil actualizado.

---

## CU-UF-07: Descargar acta de resguardo firmada

**Actor:** Usuario Final
**Precondiciones:** El usuario tiene al menos un acta firmada.

**Flujo principal:**
1. El Usuario Final accede a "Mis Equipos" o al detalle de un equipo.
2. Selecciona "Descargar acta".
3. El servidor verifica que el `userId` del acta coincide con el usuario en sesión.
4. El sistema sirve el PDF del acta.

**Flujos alternativos:**
- **Intento de descargar un acta ajena:** El servidor devuelve HTTP 403.

**Postcondiciones:** PDF descargado.

---

## CU-UF-08: Cerrar sesión

**Actor:** Usuario Final (o Administrador TI)
**Precondiciones:** Sesión activa.

**Flujo principal:**
1. El usuario hace clic en "Cerrar sesión".
2. NextAuth invalida la cookie de sesión.
3. El sistema registra el evento en `audit_logs` (acción: LOGOUT).
4. El usuario es redirigido a `/login`.

**Postcondiciones:** Sesión terminada. Cookie invalidada.
