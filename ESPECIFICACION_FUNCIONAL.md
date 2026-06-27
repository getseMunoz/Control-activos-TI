# ESPECIFICACION FUNCIONAL
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0  
**Fecha:** 2026-06-25  
**Estado:** Borrador para revisión

---

## 1. OBJETIVO DEL SISTEMA

Proveer a CIPRIJAL una plataforma centralizada para la gestión integral del ciclo de vida de sus activos tecnológicos, desde la adquisición hasta la baja definitiva, garantizando:

- Control de inventario en tiempo real.
- Trazabilidad completa de responsabilidades.
- Optimización del gasto tecnológico en equipos de hardware.
- Disponibilidad de información para auditorías internas y externas.
- Planificación de mantenimientos y renovaciones.

---

## 2. ALCANCE

### 2.1 Dentro del Alcance — v1.0

- Gestión de hardware físico del catálogo de 6 tipos de dispositivos definidos (ver Sección 4.1).
- Ciclo de vida completo del hardware: registro → asignación → mantenimiento → baja.
- Asignación de equipos a empleados con generación de acta de resguardo PDF y firma digital.
- Historial completo de estados, asignaciones y mantenimientos de cada activo.
- Reporte de incidencias por parte del Usuario Final sobre sus propios equipos.
- Gestión de mantenimientos preventivos y correctivos (órdenes de trabajo).
- Control de garantías con alertas automáticas de vencimiento.
- Sistema de alertas automáticas por email y notificaciones en el sistema.
- Reportes exportables (PDF, Excel, CSV) para operación y auditoría.
- Panel de control (dashboard) con indicadores operativos.
- Generación de códigos QR por activo para identificación física.
- Gestión de documentos adjuntos al activo (manuales, fotografías, certificados).
- Registro de auditoría inmutable de todas las operaciones.
- Administración del sistema: usuarios, localidades y configuración de alertas.

### 2.2 Fuera del Alcance — v1.0 (Mejoras Futuras sin Fecha)

Los siguientes módulos quedan fuera de la versión 1.0. Están documentados en ROADMAP.md como mejoras futuras y se priorizarán según las necesidades reales de CIPRIJAL después de la puesta en marcha:

- **Gestión de proveedores y contratos** — Registro de proveedores, contratos de soporte, SLAs y alertas de vencimiento de contratos.
- **Gestión de licencias de software** — Control de licencias, cumplimiento (compliance), vencimientos y asignación a activos o empleados.
- **Módulo financiero avanzado** — Depreciación automática (TCO), presupuesto de TI, valor residual, reportes financieros.
- Descubrimiento automático de red (network scanning).
- Gestión de activos no tecnológicos (mobiliario, vehículos).
- Aplicación móvil nativa.
- Integración con sistemas ERP o contabilidad.
- Integración con Active Directory / LDAP.

---

## 3. USUARIOS DEL SISTEMA

### 3.1 Tipos de Usuario

El sistema tiene exactamente **dos roles**. No existen roles intermedios ni perfiles adicionales.

| ID | Rol | Descripción |
|---|---|---|
| ROL-01 | Administrador TI | Control operativo total del sistema. Es el único perfil con capacidad de gestión. Puede dar de alta, editar y dar de baja usuarios, equipos y ubicaciones. Es el único que puede realizar asignaciones (préstamos), registrar mantenimientos, registrar gastos y gestionar el estado de las incidencias. Tiene acceso completo a reportes, dashboard y auditoría. |
| ROL-02 | Usuario Final | Cualquier empleado de CIPRIJAL que no pertenezca al equipo de TI. Acceso sumamente restringido: solo puede ver su propio perfil, consultar los equipos que tiene asignados actualmente, firmar digitalmente el acta de resguardo/recepción de equipos que se le asignen, y levantar incidencias exclusivamente sobre los equipos que tiene en su poder. No tiene acceso al inventario general, al dashboard financiero, ni a configuración alguna. |

### 3.2 Matriz de Acceso por Módulo

| Módulo | Administrador TI | Usuario Final |
|---|---|---|
| Inventario completo | CRUD | — |
| Asignaciones (préstamos) | CRUD | R (solo sus propias asignaciones activas) |
| Mantenimientos | CRUD | — |
| Incidencias | CRUD (gestión completa) | C (solo sobre equipos propios) |
| Reportes y dashboard | Acceso total | — |
| Alertas del sistema | CRUD | R (solo alertas sobre sus equipos) |
| Log de auditoría | R | — |
| Documentos y adjuntos | CRUD | Firmar acta de resguardo |
| Administración del sistema | CRUD | — |
| Mi perfil | CRUD | R (solo lectura) |
| Mis equipos asignados | — | R |

*C=Crear, R=Leer, U=Actualizar, D=Eliminar*

---

## 4. MÓDULOS FUNCIONALES

### 4.1 MÓDULO: INVENTARIO DE ACTIVOS

**Propósito:** Registro centralizado y maestro de todos los activos tecnológicos de CIPRIJAL.

**Catálogo de tipos de hardware — v1.0**

El sistema gestiona exclusivamente los siguientes seis tipos de dispositivos. Este catálogo es el punto de partida; el Administrador TI puede agregar nuevos tipos desde la configuración del sistema si CIPRIJAL incorpora dispositivos adicionales en el futuro.

| # | Tipo de Hardware | Descripción |
|---|---|---|
| 1 | Computadora de escritorio | PC de torre o All-in-One de uso en oficina |
| 2 | Laptop | Computadora portátil de cualquier marca o tamaño |
| 3 | Raspberry Pi | Computadora de placa única (SBC) para proyectos o automatizaciones |
| 4 | Teléfono celular | Smartphone corporativo asignado a empleados |
| 5 | Radio de comunicación | Equipos de radiocomunicación (walkie-talkies, radios digitales) |
| 6 | Impresora | Impresora, multifuncional o plotter de cualquier tipo |

**Campos del Registro de Activo:**

| Campo | Descripción | Obligatorio |
|---|---|---|
| Código interno | Identificador único generado por el sistema (ej: HW-2024-001) | Sí |
| Número de serie | Número de serie del fabricante | Condicional (hardware) |
| Nombre descriptivo | Nombre legible del activo | Sí |
| Categoría | Tipo principal de activo | Sí |
| Subcategoría | Tipo específico dentro de la categoría | Sí |
| Marca | Fabricante del activo | Condicional |
| Modelo | Modelo exacto del fabricante | Condicional |
| Estado | Activo / En mantenimiento / En almacén / Dado de baja / Robado / Perdido | Sí |
| Condición | Bueno / Regular / Dañado / Obsoleto | Sí |
| Fecha de adquisición | Fecha de compra o ingreso al inventario | Sí |
| Valor de compra | Precio pagado en moneda local y USD | Sí |
| Proveedor | Nombre del proveedor del equipo (texto libre) | Opcional |
| Número de factura | Referencia de la factura de compra | Sí |
| Fecha de garantía | Fecha de vencimiento de garantía del fabricante | Condicional |
| Ubicación | Localidad operativa donde se encuentra el equipo (ej: "Yucatán", "Tabasco") | Sí |
| Asignado a | Empleado o área responsable | Condicional |
| Fecha de asignación | Cuándo fue asignado | Condicional |
| Especificaciones técnicas | JSON con specs según el tipo de activo | Condicional |
| Etiqueta QR/código de barras | Código para identificación física | Generado |
| Imagen del activo | Fotografía del equipo | Opcional |
| Notas | Observaciones adicionales | Opcional |

**Especificaciones técnicas por tipo de hardware:**

| Tipo | Campos de especificación |
|---|---|
| Computadora de escritorio | Procesador, RAM (GB), almacenamiento (GB/tipo), sistema operativo, dirección MAC, IP asignada |
| Laptop | Procesador, RAM (GB), almacenamiento (GB/tipo), sistema operativo, dirección MAC, IP asignada, tamaño de pantalla |
| Raspberry Pi | Modelo (ej: Pi 4B), RAM (GB), almacenamiento (GB), sistema operativo, dirección MAC, IP asignada, uso/propósito |
| Teléfono celular | Marca, modelo, IMEI, número de línea (si aplica), sistema operativo, versión |
| Radio de comunicación | Modelo, frecuencia (MHz), tipo (analógico/digital), banda (VHF/UHF) |
| Impresora | Tipo (laser/inkjet/térmica), color/mono, IP de red (si aplica), número de bandeja |

**Reglas de Negocio:**

- **BR-INV-01 *(innegociable)*:** El código interno es generado automáticamente por el sistema (formato HW-YYYY-NNNN) y nunca se repite ni puede modificarse manualmente.
- **BR-INV-02 *(innegociable)*:** El número de serie es **obligatorio** para el registro de cualquier equipo. El campo es no-nulable en la base de datos. No se puede guardar un activo sin número de serie bajo ninguna circunstancia.
- **BR-INV-03 *(innegociable)*:** El número de serie debe ser único en el sistema. Si se intenta registrar un serial ya existente, el sistema rechaza el registro con un mensaje de error claro indicando qué activo ya posee ese número de serie.
- **BR-INV-04 *(innegociable)*:** Solo el **Administrador TI** puede dar de alta, editar o dar de baja un equipo. El **Usuario Final tiene estrictamente prohibido** registrar, modificar o eliminar activos. Cualquier intento devuelve HTTP 403. Esta restricción se aplica en el backend y no depende de si los botones están visibles en el frontend.
- BR-INV-05: Un activo no puede estar en estado "Asignado" sin tener un empleado receptor activo vinculado.
- BR-INV-06: Un activo dado de baja no puede ser reasignado. Si un activo dado de baja se recupera y rehabilita, debe registrarse como un nuevo activo.
- BR-INV-07: Todos los cambios de estado generan automáticamente una entrada en el historial del activo y en el log de auditoría.
- BR-INV-08: Los activos dados de baja nunca se eliminan físicamente de la base de datos. Solo se archivan (soft delete). El Administrador TI puede consultarlos en el historial.

---

### 4.2 MÓDULO: CICLO DE VIDA DEL ACTIVO

**Propósito:** Gestionar los estados por los que pasa un activo desde su ingreso hasta su disposición final.

**Estados del Ciclo de Vida:**

```
[Registrado] → [En Almacén] → [Asignado] → [En Mantenimiento] → [En Almacén]
                                    ↓                                    ↓
                              [Dado de Baja] ←────────────────────────────
                                    ↓
                         [En Proceso de Disposición]
                                    ↓
                              [Archivado]
```

**Transiciones permitidas:**

| Desde | Hacia | Quién puede | Requiere aprobación |
|---|---|---|---|
| Registrado | En Almacén | Administrador TI | No |
| En Almacén | Asignado | Administrador TI | No |
| Asignado | En Mantenimiento | Administrador TI | No |
| En Mantenimiento | Asignado | Administrador TI | No |
| En Mantenimiento | En Almacén | Administrador TI | No |
| Asignado | En Almacén | Administrador TI | No |
| Cualquiera | Dado de Baja | Administrador TI | No (confirmación explícita con motivo) |
| Dado de Baja | En Proceso de Disposición | Administrador TI | No |
| En Proceso de Disposición | Archivado | Administrador TI | No |

**Reglas de Negocio:**
- BR-CL-01: Un activo solo puede estar en un estado a la vez.
- BR-CL-02: Cada transición de estado requiere ingresar el motivo del cambio.
- BR-CL-03: El cambio a "Dado de Baja" libera automáticamente la asignación activa del empleado receptor (si existe).
- BR-CL-04: El proceso de disposición debe incluir el método de borrado seguro (si aplica) y la persona responsable del proceso.
- BR-CL-05: Un activo no puede pasar a mantenimiento sin crear primero un registro de orden de trabajo.

---

### 4.3 MÓDULO: ASIGNACIONES

**Propósito:** Control de a quién o a qué área pertenece cada activo, con historial completo de todos los cambios.

**Entidades de asignación:**
- Empleado (persona física)
- Departamento / Área
- Proyecto
- Sede / Ubicación

**Flujo de Asignación:**

1. Administrador TI genera la asignación seleccionando el activo y el empleado receptor.
2. El sistema verifica que el activo está disponible (estado "En Almacén") y que el empleado está activo.
3. Se registra la asignación con: activo, empleado receptor, fecha, condición del activo al momento de entrega y accesorios incluidos.
4. El sistema genera automáticamente el acta digital de resguardo/recepción en PDF.
5. El sistema notifica al Usuario Final receptor para que acceda al sistema y firme digitalmente el acta.
6. Una vez firmada, el activo queda oficialmente en estado "Asignado".

**Acta de Entrega y Devolución:**
- Documento generado automáticamente con: datos del activo, condición, accesorios incluidos, responsable que entrega, receptor, firma digital (si se implementa) o código de confirmación.
- Al devolver un activo, se genera automáticamente un acta de devolución comparando condición inicial vs condición de retorno.

**Reglas de Negocio:**
- BR-AS-01: Un activo solo puede estar asignado a una entidad a la vez (empleado, área o proyecto).
- BR-AS-02: Al reasignar un activo, el sistema registra automáticamente la devolución del asignatario anterior.
- BR-AS-03: Un empleado no puede tener asignado un activo si está inactivo en el sistema (empleado dado de baja).
- BR-AS-04: Al desactivar un empleado, el sistema alerta sobre todos los activos que tiene asignados y requiere reasignación o devolución.
- BR-AS-05: El historial de asignaciones es inmutable. No puede modificarse, solo consultarse.

---

### 4.4 MÓDULO: GESTIÓN DE LICENCIAS DE SOFTWARE

> **FUERA DEL ALCANCE — v1.0**
>
> Este módulo no se implementará en la versión 1.0. Está documentado como **Mejora Futura MF-02** en ROADMAP.md. Se priorizará después de que el inventario de hardware esté estabilizado en producción.

---

### 4.5 MÓDULO: MANTENIMIENTO

**Propósito:** Planificar y registrar todos los mantenimientos (preventivos y correctivos) de los activos.

**Tipos de mantenimiento:**
- **Preventivo:** Planificado con anticipación. Seguimiento de un calendario de mantenimiento.
- **Correctivo:** Generado por una falla o incidencia reportada.
- **Predictivo:** Basado en indicadores de desgaste o rendimiento (para versiones futuras).

**Flujo de Orden de Trabajo (OT):**

1. Creación de OT: por el Administrador TI de forma manual, automática por el calendario preventivo, o al atender una incidencia reportada por un Usuario Final.
2. Administrador TI cambia el estado del activo a "En Mantenimiento".
3. Administrador TI registra los trabajos realizados (descripción, repuestos usados, costo, tiempo empleado).
4. Si se requiere servicio externo: se registra el proveedor, número de caso de soporte externo y estado "En reparación con proveedor".
5. Cierre de la OT con resultado: Resuelto / Derivado a garantía / Irreparable.
6. Cambio de estado del activo según resultado (regresa a "Asignado", "En Almacén", o avanza a "Dado de Baja").

**Estados de una Orden de Trabajo:**
- Pendiente → Asignada → En Progreso → Esperando Repuesto → Cerrada / Cancelada

**Reglas de Negocio:**
- BR-MNT-01: Todo mantenimiento preventivo vencido sin ejecutar genera una alerta automática.
- BR-MNT-02: Si un activo entra a mantenimiento correctivo por tercera vez en 6 meses, el sistema marca automáticamente una recomendación de baja.
- BR-MNT-03: El tiempo promedio de resolución (MTTR) se calcula automáticamente por tipo de activo y categoría.
- BR-MNT-04: El costo de mantenimiento queda registrado en la OT como referencia histórica del activo.
- BR-MNT-05: Un activo bajo garantía debe registrar si el mantenimiento se efectuó bajo dicha garantía, ya que el servicio externo no autorizado puede invalidarla.

---

### 4.6 MÓDULO: GESTIÓN DE PROVEEDORES Y CONTRATOS

> **FUERA DEL ALCANCE — v1.0**
>
> Este módulo no se implementará en la versión 1.0. Está documentado como **Mejora Futura MF-01** en ROADMAP.md. El campo "Proveedor" en el registro del activo se mantiene como texto libre en v1.0 para preservar la referencia de compra sin requerir el módulo completo.

---

### 4.7 MÓDULO: GESTIÓN DE DOCUMENTOS

**Propósito:** Almacenar y vincular documentos digitales a activos y órdenes de mantenimiento.

**Tipos de documentos — v1.0:**
- Garantías (certificados de garantía del fabricante)
- Manuales técnicos
- Fotografías del equipo
- Actas de entrega/resguardo (generadas por el sistema)
- Actas de devolución (generadas por el sistema)
- Reportes de mantenimiento
- Certificados de borrado seguro (para bajas)
- Otros documentos relacionados al activo

**Reglas de Negocio:**
- BR-DOC-01: Los documentos no se eliminan. Solo pueden marcarse como inactivos.
- BR-DOC-02: Tipos de archivo permitidos: PDF, JPG, PNG, XLSX, DOCX. Tamaño máximo por archivo: 25 MB.
- BR-DOC-03: Todo activo con valor de compra superior al umbral configurado (ej: $500 USD) debe tener al menos una factura adjunta antes de poder ser marcado como "Activo".

---

### 4.8 MÓDULO: GESTIÓN FINANCIERA DE ACTIVOS

> **FUERA DEL ALCANCE — v1.0**
>
> Este módulo no se implementará en la versión 1.0. Está documentado como **Mejora Futura MF-03** en ROADMAP.md. El campo "Valor de compra" en el registro del activo se mantiene en v1.0 como dato informativo, sin cálculos de depreciación ni TCO automáticos.

---

### 4.9 MÓDULO: ALERTAS Y NOTIFICACIONES

**Propósito:** Garantizar que los responsables sean notificados proactivamente antes de que ocurran vencimientos, superaciones de umbral o situaciones críticas.

**Eventos que generan alertas — v1.0:**

| Evento | Destinatario | Anticipación |
|---|---|---|
| Vencimiento de garantía de activo | Administrador TI | 90, 60, 30 días |
| Mantenimiento preventivo próximo | Administrador TI | 15 y 7 días |
| Mantenimiento preventivo vencido | Administrador TI | Día del vencimiento |
| Activo con mantenimiento correctivo recurrente | Administrador TI | Al tercer evento en 6 meses |
| Activo sin movimiento de inventario > 12 meses | Administrador TI | Mensual |
| Empleado desactivado con activos asignados | Administrador TI | Inmediata |
| Nueva incidencia reportada por Usuario Final | Administrador TI | Inmediata |

**Canales de notificación:**
- Notificación interna en el sistema (panel de alertas).
- Correo electrónico (SMTP configurable).
- Futuro (v2.0): integración con Slack / Teams / WhatsApp Business.

**Reglas de Negocio:**
- BR-ALT-01: Las alertas no pueden desactivarse globalmente. Se pueden posponer individualmente con justificación.
- BR-ALT-02: Cada alerta queda registrada en el historial aunque haya sido leída o pospuesta.
- BR-ALT-03: El umbral de anticipación de alertas es configurable por el Administrador TI desde la configuración del sistema.

---

### 4.10 MÓDULO: REPORTES Y DASHBOARD

**Propósito:** Proveer información estratégica y operativa para la toma de decisiones.

**Dashboard Ejecutivo:**
- Total de activos por estado (activos, en mantenimiento, en almacén, dados de baja).
- Activos por categoría.
- Alertas activas por prioridad.
- Valor total del inventario vs. valor depreciado.
- Top 5 activos con mayor costo de mantenimiento.
- Activos con más incidencias activas.
- Últimas 5 asignaciones realizadas.

**Reportes incluidos en v1.0:**

| Reporte | Filtros disponibles | Formatos |
|---|---|---|
| Inventario completo de hardware | Tipo, estado, ubicación, fecha de registro | PDF, Excel, CSV |
| Activos asignados por empleado | Empleado, tipo, fecha | PDF, Excel |
| Historial completo de un activo | Código interno | PDF |
| Historial de asignaciones | Empleado, fecha | PDF, Excel |
| Órdenes de mantenimiento | Estado, tipo, período | PDF, Excel |
| Incidencias por período | Estado, empleado, tipo de hardware | PDF, Excel |
| Activos dados de baja | Período, motivo, tipo | PDF, Excel |
| Activos próximos a vencer garantía | Rango de fechas | PDF, Excel |

**Reglas de Negocio:**
- BR-RPT-01: Los reportes deben poder programarse para envío automático por email en frecuencia configurable.
- BR-RPT-02: Los reportes generados quedan almacenados durante 12 meses para consulta posterior.

---

### 4.11 MÓDULO: AUDITORÍA DEL SISTEMA

**Propósito:** Mantener un registro inmutable de todas las acciones realizadas en el sistema para soporte de auditorías, seguridad e investigación de incidentes.

**Información registrada en cada evento:**
- Fecha y hora exacta (UTC con timezone local).
- Usuario que realizó la acción.
- Dirección IP desde la que se accedió.
- Módulo y entidad afectada.
- Tipo de acción (Crear, Leer, Actualizar, Eliminar, Login, Logout, Export).
- Valores anteriores y nuevos (para actualizaciones).
- Resultado de la acción (éxito / error).

**Reglas de Negocio:**
- BR-AUD-01: El log de auditoría es de solo lectura. Ningún usuario, incluyendo el Administrador TI, puede modificar o eliminar entradas del log.
- BR-AUD-02: El log de auditoría debe retenerse por al menos 5 años.
- BR-AUD-03: El acceso al log de auditoría está restringido exclusivamente al Administrador TI.

---

### 4.12 MÓDULO: ADMINISTRACIÓN DEL SISTEMA

**Propósito:** Configurar y personalizar el comportamiento del sistema para adaptarlo a las necesidades de CIPRIJAL.

**Configuraciones disponibles:**
- Gestión de usuarios: crear, editar, activar/desactivar. El rol se asigna como Administrador TI o Usuario Final.
- Localidades operativas (catálogo plano: ciudades, estados o regiones donde opera CIPRIJAL).
- Departamentos y áreas.
- Categorías y subcategorías de activos.
- Umbrales de alertas.
- Tasa de cambio de divisas.
- Vida útil predeterminada por categoría.
- Umbral de valor para requerir aprobación en asignaciones.
- Configuración de email (SMTP).
- Configuración de retención de datos.
- Parámetros de seguridad (intentos de login, tiempo de sesión).
- Copia de seguridad y restauración.

---

## 5. FLUJO COMPLETO DEL SISTEMA

### 5.1 Flujo Principal: Adquisición y Puesta en Servicio

```
1. Compra → Proveedor entrega el equipo al equipo de TI.
2. Administrador TI registra el activo en el sistema con datos completos.
3. Administrador TI adjunta la factura y certificado de garantía al registro del activo.
4. Activo pasa a estado "En Almacén".
5. Administrador TI crea la asignación seleccionando el activo y el empleado receptor.
6. Sistema genera automáticamente el acta de resguardo/recepción en PDF.
7. Sistema notifica al Usuario Final receptor.
8. Usuario Final accede al sistema, revisa el acta y la firma digitalmente.
9. Activo pasa a estado "Asignado" tras la firma.
10. Sistema activa el calendario de mantenimiento preventivo para ese activo.
```

### 5.2 Flujo: Mantenimiento Correctivo

```
1. Usuario Final reporta una incidencia sobre un equipo asignado, O Administrador TI la detecta directamente.
2. Administrador TI revisa la incidencia y crea la Orden de Trabajo (OT) de tipo Correctivo.
3. Activo pasa a estado "En Mantenimiento".
4. Administrador TI ejecuta diagnóstico y registra hallazgos en la OT.
   4a. Si resolvible internamente → registra reparación, costo y cierra OT.
   4b. Si requiere garantía → envía a proveedor, registra número de caso → activo pasa a "En reparación con proveedor".
   4c. Si irreparable → registra como "Irreparable" → inicia proceso de baja.
5. Al resolver: activo regresa al estado anterior (Asignado o En Almacén).
6. Sistema registra el costo del mantenimiento en la OT como historial del activo.
7. Sistema actualiza el estado de la incidencia original (si fue reportada por Usuario Final) y notifica la resolución.
```

### 5.3 Flujo: Baja de un Activo

```
1. Administrador TI identifica activo candidato a baja (daño irreparable, obsolescencia, robo, pérdida).
2. Administrador TI registra la solicitud de baja con motivo obligatorio y confirmación explícita.
3. Sistema libera automáticamente la asignación activa del empleado (si el activo estaba asignado).
4. Activo pasa a estado "Dado de Baja".
5. Sistema notifica al empleado que tenía el equipo asignado (si aplica) que el activo ha sido dado de baja.
6. Administrador TI inicia proceso de disposición y registra el método:
   - Donación: documenta el receptor y fecha.
   - Venta: registra el precio y comprador.
   - Descarte: documenta el proceso de borrado seguro (NIST 800-88) y disposición física.
7. Activo pasa a "En Proceso de Disposición" → "Archivado".
8. El registro permanece en el sistema con todo su historial completo.
```

---

## 6. MEJORAS FUTURAS IDENTIFICADAS (SIN FECHA)

Las siguientes funcionalidades están identificadas, documentadas y recomendadas, pero quedan fuera del alcance de la v1.0. Se evaluarán para implementación posterior según las necesidades de CIPRIJAL. El detalle completo está en ROADMAP.md.

### F-REC-01: Inventario Físico Asistido (Conciliación)
**Qué es:** Proceso periódico (trimestral/anual) donde el técnico recorre físicamente las instalaciones con un dispositivo (tablet o smartphone) y escanea los códigos QR/barcodes de los activos para verificar que el inventario físico coincide con el sistema.
**Por qué:** Sin verificación física, el sistema se desincroniza de la realidad. Los activos pueden perderse, moverse o dañarse sin actualizarse en el sistema. La conciliación detecta discrepancias antes de que se conviertan en problemas de auditoría.

### F-REC-02: Generación de Códigos QR y Etiquetas
**Qué es:** Generación automática de etiquetas con código QR imprimibles para cada activo, que contengan el código interno y datos básicos.
**Por qué:** Sin etiquetado físico, la identificación de activos es manual y propensa a errores. El QR permite al técnico identificar inmediatamente un activo escaneándolo con el teléfono, sin búsquedas manuales.

### F-REC-03: Portal de Reportes de Incidencias para Usuarios Finales
**Qué es:** Formulario simplificado donde cualquier empleado puede reportar que un activo asignado tiene una falla, sin acceder a los módulos técnicos del sistema.
**Por qué:** Formaliza el canal de reporte de fallas, elimina los reportes verbales o por WhatsApp que se pierden, y crea automáticamente una Orden de Trabajo en el módulo de mantenimiento.

### F-REC-04: Gestión de Reservas de Activos Compartidos
**Qué es:** Sistema de calendario para reservar activos que son de uso compartido (proyectores, salas de videoconferencia, equipos de préstamo).
**Por qué:** Evita conflictos de uso, permite planificación y da visibilidad de la disponibilidad de recursos compartidos sin depender de comunicación informal.

### F-REC-05: Gestión de Certificados SSL y Dominios
**Qué es:** Registro específico para certificados SSL/TLS y dominios web con fechas de vencimiento y alertas.
**Por qué:** Un certificado SSL vencido causa interrupciones del servicio que afectan directamente a los usuarios. Sin un sistema de control, estos vencimientos ocurren por descuido. Es un activo digital crítico de bajo costo pero alto impacto si no se renueva.

### F-REC-06: Seguimiento de Activos en Garantía con Proveedor
**Qué es:** Estado adicional para activos enviados al servicio técnico del proveedor bajo garantía, con número de caso, fecha estimada de retorno y proveedor responsable.
**Por qué:** Sin este estado, el activo puede marcarse como "perdido" o su seguimiento depende de comunicaciones informales. Cuando hay varios activos en garantía simultáneamente, sin sistema se pierde fácilmente el rastro.

### F-REC-07: Módulo de Seguros
**Qué es:** Registro de pólizas de seguro que cubren activos de TI, con cobertura, prima, vigencia y activos incluidos.
**Por qué:** Los equipos de alto valor (servidores, laptops, equipos especializados) frecuentemente están cubiertos por seguros corporativos. Sin un registro centralizado, al momento de un siniestro la empresa no tiene documentación inmediata de los activos afectados.

### F-REC-08: Historial de Precios y Control de Presupuesto
**Qué es:** Registro histórico del precio de compra de diferentes marcas/modelos para comparación futura, y control del presupuesto de TI con alertas por categoría.
**Por qué:** Permite fundamentar decisiones de compra con datos históricos propios de la empresa y controlar el gasto de TI en tiempo real antes de que se agote el presupuesto asignado.

### F-REC-09: Calculadora de Renovación y Planificación de Reemplazo
**Qué es:** Reporte que identifica activos que en los próximos 6-12 meses alcanzarán el fin de su vida útil o se depreciarán completamente, estimando el costo de reemplazo.
**Por qué:** Permite a la gerencia anticipar el presupuesto necesario para renovación tecnológica, evitando sorpresas presupuestarias y planificando compras con tiempo suficiente para un proceso de adquisición formal.

### F-REC-10: Integración con Directorio Activo (LDAP/AD)
**Qué es:** Sincronización automática de usuarios y estructura organizacional desde el Active Directory de la empresa.
**Por qué:** Evita mantener dos bases de datos de empleados sincronizadas manualmente. Cuando un empleado ingresa o sale de la empresa, el sistema de activos se actualiza automáticamente. Reduce errores humanos y simplifica la administración.

---

## 7. REGLAS DE NEGOCIO TRANSVERSALES

- RN-001: Todas las fechas del sistema se almacenan en UTC y se muestran en la zona horaria configurada para CIPRIJAL.
- RN-002: Los montos económicos se almacenan en dos campos: moneda local (VEF/USD según configuración) y USD para comparabilidad histórica.
- RN-003: Ningún dato histórico se elimina físicamente del sistema. Las eliminaciones son lógicas (soft delete).
- RN-004: Toda exportación de datos queda registrada en el log de auditoría con el usuario que la realizó.
- RN-005: El sistema debe funcionar correctamente con hasta 10,000 activos de hardware registrados y 200 usuarios concurrentes.
- RN-006: La sesión de usuario expira automáticamente tras 30 minutos de inactividad (configurable).
- RN-007: Los campos de búsqueda deben soportar búsqueda por código interno, número de serie, nombre, marca y modelo.

---

## 8. CASOS DE USO CRÍTICOS

### CU-01: Registrar un nuevo activo
- **Actor:** Administrador TI
- **Precondición:** Usuario autenticado con rol Administrador TI.
- **Flujo:** Administrador TI ingresa datos del activo → Sistema valida campos obligatorios y unicidad del número de serie → Sistema genera código interno automáticamente → Sistema guarda activo en estado "Registrado" → Sistema genera entrada en log de auditoría → Sistema muestra confirmación con el código generado.

### CU-02: Asignar activo a empleado (Préstamo)
- **Actor:** Administrador TI
- **Precondición:** Activo en estado "En Almacén". Empleado activo en el sistema.
- **Flujo:** Administrador TI busca el activo → Selecciona el empleado destino → Sistema verifica que el activo está disponible y el empleado está activo → Sistema registra la asignación → Sistema genera el acta de resguardo/recepción en PDF → Sistema notifica al Usuario Final para que firme el acta → Usuario Final accede al sistema y firma digitalmente → Activo pasa a estado "Asignado" → Log de auditoría registra la asignación.

### CU-03: Dar de baja un activo
- **Actor:** Administrador TI
- **Precondición:** Activo existe y no está ya archivado.
- **Flujo:** Administrador TI selecciona el activo → Registra la baja con motivo obligatorio y confirmación explícita → Sistema libera automáticamente la asignación activa del empleado → Activo pasa a estado "Dado de Baja" → Administrador TI registra el método de disposición → Log de auditoría registra todo el proceso.

### CU-04: Consultar historial completo de un activo
- **Actor:** Administrador TI
- **Flujo:** Administrador TI busca activo por código interno, número de serie, nombre o marca → Sistema muestra la ficha completa con pestañas: datos maestros, historial de estados con línea de tiempo, historial de asignaciones (todos los empleados que lo han tenido), historial de mantenimientos e incidencias, documentos adjuntos.

### CU-05: Reportar una incidencia (Usuario Final)
- **Actor:** Usuario Final
- **Precondición:** Usuario autenticado con rol Usuario Final. El activo debe estar asignado a ese usuario en ese momento.
- **Flujo:** Usuario Final accede a "Mis equipos" → Selecciona el equipo con falla → Hace clic en "Reportar incidencia" → Ingresa descripción del problema (campo de texto obligatorio) → Opcionalmente adjunta una foto → Sistema crea la incidencia y notifica al Administrador TI → Sistema muestra al Usuario Final el estado de su incidencia. El Usuario Final no puede crear incidencias sobre equipos que no estén asignados a él.

### CU-06: Firmar digitalmente el acta de resguardo
- **Actor:** Usuario Final
- **Precondición:** Existe un acta de asignación pendiente de firma para ese usuario.
- **Flujo:** Sistema notifica al Usuario Final que tiene un acta pendiente → Usuario Final accede al sistema → Visualiza el PDF del acta con los datos del equipo asignado → Firma digitalmente el acta (mecanismo: casilla de aceptación con registro de IP, timestamp y datos de sesión) → Sistema registra la firma → Acta queda disponible para descarga por ambas partes → Activo queda oficialmente asignado.
