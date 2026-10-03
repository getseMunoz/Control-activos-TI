# EVOLUCIÓN DEL PROYECTO
## Sistema de Gestión de Activos TI — CIPRIJAL

---

## 1. PROPÓSITO DEL DOCUMENTO

Este documento resume la evolución del sistema desarrollado durante la residencia profesional y diferencia claramente el alcance concluido de posibles ampliaciones posteriores.

El alcance de la residencia comprendió el análisis, diseño, desarrollo, validación y documentación de una versión funcional del Sistema de Gestión de Activos TI. La publicación en infraestructura productiva, la contratación de servicios de nube, dominio, HTTPS, respaldos automáticos y monitoreo de producción no formaron parte de las responsabilidades de la residente.

---

## 2. ALCANCE CONCLUIDO DURANTE LA RESIDENCIA

La versión desarrollada incluye las siguientes capacidades:

- Autenticación por credenciales.
- Control de acceso con roles Administrador TI y Usuario Final.
- Gestión de usuarios.
- Catálogos de ubicaciones y tipos de activo.
- Registro, consulta, edición y baja lógica de activos.
- Asignación de equipos a usuarios.
- Firma digital de entrega.
- Responsiva imprimible de entrega.
- Registro de devoluciones.
- Firma digital de devolución.
- Responsiva imprimible de devolución.
- Historial completo por activo.
- Registro y seguimiento de incidencias.
- Órdenes de mantenimiento preventivo y correctivo.
- Registro de gastos asociados a activos.
- Dashboard con indicadores y alertas operativas.
- Reportes administrativos.
- Exportaciones CSV de activos y asignaciones.
- Portal de Usuario Final.
- Consulta por ubicación.
- Registro de información técnica por activo.
- Gestión de credenciales técnicas restringidas al Administrador TI.
- Guía rápida interna y manual de usuario.
- Validaciones técnicas con Prisma, TypeScript, ESLint y compilación del proyecto.

---

## 3. EVOLUCIÓN DEL DESARROLLO

El proyecto se organizó mediante Scrum adaptado a una residencia desarrollada principalmente por una residente. El trabajo se dividió en incrementos funcionales:

| Sprint | Enfoque | Resultado principal |
|---|---|---|
| 1 | Requerimientos y estructura inicial | Definición de necesidades, roles, entidades, relaciones y reglas del sistema |
| 2 | Base del sistema y acceso | Autenticación, sesiones, usuarios, catálogos y separación de permisos |
| 3 | Inventario de activos | Registro, edición, filtros, estados y baja lógica |
| 4 | Asignaciones y entrega | Asignación de activos, firma de recepción y responsiva |
| 5 | Devoluciones e historial | Devolución con firma, responsiva e historial del activo |
| 6 | Seguimiento operativo | Incidencias, mantenimiento y gastos vinculados al activo |
| 7 | Consultas y ampliaciones | Reportes, portal de usuario final, ubicación, información técnica y credenciales |
| 8 | Pruebas y documentación | Validaciones técnicas, pruebas manuales y documentación de entrega |

---

## 4. ESTADO DEL PROYECTO

| Aspecto | Estado |
|---|---|
| Desarrollo funcional de la residencia | Concluido |
| Pruebas funcionales y validaciones técnicas | Concluidas |
| Documentación técnica | Concluida |
| Manual de usuario | Concluido |
| Código fuente | Entregado en el repositorio |
| Despliegue en infraestructura productiva | Fuera del alcance de la residencia |
| Dominio y HTTPS propios | Fuera del alcance de la residencia |
| Base de datos administrada en la nube | Fuera del alcance de la residencia |
| Respaldo automático y monitoreo productivo | Fuera del alcance de la residencia |

---

## 5. POSIBLES AMPLIACIONES POSTERIORES

Las siguientes ideas no representan trabajo pendiente de la residencia. Son únicamente posibilidades que CIPRIJAL podría evaluar si decide continuar la evolución del sistema:

- Integración con directorio corporativo o servicios de identidad.
- Automatización adicional de notificaciones.
- Inventario físico asistido mediante QR.
- Integraciones con otros sistemas de la empresa.
- Analítica avanzada.
- Automatización adicional de pruebas.
- Aplicación móvil.
- Funciones adicionales de respaldo, monitoreo y operación productiva.

La priorización, presupuesto, infraestructura y ejecución de cualquiera de estas ampliaciones corresponderían a decisiones posteriores de CIPRIJAL.

---

## 6. CIERRE DEL ALCANCE DE RESIDENCIA

El producto entregado corresponde a una versión funcional y documentada del sistema, validada en ambiente de desarrollo. Cualquier decisión posterior sobre adopción operativa, publicación, infraestructura productiva o ampliación funcional corresponde a CIPRIJAL y no representa una actividad pendiente de la residencia profesional.
