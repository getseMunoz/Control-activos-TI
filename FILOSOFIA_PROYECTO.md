# FILOSOFÍA DEL PROYECTO
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 1.0
**Fecha:** 2026-06-26

Este documento establece los principios que guían todas las decisiones de diseño, arquitectura y desarrollo del sistema. Debe leerse antes de escribir la primera línea de código y consultarse siempre que surja una duda sobre cómo resolver algo.

---

## 1. EL CONTEXTO

CIPRIJAL es una empresa mediana mexicana dedicada a la exportación de limón persa y aguacate Hass. Su área de TI es pequeña. El sistema que construimos debe poder ser operado, mantenido y extendido por un equipo técnico reducido, sin consultores externos permanentes, sin infraestructura costosa y sin conocimiento especializado en arquitecturas complejas.

Este no es un sistema bancario. No maneja millones de transacciones por segundo. No requiere alta disponibilidad de cinco nueves. Es un sistema de gestión interno para un número acotado de usuarios. Las decisiones técnicas deben partir de esta realidad.

---

## 2. PRINCIPIOS FUNDAMENTALES

### 2.1 La simplicidad es una virtud, no una limitación

Si una solución simple resuelve el problema, se elige sobre la solución compleja. Siempre.

Un sistema simple es más fácil de entender, de depurar, de mantener y de extender. La complejidad tiene un costo real: más tiempo de desarrollo, más puntos de falla, más curva de aprendizaje para el siguiente desarrollador.

> "Make it work, make it right, make it fast — in that order." — Kent Beck

Regla práctica: antes de añadir una capa de abstracción, una dependencia o un patrón de diseño, preguntarse: ¿resuelve un problema real que ya existe hoy, o uno hipotético que quizás exista en el futuro?

### 2.2 El código se escribe para personas, no para máquinas

El código se escribe una vez y se lee cientos de veces. La legibilidad es una característica funcional. Un nombre de variable claro vale más que un comentario explicando qué hace una variable confusa.

- Nombres de variables, funciones y archivos que describan su intención sin ambigüedad.
- Funciones cortas con una sola responsabilidad.
- Sin abreviaciones crípticas.
- Sin comentarios que expliquen el *qué* — el código ya lo hace. Solo comentarios que expliquen el *por qué* cuando no sea obvio.

### 2.3 Mantenibilidad sobre ingenio

El código "inteligente" que impresiona en una revisión pero nadie entiende seis meses después es deuda técnica. El código "aburrido" que cualquier desarrollador Junior puede leer y modificar con confianza es una activo.

Se prohíbe explícitamente:
- Over-engineering preventivo ("lo hago genérico por si en el futuro necesitamos...").
- Abstracciones sin uso concreto inmediato.
- Patrones de diseño aplicados por moda, no por necesidad.
- Optimizaciones prematuras sin evidencia de que existe un problema de rendimiento.

### 2.4 Cada decisión técnica debe justificarse

Toda librería que se añade, toda herramienta que se elige, todo patrón que se adopta debe documentarse con una justificación concreta. No "usamos X porque es popular" sino "usamos X porque resuelve el problema Y de una manera que Z no puede, y el costo de añadirla es bajo".

Las decisiones están en ARQUITECTURA.md (ADRs). Si cambia una decisión, se actualiza el ADR. No se toman decisiones de arquitectura en silencio.

### 2.5 El sistema debe ser fácil de desplegar

Un desarrollador nuevo debe poder tener el sistema corriendo localmente en menos de 15 minutos con pasos documentados. El despliegue a producción debe ser un `git push`. No se tolera infraestructura que requiera conocimiento especializado para operar.

Por eso: Railway sobre VPS manual con Nginx y Docker Compose. PostgreSQL administrado sobre instancia autoinstalada. NextAuth sobre implementación propia de JWT + Redis.

---

## 3. RESTRICCIONES TÉCNICAS (NO NEGOCIABLES)

Estas restricciones existen para mantener el sistema simple, barato de operar y fácil de mantener. No son limitaciones temporales — son decisiones de diseño permanentes para v1.0.

| Restricción | Razón |
|---|---|
| Sin microservicios | El equipo es pequeño. Los microservicios añaden complejidad operacional sin beneficios a esta escala. |
| Sin Kubernetes | Orquestación innecesaria para un monolito en Railway. |
| Sin Docker como requisito de desarrollo | `npm run dev` debe ser suficiente con PostgreSQL local. |
| Sin Redis en v1.0 | NextAuth no lo necesita. El volumen de CIPRIJAL no justifica caché en memoria. |
| Sin RabbitMQ | Las colas de trabajo no son necesarias a esta escala. |
| Sin Elasticsearch | PostgreSQL con índices adecuados es suficiente para búsqueda de texto en este volumen. |
| Sin servicios de pago durante desarrollo | Usar las capas gratuitas de Railway. PostgreSQL local en desarrollo. |
| Preferir herramientas gratuitas y open source | Reducir costos operativos y dependencia de proveedores. |
| Sin BullMQ en v1.0 | Los emails se envían de forma síncrona. El volumen no lo justifica. |

---

## 4. ESTÁNDAR DE CALIDAD

### Lo que sí hacemos

- Tests unitarios para lógica de negocio crítica (reglas de asignación, validaciones de baja, verificación de ownership).
- Tests de integración para los flujos principales (registro de activo, asignación con firma, reporte de incidencia).
- TypeScript estricto (`strict: true`). Sin `any` implícitos.
- Validación con Zod en todos los Server Actions y Route Handlers.
- ESLint + Prettier en modo obligatorio (el CI falla si hay errores).
- Conventional Commits en todos los mensajes de commit.
- Code review antes de mergear a `develop`.

### Lo que no hacemos

- Cobertura del 100%. El objetivo es 70% en servicios críticos, no perfección estadística.
- Tests para código trivial (getters, constantes, tipos).
- Documentación automática de API al estilo Swagger — los Route Handlers de Next.js se documentan en los archivos de casos de uso y en comentarios inline cuando el contrato no es obvio.

---

## 5. FILOSOFÍA DE DEPENDENCIAS

Antes de añadir una librería npm, responder estas preguntas:

1. ¿Resuelve un problema real que no puedo resolver con código propio en menos de 50 líneas?
2. ¿Está activamente mantenida? (commits en los últimos 6 meses, sin issues críticos abiertos sin respuesta)
3. ¿Qué pasa si deja de mantenerse? ¿Podría reemplazarla?
4. ¿El tamaño del bundle es proporcional al beneficio?
5. ¿Tiene licencia compatible (MIT, Apache 2.0, BSD)?

Si la respuesta a cualquiera de estas preguntas genera duda, la dependencia no se añade.

---

## 6. FILOSOFÍA DE BASE DE DATOS

- El schema de Prisma es la fuente de verdad. Nunca se modifica la base de datos directamente en producción.
- Toda migración pasa por `prisma migrate`. Las migraciones se commitean al repositorio.
- Las migraciones son aditivas: primero columnas `nullable`, luego se populan datos, luego se hacen `NOT NULL` si aplica.
- Ningún registro se elimina físicamente. Soft delete universal.
- Los IDs son siempre UUID. Nunca integers autoincrement.

---

## 7. FILOSOFÍA DE SEGURIDAD

La seguridad no es un módulo — está integrada en cada capa:

- El middleware de Next.js es la primera línea de defensa (antes de que cualquier código de negocio se ejecute).
- Los Server Actions y Route Handlers son la segunda línea (verifican sesión, rol y ownership).
- La base de datos es la última línea (constraints, índices únicos, FKs).

Si la seguridad de un endpoint depende únicamente de que el botón no sea visible en el frontend, el diseño está mal. El backend siempre valida, independientemente de la UI.

---

## 8. CUÁNDO VIOLAR ESTAS REGLAS

Nunca sin documentar por qué. Si una situación real justifica una excepción (por ejemplo, si el volumen de emails llega a un punto donde el envío síncrono causa timeouts visibles), la excepción se documenta en el ADR correspondiente con la evidencia que la justifica (métricas, logs, número de usuarios) y se implementa la solución mínima necesaria, no la más sofisticada disponible.
