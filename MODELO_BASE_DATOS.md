# MODELO DE BASE DE DATOS
## Sistema de Gestión de Activos TI — CIPRIJAL

**Fuente de verdad:** `prisma/schema.prisma`. Este documento describe el schema real tal como existe hoy en el código — no un diseño propuesto ni una versión anterior. Si algo aquí no coincide con `prisma/schema.prisma`, el schema tiene razón y este documento está desactualizado.

**Motor:** PostgreSQL 15+. **ORM:** Prisma (`@prisma/client` ^6.3.1).

---

## 1. PRINCIPIOS DEL MODELO

- **UUID v4 como PK:** todos los modelos usan `id String @id @default(uuid())`. Nunca autoincrement — evita la enumeración de recursos en la API.
- **Fechas en UTC:** todo campo `DateTime` de Prisma se almacena en PostgreSQL como `TIMESTAMPTZ` (con zona horaria, en UTC). La conversión a hora local, si se necesita, ocurre en la aplicación.
- **snake_case en BD, camelCase en Prisma:** los campos y tablas se mapean con `@map()` / `@@map()`. El cliente de Prisma expone siempre camelCase.
- **Soft delete selectivo, no universal:** cada modelo usa el mecanismo que corresponde a su naturaleza — ver sección 3.
- **`audit_logs` es de solo inserción:** el modelo existe para ese propósito, independientemente de si algo escribe en él hoy (ver sección 6).
- **JSONB para datos variables:** `Asset.specs` (especificaciones técnicas) y `AssetAssignment.accessories` (lista de accesorios) son `Json?`.

---

## 2. MODELOS

### 2.1 `Location` — Localidades operativas

Catálogo plano de sedes (ej. "Yucatán", "Tabasco"). Sin jerarquía.

| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK, UUID |
| name | String | |
| description | String? | |
| isActive | Boolean | `@default(true)` |
| deletedAt | DateTime? | Soft delete |

**Soft delete:** sí, solo `deletedAt` (sin `deletedBy`). **Relaciones:** `users`, `assets`, `assignmentDeliveries` (ubicación de entrega de una `AssetAssignment`).

---

### 2.2 `AssetType` — Catálogo de tipos de activo

**No es un enum.** Es una tabla administrable: el Administrador TI crea, edita y desactiva tipos desde la interfaz sin requerir código ni migración.

| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK, UUID |
| name | String | `@unique` |
| description | String? | |
| isActive | Boolean | `@default(true)` — un tipo desactivado deja de ofrecerse en formularios nuevos, pero los activos históricos que lo usan no se ven afectados |

**Soft delete:** no tiene `deletedAt` — se desactiva con `isActive`. **Relaciones:** `assets`.

---

### 2.3 `User` — Usuarios del sistema

Tabla unificada: credenciales + datos del colaborador. No existe tabla separada de "empleados".

| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK, UUID |
| firstName / lastName | String | Separados (no un solo campo `name`) |
| email | String | `@unique` |
| passwordHash | String | bcrypt |
| role | `Role` | `admin_ti` \| `usuario_final` |
| position | String? | Puesto |
| phone | String? | |
| modality | `Modality?` | `presencial` \| `remoto` \| `hibrido` |
| locationId | String? | FK → Location |
| isActive | Boolean | `@default(true)` |
| mustChangePassword | Boolean | `@default(false)` — se activa al crear el usuario, pero actualmente ningún flujo del sistema lo verifica ni fuerza el cambio |
| lastLoginAt | DateTime? | |
| failedLoginAttempts | Int | `@default(0)` |
| lockedUntil | DateTime? | Bloqueo temporal |
| deletedAt | DateTime? | Soft delete |

**Soft delete:** sí, solo `deletedAt`. **Relaciones:** asignaciones (como receptor/asignador/receptor de devolución), incidencias (reportadas/resueltas), activos (creados/editados/eliminados), gastos creados, mantenimientos (creados/asignados), programaciones (creadas/asignadas), documentos subidos, credenciales (creadas/editadas/eliminadas), ficha técnica (creada/editada).

---

### 2.4 `Asset` — Activos de hardware *(tabla central)*

| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK, UUID |
| internalCode | String | `@unique` — formato `HW-AAAA-NNNN`, generado automáticamente, secuencial por año |
| name | String | |
| assetTypeId | String | FK → `AssetType` |
| serialNumber | String | `@unique`, **obligatorio** (no-nulable) |
| brand / model / partNumber | String? | |
| status | `AssetStatus` | `@default(in_storage)` — ver sección 4 |
| purchaseDate / purchasePrice | DateTime? / Decimal? | Un solo campo de precio, en MXN — no hay campo separado en USD |
| supplierName / invoiceNumber | String? | Texto libre |
| warrantyExpiryDate | DateTime? | |
| usefulLifeYears | Int? | |
| biosPassword / devicePassword | String? | Ver nota de seguridad abajo |
| companyAssetNumber / companyModel / inventoryTag | String? | Identificadores adicionales de inventario |
| locationId | String? | FK → Location |
| notes | String? | |
| specs | Json? | Especificaciones técnicas variables por tipo |
| qrCode | String? | `@unique` — el campo existe pero **no se asigna en ningún flujo actual**; no hay generación de QR implementada |
| imagePath | String? | |
| createdBy / updatedBy / deletedBy | String / String? / String? | FK → User |
| deletedAt | DateTime? | Soft delete |

**Soft delete:** sí, `deletedAt` + `deletedBy` (uno de los dos únicos modelos con ambos campos, junto con `AssetCredential`).

**Nota de seguridad sobre `biosPassword`/`devicePassword`:** el comentario en el schema indica que estos campos deben cifrarse con AES-256-GCM antes de persistir, que el acceso es exclusivo de `admin_ti`, y que nunca deben enviarse al frontend de `usuario_final`. **En el código actual, ninguno de estos campos se lee ni se escribe en ninguna Server Action ni query** (`grep` sin resultados en `src/server/`). No hay cifrado implementado porque no hay ninguna funcionalidad que los use todavía — es un campo del schema a la espera de un flujo real.

**Relaciones:** `assetType`, `location`, `assignments`, `expenses`, `incidents`, `maintenanceOrders`, `maintenanceSchedules`, `credentials`, `technicalInfo` (1-a-1).

---

### 2.5 `AssetAssignment` — Asignaciones (entregas y devoluciones)

Historial de asignaciones. Cada fila es un ciclo entrega → devolución. `returnedAt IS NULL` = asignación activa.

| Campo | Tipo | Notas |
|---|---|---|
| id | String | PK, UUID |
| assetId / userId | String | FK → Asset / User (receptor) |
| assignedAt / assignedBy | DateTime / String | Fecha de entrega y FK → User (admin que asignó) |
| returnedAt / returnedBy | DateTime? / String? | `NULL` = activa. `returnedBy` → FK User (admin que recibió la devolución) |
| deliveryLocationId | String? | FK → Location (dónde ocurrió la entrega) |
| accessories | Json? | |
| notes | String? | |
| **deliverySignatureData** | String? `@db.Text` | Firma de **recepción**, imagen PNG como Data URL / Base64 inline |
| **deliverySignedAt** | DateTime? | `NULL` = pendiente de firma |
| **deliverySignedByName** | String? | Nombre del firmante, resuelto en servidor desde la BD del usuario autenticado — nunca desde un valor del cliente |
| **returnSignatureData** | String? `@db.Text` | Firma de **devolución**, mismo formato (PNG Base64 inline) |
| **returnSignedAt** | DateTime? | |
| **returnSignedByName** | String? | Nombre del Administrador TI que recibió el equipo, resuelto desde su propia sesión — nunca desde el nombre del usuario al que estaba asignado el activo |
| signedAt, signaturePath, signatureIp | DateTime? / String? / String? | **Campos heredados sin uso actual.** Existen en el schema pero ninguna Server Action los lee ni escribe; el mecanismo de firma real son los seis campos `delivery*`/`return*` de arriba |
| deliveryDocumentId / returnDocumentId | String? | FK conceptual → `Document` (gestionada por la aplicación, sin relación Prisma); el módulo `Document` no tiene implementación — ver sección 6 |
| createdAt | DateTime | |

**Soft delete:** no tiene — es un registro histórico inmutable. Una asignación nunca se borra, solo se "cierra" con `returnedAt`.

**Índices:** `assetId`, `userId`, `returnedAt`. Además, un **índice único parcial** que Prisma no puede declarar directamente, documentado como nota en el propio schema y que debe añadirse como SQL raw en la migración:

```sql
CREATE UNIQUE INDEX idx_one_active_assignment
ON asset_assignments(asset_id)
WHERE returned_at IS NULL;
```

Esto evita que un activo tenga dos asignaciones activas simultáneas.

**Flujo real `Asset` ↔ `AssetAssignment`:**
1. El Administrador TI crea la asignación **sin firma** (`deliverySignatureData`/`deliverySignedAt`/`deliverySignedByName` quedan en `null`). El activo pasa de `in_storage` a `assigned`.
2. El Usuario Final, desde `/my-assets/assignments/[assignmentId]/sign`, firma su propia recepción dibujando en un canvas. La imagen se guarda como PNG en Base64 en `deliverySignatureData`, con `deliverySignedAt = now()` y `deliverySignedByName` tomado de su propio registro en `User`.
3. Al devolver el equipo, el Administrador TI que lo recibe físicamente firma la devolución (mismo mecanismo, campos `return*`). El activo regresa a `in_storage`.

---

### 2.6 `AssetExpense` — Gastos adicionales por activo

| Campo | Tipo | Notas |
|---|---|---|
| id, assetId, name, cost, purchaseDate, invoiceNumber, supplierName, notes, createdBy, createdAt | — | Registro financiero simple, sin `updatedAt` |

**Soft delete:** no tiene — registro histórico inmutable; un gasto erróneo se documenta en `notes`, no se borra. **Índices:** `assetId`, `purchaseDate`.

---

### 2.7 `Incident` — Incidencias

| Campo | Tipo | Notas |
|---|---|---|
| id, incidentNumber (`@unique`, formato `INC-AAAA-NNNN`), assetId, reportedBy, title, description, status, priority, maintenanceOrderId, resolution, resolvedAt, resolvedBy, createdAt, updatedAt | — | `status` default `open`, `priority` default `medium` |

**Soft delete:** no tiene — histórico inmutable. **Índices:** `assetId`, `reportedBy`, `status`, `createdAt`. **Implementado:** sí, por el Usuario Final (sobre equipos propios asignados) o directamente por el Administrador TI.

---

### 2.8 `MaintenanceOrder` — Órdenes de trabajo

| Campo | Tipo | Notas |
|---|---|---|
| id, orderNumber (`@unique`, formato `OT-AAAA-NNNN`), assetId, type, status, priority, title, description, incidentId, supplierName, supplierTicket, scheduledDate, startedAt, completedAt, resolution, result, cost, isUnderWarranty, assignedTo, createdBy, createdAt, updatedAt | — | `status` default `pending` |

**Soft delete:** no tiene. **Implementado:** sí (crear, cerrar). **Importante:** no existe ningún automatismo que cambie el estado del `Asset` al crear o cerrar una OT — ese cambio, si se requiere, lo hace manualmente el Administrador TI desde la edición del activo.

---

### 2.9 `MaintenanceSchedule` — Programación de mantenimiento preventivo

| Campo | Tipo | Notas |
|---|---|---|
| id, assetId, frequencyType, description, assignedTo, lastExecutedAt, nextDueDate, isActive, createdBy, createdAt, updatedAt | — | `frequencyType`: `monthly`\|`quarterly`\|`biannual`\|`annual` |

**Existe en BD, sin funcionalidad implementada.** No hay ninguna Server Action, query ni página que use este modelo — `grep -rln "MaintenanceSchedule" src/` no devuelve resultados fuera del propio schema. No es posible programar un mantenimiento preventivo en el sistema actual.

---

### 2.10 `AssetCredential` — Credenciales de acceso por activo

| Campo | Tipo | Notas |
|---|---|---|
| id, assetId, label, username, password, accessUrl, notes, createdBy, updatedBy, deletedBy, createdAt, updatedAt, deletedAt | — | Acceso exclusivo `admin_ti` |

**Soft delete:** sí, `deletedAt` + `deletedBy` (igual que `Asset`). **Implementado:** sí — CRUD completo. **Nota:** el comentario del schema recomienda cifrado en reposo de `username`/`password` para producción; no está implementado (se guardan en texto plano actualmente).

---

### 2.11 `AssetTechnicalInfo` — Ficha técnica por activo

Relación 1-a-1 con `Asset` (`assetId @unique`).

| Campo | Tipo | Notas |
|---|---|---|
| id, assetId, hostname, macAddressEth0, macAddressWifi, ipAddress, publicIpAddress, operatingSystem, officeVersion, firmwareVersion, modelNumber, byod, requestable, orderNumber, additionalNotes, createdBy, updatedBy, createdAt, updatedAt | — | `byod`/`requestable` son `Boolean @default(false)` |

**Soft delete:** no tiene — se sobrescribe directamente. **Implementado:** sí.

---

### 2.12 `Document` — Archivos adjuntos

| Campo | Tipo | Notas |
|---|---|---|
| id, type, name, filePath, fileName, fileSize, mimeType, entityType, entityId, description, documentDate, uploadedBy, isActive, createdAt | — | Patrón polimórfico: `entityType` + `entityId` apuntan a cualquier entidad |

**Existe en BD, sin funcionalidad implementada.** `grep -rln "prisma.document" src/` no devuelve resultados. No hay forma de subir, ver o eliminar un documento en el sistema actual — ni para activos, ni para las responsivas (que son páginas HTML, no archivos `Document`).

---

### 2.13 `AuditLog` — Log de auditoría

| Campo | Tipo | Notas |
|---|---|---|
| id, entity, entityId, action, oldValues (Json?), newValues (Json?), userId, userEmail, userRole, ipAddress, userAgent, createdAt | — | Sin relaciones `@relation` — datos de usuario desnormalizados intencionalmente, para que el registro sobreviva aunque el usuario se elimine |

**Soft delete:** no aplica — tabla de solo inserción (`BR-AUD-01`). **Existe en BD, sin escritura activa.** Ninguna Server Action inserta en este modelo hoy — `grep -rln "auditLog\|AuditLog" src/server/` no devuelve resultados. El modelo está listo para usarse, pero no se usa.

---

## 3. RESUMEN — SOFT DELETE POR MODELO

| Mecanismo | Modelos |
|---|---|
| `deletedAt` + `deletedBy` | `Asset`, `AssetCredential` |
| Solo `deletedAt` | `User`, `Location` |
| `isActive` (sin `deletedAt`) | `AssetType` |
| Ninguno — inmutable | `AssetAssignment`, `AssetExpense`, `Incident`, `MaintenanceOrder`, `MaintenanceSchedule`, `AuditLog`, `AssetTechnicalInfo`, `Document` |

No existe un helper compartido (`withSoftDelete()` o similar) — cada query que necesita excluir registros borrados incluye `where: { deletedAt: null }` explícitamente.

---

## 4. ENUMS

```prisma
enum Role              { admin_ti  usuario_final }
enum Modality           { presencial  remoto  hibrido }
enum AssetStatus        { in_storage  assigned  in_maintenance  decommissioned  stolen  lost }
enum IncidentStatus     { open  in_review  in_progress  resolved  closed }
enum Priority           { low  medium  high  critical }
enum MaintenanceType    { preventive  corrective  warranty_repair }
enum MaintenanceStatus  { pending  in_progress  waiting_parts  waiting_supplier  completed  cancelled }
enum MaintenanceResult  { resolved  warranty_sent  unrepairable  cancelled }
enum FrequencyType      { monthly  quarterly  biannual  annual }
enum DocumentType       { invoice  warranty  manual  delivery_act  return_act  maintenance_report
                           secure_erase_certificate  certificate  other }
enum AuditAction        { CREATE  UPDATE  DELETE  LOGIN  LOGOUT  EXPORT  SIGN }
```

No existe el estado `registered` en `AssetStatus` — el estado inicial de un activo nuevo es `in_storage` directamente. No existe ningún campo `condition`/`AssetCondition` en el schema — fue evaluado y descartado (ver sección 5).

---

## 5. DECISIONES Y COMPORTAMIENTO VERIFICADO (antes documentadas como preguntas abiertas)

Estas dos preguntas aparecían como pendientes en un documento de diseño anterior a la implementación. Se verificaron contra el código actual y tienen una respuesta de facto:

- **¿Un activo `stolen` o `lost` puede reactivarse sin crear un nuevo registro?** Sí — `updateAssetAction` permite cambiar `status` libremente entre cualquiera de los seis valores del enum (solo `assigned` y `decommissioned` tienen una validación específica, ligada a si hay o no una asignación activa). No existe ninguna salvaguarda adicional: no se exige confirmación explícita, no se exige motivo, y no queda ningún registro en `AuditLog` (porque no se escribe). Es, en la práctica, la opción más simple de las que se evaluaban en el diseño original — sin las salvaguardas que ese diseño proponía.
- **¿Quién puede ver `biosPassword`/`devicePassword` descifrados?** La pregunta no aplica todavía: no hay ninguna funcionalidad en el código que lea, escriba o muestre estos campos. No hay cifrado implementado ni interfaz de consulta.

**`AssetType` como tabla administrable (no enum):** esta fue una decisión explícita tomada antes de la primera migración, precisamente para que el Administrador TI pueda agregar tipos de activo (ej. drones, cámaras) sin depender del equipo de desarrollo. El campo `AssetCondition` que se consideró en esa misma etapa se descartó por completo — la condición física de un equipo, si se necesita registrar, se documenta mediante notas libres, no mediante una clasificación cerrada.

---

## 6. MÓDULOS CON MODELO EN BD PERO SIN IMPLEMENTACIÓN REAL

| Modelo | ¿Existe en BD? | ¿Tiene Server Actions/queries? | ¿Tiene interfaz? |
|---|:---:|:---:|:---:|
| `MaintenanceSchedule` | Sí | No | No |
| `Document` | Sí | No | No |
| `AuditLog` | Sí | No (nunca se escribe) | No |

Estos tres modelos son el ejemplo más claro de la distinción entre "existe en la base de datos" y "está implementado": el schema los define con todos sus campos, pero ningún flujo del sistema los usa hoy.

---

## 7. COMANDOS DE PRISMA

```bash
# Generar cliente TypeScript tras cambios en el schema
npm run db:generate

# Crear y aplicar migración en desarrollo
npm run db:migrate

# Aplicar migraciones pendientes en producción (sin crear nuevas)
npm run db:migrate:deploy

# UI visual de la base de datos
npm run db:studio

# Sincronizar schema sin migración (solo prototipado)
npm run db:push

# Respaldo manual (los backups automáticos de producción dependen del
# proveedor de hospedaje finalmente elegido — ver ARQUITECTURA.md §8.2)
pg_dump -Fc "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).dump
pg_restore -d "$DATABASE_URL" backup_YYYYMMDD_HHMMSS.dump
```
