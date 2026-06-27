# ROADMAP DEL PRODUCTO
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.1  
**Fecha:** 2026-06-25

---

## 1. VISIÓN DEL PRODUCTO

Proveer a CIPRIJAL un sistema confiable y de operación diaria para el control completo de su hardware tecnológico: quién lo tiene, en qué estado está, cuándo fue mantenido y qué incidencias ha presentado — con trazabilidad total y firma digital de responsabilidades.

---

## 2. CRONOGRAMA OFICIAL — v1.0

La única versión con fechas comprometidas es la **v1.0**. El desarrollo, pruebas y despliegue abarcan de julio a noviembre de 2026.

```
JULIO 2026
├── Semana 1-2   ── FASE 0: Fundamentos
│                   Infraestructura, Docker, autenticación, roles, layout base.
│                   [ Hito: Sistema con login funcional — 14 julio ]
│
├── Semana 3-4   ── FASE 1 / Sprint 1: Inventario de Hardware
│                   Registro de equipos (6 tipos), número de serie obligatorio,
│                   validaciones de Administrador TI, auditoría.
│
AGOSTO 2026
├── Semana 5-6   ── FASE 1 / Sprint 2: Ciclo de Vida y Usuarios
│                   Estados de activos, historial, gestión de usuarios del sistema.
│                   [ Hito: Inventario operativo — 11 agosto ]
│
├── Semana 7-8   ── FASE 2 / Sprint 3: Asignaciones con Firma Digital
│                   Asignación a empleados, acta PDF, firma digital del Usuario Final.
│
SEPTIEMBRE 2026
├── Semana 9-10  ── FASE 2 / Sprint 4: Incidencias y Mantenimiento
│                   Reporte de incidencias por Usuario Final, órdenes de trabajo,
│                   mantenimiento preventivo y correctivo.
│                   [ Hito: Asignaciones e incidencias completas — 8 septiembre ]
│
├── Semana 11-12 ── FASE 3 / Sprint 5: Sistema de Alertas
│                   Alertas de garantía, mantenimiento, incidencias. Email automático.
│
OCTUBRE 2026
├── Semana 13-14 ── FASE 3 / Sprint 6: Reportes, Dashboard y QR
│                   Reportes exportables, dashboard ejecutivo, códigos QR.
│                   [ Hito: Sistema completo listo para pruebas — 6 octubre ]
│
├── Semana 15-16 ── FASE 4 / Sprint 7: Pruebas y Hardening
│                   UAT, pruebas de carga, seguridad, correcciones.
│
NOVIEMBRE 2026
├── Semana 17-18 ── FASE 4 / Sprint 8: Correcciones Post-UAT y Documentación
│                   Ajustes finales, manuales de usuario, runbook operativo.
│
├── Semana 19-20 ── FASE 4 / Sprint 9: Despliegue y Migración de Datos
│                   Servidor de producción, importación de inventario existente,
│                   entrenamiento al equipo de CIPRIJAL.
│
└── Semana 21-22 ── FASE 4 / Sprint 10: Go-Live y Estabilización
                    [ HITO FINAL: Go-Live oficial — 24 noviembre 2026 ]
                    Primera semana con soporte activo. Cierre del proyecto.
```

---

## 3. ALCANCE DE v1.0

### Módulos incluidos

| Módulo | Descripción |
|---|---|
| Autenticación y roles | Login seguro, JWT, dos roles (Administrador TI / Usuario Final) |
| Inventario de hardware | Registro de equipos con número de serie obligatorio, catálogo de 6 tipos |
| Ciclo de vida | Estados de activos con historial completo de transiciones |
| Asignaciones (Préstamos) | Asignación a empleados con acta de resguardo PDF + firma digital |
| Incidencias | Reporte por Usuario Final + gestión por Administrador TI |
| Mantenimiento | Órdenes de trabajo preventivas y correctivas + programación |
| Alertas y notificaciones | Alertas en sistema + email automático por eventos críticos |
| Reportes | 7 tipos de reportes exportables (PDF, Excel, CSV) |
| Dashboard operativo | KPIs en tiempo real con caché Redis |
| Código QR | Generación de etiqueta QR imprimible por activo |
| Auditoría | Log inmutable de todas las operaciones |
| Administración | Gestión de usuarios, ubicaciones, departamentos, configuración |

### Módulos NO incluidos en v1.0 (ver Sección 4)

- Gestión de proveedores y contratos
- Gestión de licencias de software
- Módulo financiero (depreciación, TCO, presupuesto)

---

## 4. MEJORAS FUTURAS (SIN FECHA)

Las siguientes funcionalidades están identificadas y documentadas, pero **no tienen fecha de implementación comprometida**. Se priorizarán según las necesidades reales de CIPRIJAL después de que el sistema v1.0 esté en operación.

### MF-01: Gestión de Proveedores y Contratos
Registro de proveedores tecnológicos con sus contratos de soporte, SLAs, contactos y alertas de vencimiento de contratos. Vinculación de activos al proveedor de compra.

**Por qué esperar:** Los beneficios son mayores una vez que el inventario está cargado y estabilizado. No bloquea ninguna funcionalidad de v1.0.

### MF-02: Gestión de Licencias de Software
Control de licencias de software (tipo, cantidad, vencimiento, cumplimiento). Vinculación de licencias a activos o empleados. Dashboard de compliance.

**Por qué esperar:** Requiere que el inventario de hardware esté consolidado y que CIPRIJAL tenga claridad sobre qué software gestionar. El alcance de licencias es independiente del hardware.

### MF-03: Módulo Financiero (Depreciación y TCO)
Cálculo automático de depreciación por método lineal. Costo Total de Propiedad por activo (compra + mantenimientos). Presupuesto de TI vs. gasto real. Reportes financieros en USD y moneda local.

**Por qué esperar:** Requiere al menos 6 meses de datos de mantenimiento para que el TCO sea significativo. Involucra al área contable de CIPRIJAL para validar el método de depreciación a usar.

### MF-04: Inventario Físico Asistido (Conciliación)
Proceso formal de toma de inventario periódico desde un teléfono: el Administrador TI escanea los QR de cada activo y el sistema genera un reporte de conciliación (encontrados, no encontrados, sin registrar).

### MF-05: Integración con Active Directory / LDAP
Autenticación corporativa con credenciales de dominio. Sincronización automática de empleados. Desactivación automática al salir de la empresa.

### MF-06: Gestión de Certificados SSL y Dominios
Registro de certificados digitales y dominios web con fechas de vencimiento y alertas automáticas. Activo digital crítico con alto impacto si vence sin notificación.

### MF-07: Reserva de Activos Compartidos
Calendario para reservar equipos de uso compartido (proyectores, tablets de sala). Los empleados hacen la reserva desde su perfil y el Administrador TI gestiona disponibilidad.

### MF-08: Módulo de Seguros
Registro de pólizas de seguro que cubren activos de TI: cobertura, prima, vigencia y activos asegurados. Útil para respaldo inmediato ante siniestros.

### MF-09: Descubrimiento Automático de Red
Integración con herramientas de network scanning para detectar dispositivos conectados a la red no registrados en el inventario. Sincronización de datos técnicos (IP, MAC, hostname).

### MF-10: Analítica Avanzada y Planificación
Tendencias históricas del inventario. Calculadora de renovación: activos que alcanzarán el fin de su vida útil en los próximos 12-24 meses. Exportación para Power BI / Tableau.

### MF-11: Aplicación Móvil Nativa
App nativa iOS/Android con escaneo de QR desde la cámara, modo offline, notificaciones push. Alternativa a la PWA si las necesidades de campo lo requieren.

### MF-12: Integración con Sistema ERP / Contabilidad
Exportación de datos de depreciación y gastos al sistema contable de CIPRIJAL. Sincronización de centros de costo y presupuestos.

---

## 5. POLÍTICA DE VERSIONES

| Tipo | Cuándo | Ejemplo | Requiere migración |
|---|---|---|---|
| Patch (x.y.Z) | Bugfixes y mejoras menores sin cambio de schema | v1.0.1 | No |
| Minor (x.Y.z) | Nuevas funcionalidades, schema aditivo | v1.1.0 | Sí (additive) |
| Major (X.y.z) | Cambios arquitectónicos o breaking changes | v2.0.0 | Sí (puede ser compleja) |

---

## 6. CRITERIOS DE PRIORIZACIÓN (MEJORAS FUTURAS)

Cuando se evalúe qué mejora implementar después de v1.0:

1. **Problema real identificado en operación:** ¿El equipo de TI de CIPRIJAL lo está pidiendo porque lo necesita hoy?
2. **Bloquea algún proceso crítico sin él:** ¿Hay un workaround aceptable o es un punto de dolor constante?
3. **Esfuerzo estimado vs. impacto:** ¿Cuánto tiempo toma y a cuántos usuarios beneficia?
4. **Dependencias técnicas:** ¿Requiere que otro módulo esté primero?

---

## 7. MÉTRICAS DE ÉXITO — v1.0

| Métrica | Objetivo |
|---|---|
| Equipos registrados en el sistema | 100% del inventario actual de CIPRIJAL |
| Activos con número de serie registrado | 100% (obligatorio por regla de negocio) |
| Activos asignados con acta firmada | 100% de los activos actualmente asignados |
| Incidencias gestionadas en el sistema (vs. por WhatsApp/verbal) | > 80% al mes 2 |
| Alertas de vencimiento de garantía detectadas proactivamente | 100% (0 vencimientos sin aviso) |
| Tiempo promedio para encontrar la información de un activo | < 30 segundos |
| Satisfacción del Administrador TI (encuesta post-Go-Live) | ≥ 8/10 |
| Días de operación sin intervención técnica | ≥ 30 días continuos |
