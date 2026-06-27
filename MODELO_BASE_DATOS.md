# MODELO DE BASE DE DATOS
## Sistema de Gestión de Activos TI — CIPRIJAL
**Versión:** 2.0
**Fecha:** 2026-06-25
**Estado:** Definitivo — stack aprobado
**ORM:** Prisma (`prisma/schema.prisma` es la fuente de verdad)
**Motor:** PostgreSQL 15+ (administrado por Railway en producción)

---

## 1. PRINCIPIOS DEL MODELO

- **ORM:** Prisma. El archivo `prisma/schema.prisma` define todos los modelos. Las migraciones se generan y aplican con `prisma migrate`. No se usa TypeORM.
- **UUID como PK:** Todos los IDs son UUID v4 (`@default(uuid())`). Nunca autoincrement.
- **Soft Delete universal:** Campo `deletedAt DateTime?` en todas las entidades principales. Un registro con `deletedAt != null` se considera eliminado lógicamente y nunca se borra físicamente.
- **Timestamps automáticos:** `createdAt` y `updatedAt` en todas las tablas. Prisma gestiona `updatedAt` con `@updatedAt`.
- **Auditoría separada:** Los cambios se registran en `AuditLog` (solo inserción). No hay campos de historial en las tablas principales.
- **JSONB para datos variables:** Las especificaciones técnicas de activos varían según el tipo (laptop, radio, impresora). Se almacenan en un campo `Json?` de Prisma, que mapea a `JSONB` en PostgreSQL.
- **Zona horaria:** Todas las fechas/horas en UTC. `DateTime` en Prisma se almacena como `TIMESTAMP WITH TIME ZONE`.
- **Nomenclatura:** Prisma usa camelCase para campos y PascalCase para modelos. Las columnas en BD se mapean a snake_case con `@map`. La tabla se mapea con `@@map`.
- **Sin particionamiento:** La tabla `audit_logs` es estándar en v1.0. Sin `PARTITION BY RANGE`.

---

## 2. DIAGRAMA DE ENTIDADES

```
Location ◄────── User ──────────────────────────────────────────────────┐
                  │                                                      │
                  │ asigna / reporta / crea                              │ crea / audita
                  ▼                                                      │
Location ◄──── Asset ────────────────────────────────────────────────────┘
                  │
          ┌───────┼──────────┬──────────────┐
          ▼       ▼          ▼              ▼
    Assignment  Incident  Maintenance    Document
       │           │       Order
       │           └──────► MaintenanceOrder
       │
    (userId → User)

AlertRule ──► AlertInstance

AuditLog  (tabla de solo inserción — no tiene relaciones con FK)
```

**Tablas en v1.0:** `users`, `locations`, `assets`, `asset_assignments`, `incidents`, `maintenance_orders`, `maintenance_schedules`, `documents`, `alert_rules`, `alert_instances`, `audit_logs`

**Tablas eliminadas respecto a versiones anteriores:** `employees`, `departments`, `asset_categories`, `refresh_tokens`, `system_settings`

---

## 3. DEFINICIÓN DE MODELOS

---

### 3.1 `User` — Usuarios del sistema

Tabla unificada. Contiene credenciales de acceso Y datos del colaborador (puesto, modalidad, teléfono, localidad). No existe tabla separada de empleados.

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| name | name | String | Nombre completo |
| email | email | String | `@unique` — Email corporativo |
| passwordHash | password_hash | String | Hash bcrypt |
| role | role | Role (enum) | `admin_ti` \| `usuario_final` |
| position | position | String? | Puesto o cargo |
| phone | phone | String? | Teléfono de contacto |
| modality | modality | Modality? (enum) | `presencial` \| `remoto` |
| locationId | location_id | String? | FK → Location |
| isActive | is_active | Boolean | `@default(true)` |
| mustChangePassword | must_change_password | Boolean | `@default(false)` |
| lastLoginAt | last_login_at | DateTime? | Último acceso registrado |
| failedLoginAttempts | failed_login_attempts | Int | `@default(0)` |
| lockedUntil | locked_until | DateTime? | Bloqueo temporal por intentos fallidos |
| createdAt | created_at | DateTime | `@default(now())` |
| updatedAt | updated_at | DateTime | `@updatedAt` |
| deletedAt | deleted_at | DateTime? | Soft delete |

```prisma
enum Role {
  admin_ti
  usuario_final
}

enum Modality {
  presencial
  remoto
}

model User {
  id                  String    @id @default(uuid())
  name                String
  email               String    @unique
  passwordHash        String    @map("password_hash")
  role                Role
  position            String?
  phone               String?
  modality            Modality?
  locationId          String?   @map("location_id")
  isActive            Boolean   @default(true) @map("is_active")
  mustChangePassword  Boolean   @default(false) @map("must_change_password")
  lastLoginAt         DateTime? @map("last_login_at")
  failedLoginAttempts Int       @default(0) @map("failed_login_attempts")
  lockedUntil         DateTime? @map("locked_until")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")

  location             Location?           @relation(fields: [locationId], references: [id])
  assignmentsReceived  AssetAssignment[]   @relation("AssignedToUser")
  assignmentsCreated   AssetAssignment[]   @relation("AssignedByUser")
  assignmentsReturned  AssetAssignment[]   @relation("ReturnedByUser")
  incidentsReported    Incident[]          @relation("ReportedBy")
  incidentsResolved    Incident[]          @relation("ResolvedBy")
  assetsCreated        Asset[]             @relation("AssetCreatedBy")
  maintenanceOrders    MaintenanceOrder[]  @relation("MaintenanceCreatedBy")
  maintenanceAssigned  MaintenanceOrder[]  @relation("MaintenanceAssignedTo")
  schedulesAssigned    MaintenanceSchedule[] @relation("ScheduleAssignedTo")
  schedulesCreated     MaintenanceSchedule[] @relation("ScheduleCreatedBy")
  documentsUploaded    Document[]
  alertsResolved       AlertInstance[]

  @@index([role])
  @@index([locationId])
  @@index([isActive])
  @@map("users")
}
```

---

### 3.2 `Location` — Localidades operativas

Catálogo plano. Ejemplos: "Yucatán", "Tabasco", "Guadalajara". Sin jerarquía, sin edificios, sin racks.

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| name | name | String | Nombre de la localidad |
| description | description | String? | Notas opcionales |
| isActive | is_active | Boolean | `@default(true)` |
| createdAt | created_at | DateTime | `@default(now())` |
| updatedAt | updated_at | DateTime | `@updatedAt` |
| deletedAt | deleted_at | DateTime? | Soft delete |

```prisma
model Location {
  id          String    @id @default(uuid())
  name        String
  description String?
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  users  User[]
  assets Asset[]

  @@index([isActive])
  @@map("locations")
}
```

---

### 3.3 `Asset` — Activos de hardware *(TABLA CENTRAL)*

El tipo de activo es un enum directo en esta tabla — no existe tabla `asset_categories`. El número de serie es `NOT NULL` por regla de negocio innegociable (BR-INV-02).

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| internalCode | internal_code | String | `@unique` — Código: HW-2026-0001 |
| name | name | String | Nombre descriptivo |
| assetType | asset_type | AssetType (enum) | Tipo de hardware |
| serialNumber | serial_number | String | `@unique` — **Obligatorio, NOT NULL** |
| brand | brand | String? | Marca / Fabricante |
| model | model | String? | Modelo |
| status | status | AssetStatus (enum) | Estado actual, `@default(registered)` |
| condition | condition | AssetCondition (enum) | Condición física |
| purchaseDate | purchase_date | DateTime? | Fecha de compra |
| purchasePriceLocal | purchase_price_local | Decimal? | Precio en moneda local |
| purchasePriceUsd | purchase_price_usd | Decimal? | Precio en USD |
| supplierName | supplier_name | String? | Proveedor (texto libre en v1.0) |
| invoiceNumber | invoice_number | String? | Número de factura |
| warrantyExpiryDate | warranty_expiry_date | DateTime? | Vencimiento de garantía |
| locationId | location_id | String? | FK → Location |
| notes | notes | String? | Observaciones |
| specs | specs | Json? | Especificaciones técnicas (JSONB) |
| qrCode | qr_code | String? | `@unique` — Código del QR imprimible |
| imagePath | image_path | String? | Ruta de imagen del activo |
| createdBy | created_by | String | FK → User (Admin TI que registró) |
| updatedBy | updated_by | String? | FK → User |
| deletedBy | deleted_by | String? | FK → User |
| createdAt | created_at | DateTime | `@default(now())` |
| updatedAt | updated_at | DateTime | `@updatedAt` |
| deletedAt | deleted_at | DateTime? | Soft delete |

```prisma
enum AssetType {
  desktop       // Computadora de escritorio
  laptop        // Laptop / portátil
  raspberry_pi  // Raspberry Pi / SBC
  mobile_phone  // Teléfono celular corporativo
  radio         // Radio de comunicación (walkie-talkie)
  printer       // Impresora / multifuncional / plotter
}

enum AssetStatus {
  registered     // Registrado — pendiente de ubicar o asignar
  in_storage     // En almacén
  assigned       // Asignado a un usuario
  in_maintenance // En mantenimiento
  decommissioned // Dado de baja
}

enum AssetCondition {
  new     // Nuevo
  good    // Buen estado
  fair    // Estado regular
  poor    // Estado deficiente
  damaged // Dañado / inservible
}

model Asset {
  id                 String         @id @default(uuid())
  internalCode       String         @unique @map("internal_code")
  name               String
  assetType          AssetType      @map("asset_type")
  serialNumber       String         @unique @map("serial_number")
  brand              String?
  model              String?
  status             AssetStatus    @default(registered)
  condition          AssetCondition
  purchaseDate       DateTime?      @map("purchase_date")
  purchasePriceLocal Decimal?       @map("purchase_price_local")
  purchasePriceUsd   Decimal?       @map("purchase_price_usd")
  supplierName       String?        @map("supplier_name")
  invoiceNumber      String?        @map("invoice_number")
  warrantyExpiryDate DateTime?      @map("warranty_expiry_date")
  locationId         String?        @map("location_id")
  notes              String?
  specs              Json?
  qrCode             String?        @unique @map("qr_code")
  imagePath          String?        @map("image_path")
  createdBy          String         @map("created_by")
  updatedBy          String?        @map("updated_by")
  deletedBy          String?        @map("deleted_by")
  createdAt          DateTime       @default(now()) @map("created_at")
  updatedAt          DateTime       @updatedAt @map("updated_at")
  deletedAt          DateTime?      @map("deleted_at")

  location             Location?             @relation(fields: [locationId], references: [id])
  createdByUser        User                  @relation("AssetCreatedBy", fields: [createdBy], references: [id])
  assignments          AssetAssignment[]
  incidents            Incident[]
  maintenanceOrders    MaintenanceOrder[]
  maintenanceSchedules MaintenanceSchedule[]
  documents            Document[]

  @@index([assetType])
  @@index([status])
  @@index([locationId])
  @@index([warrantyExpiryDate])
  @@index([deletedAt])
  @@map("assets")
}
```

**Ejemplos del campo `specs` por tipo:**
```json
// laptop / desktop:
{ "cpu": "Intel Core i7-1165G7", "ram_gb": 16, "storage_gb": 512,
  "storage_type": "SSD NVMe", "os": "Windows 11 Pro",
  "mac_address": "AA:BB:CC:DD:EE:FF", "ip_assigned": "192.168.1.50" }

// mobile_phone:
{ "imei": "123456789012345", "os": "Android 14",
  "storage_gb": 128, "sim_number": "521XXXXXXXXXX" }

// radio:
{ "frequency_band": "UHF 400-470 MHz", "channels": 16,
  "battery_model": "BL-1719" }

// printer:
{ "type": "Láser color", "network": true,
  "ip_assigned": "192.168.1.80", "ppm": 25 }
```

---

### 3.4 `AssetAssignment` — Asignaciones (Préstamos)

Historial completo de entregas. Cada asignación vincula un activo con un `User` directamente. `returnedAt IS NULL` = asignación activa.

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| assetId | asset_id | String | FK → Asset |
| userId | user_id | String | FK → User (receptor del equipo) |
| assignedAt | assigned_at | DateTime | Fecha/hora de entrega |
| assignedBy | assigned_by | String | FK → User (Admin TI que asignó) |
| returnedAt | returned_at | DateTime? | NULL = asignación activa |
| returnedBy | returned_by | String? | FK → User (Admin TI que recibió devolución) |
| conditionAtAssignment | condition_at_assignment | AssetCondition | Condición al entregar |
| conditionAtReturn | condition_at_return | AssetCondition? | Condición al devolver |
| accessories | accessories | Json? | Lista de accesorios entregados |
| notes | notes | String? | Observaciones de la entrega |
| signedAt | signed_at | DateTime? | Fecha/hora de firma digital del acta |
| signatureIp | signature_ip | String? | IP del firmante |
| deliveryDocumentId | delivery_document_id | String? | FK → Document (acta PDF de entrega) |
| returnDocumentId | return_document_id | String? | FK → Document (acta PDF de devolución) |
| createdAt | created_at | DateTime | `@default(now())` |

```prisma
model AssetAssignment {
  id                    String          @id @default(uuid())
  assetId               String          @map("asset_id")
  userId                String          @map("user_id")
  assignedAt            DateTime        @map("assigned_at")
  assignedBy            String          @map("assigned_by")
  returnedAt            DateTime?       @map("returned_at")
  returnedBy            String?         @map("returned_by")
  conditionAtAssignment AssetCondition  @map("condition_at_assignment")
  conditionAtReturn     AssetCondition? @map("condition_at_return")
  accessories           Json?
  notes                 String?
  signedAt              DateTime?       @map("signed_at")
  signatureIp           String?         @map("signature_ip")
  deliveryDocumentId    String?         @map("delivery_document_id")
  returnDocumentId      String?         @map("return_document_id")
  createdAt             DateTime        @default(now()) @map("created_at")

  asset          Asset    @relation(fields: [assetId], references: [id])
  user           User     @relation("AssignedToUser", fields: [userId], references: [id])
  assignedByUser User     @relation("AssignedByUser", fields: [assignedBy], references: [id])
  returnedByUser User?    @relation("ReturnedByUser", fields: [returnedBy], references: [id])

  @@index([assetId])
  @@index([userId])
  @@index([returnedAt])
  @@map("asset_assignments")
}
```

> **BR-INV-01 (innegociable):** Un activo no puede tener dos asignaciones activas simultáneamente. Se aplica mediante índice parcial en la BD (requiere migración SQL raw):
> ```sql
> CREATE UNIQUE INDEX idx_one_active_assignment
> ON asset_assignments(asset_id)
> WHERE returned_at IS NULL;
> ```
> El servicio también verifica esta condición antes de insertar.

---

### 3.5 `Incident` — Incidencias

Incidencias reportadas por `usuario_final` (sobre sus equipos) o creadas por `admin_ti`.

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| incidentNumber | incident_number | String | `@unique` — INC-2026-0001 |
| assetId | asset_id | String | FK → Asset |
| reportedBy | reported_by | String | FK → User |
| title | title | String | Resumen del problema |
| description | description | String | Descripción detallada |
| status | status | IncidentStatus (enum) | `@default(open)` |
| priority | priority | Priority (enum) | `@default(medium)` |
| maintenanceOrderId | maintenance_order_id | String? | FK → MaintenanceOrder |
| resolution | resolution | String? | Descripción de la resolución |
| resolvedAt | resolved_at | DateTime? | |
| resolvedBy | resolved_by | String? | FK → User (Admin TI) |
| createdAt | created_at | DateTime | `@default(now())` |
| updatedAt | updated_at | DateTime | `@updatedAt` |

```prisma
enum IncidentStatus {
  open
  in_review
  in_progress
  resolved
  closed
}

enum Priority {
  low
  medium
  high
  critical
}

model Incident {
  id                String         @id @default(uuid())
  incidentNumber    String         @unique @map("incident_number")
  assetId           String         @map("asset_id")
  reportedBy        String         @map("reported_by")
  title             String
  description       String
  status            IncidentStatus @default(open)
  priority          Priority       @default(medium)
  maintenanceOrderId String?       @map("maintenance_order_id")
  resolution        String?
  resolvedAt        DateTime?      @map("resolved_at")
  resolvedBy        String?        @map("resolved_by")
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  asset            Asset            @relation(fields: [assetId], references: [id])
  reportedByUser   User             @relation("ReportedBy", fields: [reportedBy], references: [id])
  resolvedByUser   User?            @relation("ResolvedBy", fields: [resolvedBy], references: [id])
  maintenanceOrder MaintenanceOrder? @relation(fields: [maintenanceOrderId], references: [id])

  @@index([assetId])
  @@index([reportedBy])
  @@index([status])
  @@index([createdAt])
  @@map("incidents")
}
```

> **Regla de negocio:** Un `usuario_final` solo puede crear incidencias sobre activos que tiene asignados activamente (`AssetAssignment` con `returnedAt IS NULL`). Validado en el Server Action.

---

### 3.6 `MaintenanceOrder` — Órdenes de trabajo

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| orderNumber | order_number | String | `@unique` — OT-2026-0001 |
| assetId | asset_id | String | FK → Asset |
| type | type | MaintenanceType (enum) | |
| status | status | MaintenanceStatus (enum) | `@default(pending)` |
| priority | priority | Priority (enum) | `@default(medium)` |
| title | title | String | |
| description | description | String? | |
| incidentId | incident_id | String? | FK → Incident (si es correctivo) |
| supplierName | supplier_name | String? | Proveedor externo (texto libre) |
| supplierTicket | supplier_ticket | String? | Número de caso externo |
| scheduledDate | scheduled_date | DateTime? | |
| startedAt | started_at | DateTime? | |
| completedAt | completed_at | DateTime? | |
| resolution | resolution | String? | Descripción de lo realizado |
| result | result | MaintenanceResult? | |
| isUnderWarranty | is_under_warranty | Boolean | `@default(false)` |
| assignedTo | assigned_to | String? | FK → User (quién ejecuta el trabajo) |
| createdBy | created_by | String | FK → User (quién creó la OT) |
| createdAt | created_at | DateTime | `@default(now())` |
| updatedAt | updated_at | DateTime | `@updatedAt` |

```prisma
enum MaintenanceType {
  preventive
  corrective
  warranty_repair
}

enum MaintenanceStatus {
  pending
  in_progress
  waiting_parts
  waiting_supplier
  completed
  cancelled
}

enum MaintenanceResult {
  resolved
  warranty_sent
  unrepairable
  cancelled
}

model MaintenanceOrder {
  id              String             @id @default(uuid())
  orderNumber     String             @unique @map("order_number")
  assetId         String             @map("asset_id")
  type            MaintenanceType
  status          MaintenanceStatus  @default(pending)
  priority        Priority           @default(medium)
  title           String
  description     String?
  incidentId      String?            @map("incident_id")
  supplierName    String?            @map("supplier_name")
  supplierTicket  String?            @map("supplier_ticket")
  scheduledDate   DateTime?          @map("scheduled_date")
  startedAt       DateTime?          @map("started_at")
  completedAt     DateTime?          @map("completed_at")
  resolution      String?
  result          MaintenanceResult?
  isUnderWarranty Boolean            @default(false) @map("is_under_warranty")
  assignedTo      String?            @map("assigned_to")
  createdBy       String             @map("created_by")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  asset            Asset      @relation(fields: [assetId], references: [id])
  incident         Incident?  @relation(fields: [incidentId], references: [id])
  assignedToUser   User?      @relation("MaintenanceAssignedTo", fields: [assignedTo], references: [id])
  createdByUser    User       @relation("MaintenanceCreatedBy", fields: [createdBy], references: [id])
  documents        Document[]
  incidents        Incident[] @relation

  @@index([assetId])
  @@index([status])
  @@index([scheduledDate])
  @@map("maintenance_orders")
}
```

---

### 3.7 `MaintenanceSchedule` — Programación preventiva

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| assetId | asset_id | String | FK → Asset |
| frequencyType | frequency_type | FrequencyType (enum) | |
| description | description | String | Qué debe hacerse |
| assignedTo | assigned_to | String? | FK → User (Admin TI responsable) |
| lastExecutedAt | last_executed_at | DateTime? | |
| nextDueDate | next_due_date | DateTime? | Calculada automáticamente |
| isActive | is_active | Boolean | `@default(true)` |
| createdBy | created_by | String | FK → User |
| createdAt | created_at | DateTime | `@default(now())` |
| updatedAt | updated_at | DateTime | `@updatedAt` |

```prisma
enum FrequencyType {
  monthly
  quarterly
  biannual
  annual
}

model MaintenanceSchedule {
  id              String        @id @default(uuid())
  assetId         String        @map("asset_id")
  frequencyType   FrequencyType @map("frequency_type")
  description     String
  assignedTo      String?       @map("assigned_to")
  lastExecutedAt  DateTime?     @map("last_executed_at")
  nextDueDate     DateTime?     @map("next_due_date")
  isActive        Boolean       @default(true) @map("is_active")
  createdBy       String        @map("created_by")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  asset          Asset @relation(fields: [assetId], references: [id])
  assignedToUser User? @relation("ScheduleAssignedTo", fields: [assignedTo], references: [id])
  createdByUser  User  @relation("ScheduleCreatedBy", fields: [createdBy], references: [id])

  @@index([assetId])
  @@index([nextDueDate])
  @@map("maintenance_schedules")
}
```

---

### 3.8 `Document` — Archivos adjuntos

Documentos vinculados a activos, asignaciones u órdenes de mantenimiento mediante un patrón polimórfico (`entityType` + `entityId`).

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| type | type | DocumentType (enum) | |
| name | name | String | Nombre descriptivo |
| filePath | file_path | String | Ruta interna del archivo |
| fileName | file_name | String | Nombre original del archivo |
| fileSize | file_size | Int | Tamaño en bytes |
| mimeType | mime_type | String | |
| entityType | entity_type | String | `"asset"` \| `"assignment"` \| `"maintenance_order"` |
| entityId | entity_id | String | UUID de la entidad relacionada |
| description | description | String? | |
| documentDate | document_date | DateTime? | |
| uploadedBy | uploaded_by | String | FK → User |
| createdAt | created_at | DateTime | `@default(now())` |

```prisma
enum DocumentType {
  invoice       // Factura de compra
  warranty      // Certificado de garantía
  manual        // Manual del fabricante
  delivery_act  // Acta de entrega / resguardo
  return_act    // Acta de devolución
  certificate   // Certificado técnico
  other         // Otro
}

model Document {
  id           String       @id @default(uuid())
  type         DocumentType
  name         String
  filePath     String       @map("file_path")
  fileName     String       @map("file_name")
  fileSize     Int          @map("file_size")
  mimeType     String       @map("mime_type")
  entityType   String       @map("entity_type")
  entityId     String       @map("entity_id")
  description  String?
  documentDate DateTime?    @map("document_date")
  uploadedBy   String       @map("uploaded_by")
  createdAt    DateTime     @default(now()) @map("created_at")

  uploadedByUser   User              @relation(fields: [uploadedBy], references: [id])
  asset            Asset?
  maintenanceOrder MaintenanceOrder?

  @@index([entityType, entityId])
  @@map("documents")
}
```

---

### 3.9 `AlertRule` / `AlertInstance` — Sistema de alertas

```prisma
model AlertRule {
  id          String          @id @default(uuid())
  name        String
  eventType   String          @map("event_type")
  advanceDays Int?            @map("advance_days")
  channels    Json            // ["system", "email"]
  isActive    Boolean         @default(true) @map("is_active")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  instances AlertInstance[]

  @@map("alert_rules")
}

enum AlertSeverity {
  info
  warning
  critical
}

enum AlertStatus {
  active
  read
  snoozed
  resolved
}

model AlertInstance {
  id          String        @id @default(uuid())
  ruleId      String        @map("rule_id")
  entityType  String        @map("entity_type")
  entityId    String        @map("entity_id")
  message     String
  severity    AlertSeverity
  status      AlertStatus   @default(active)
  snoozedUntil DateTime?   @map("snoozed_until")
  resolvedAt  DateTime?     @map("resolved_at")
  resolvedBy  String?       @map("resolved_by")
  createdAt   DateTime      @default(now()) @map("created_at")

  rule           AlertRule @relation(fields: [ruleId], references: [id])
  resolvedByUser User?     @relation(fields: [resolvedBy], references: [id])

  @@index([status])
  @@index([entityType, entityId])
  @@map("alert_instances")
}
```

---

### 3.10 `AuditLog` — Log de auditoría

Tabla estándar, de solo inserción. Sin particionamiento. No tiene FK con `@relation` para no acoplar el log a la existencia de los registros referenciados (los datos de usuario se desnormalizan).

| Campo Prisma | Columna BD | Tipo Prisma | Notas |
|---|---|---|---|
| id | id | String | `@id @default(uuid())` |
| entity | entity | String | Nombre del modelo: "Asset", "User", etc. |
| entityId | entity_id | String | UUID del registro afectado |
| action | action | AuditAction (enum) | |
| oldValues | old_values | Json? | Estado anterior (null en CREATE) |
| newValues | new_values | Json? | Estado nuevo (null en DELETE) |
| userId | user_id | String? | UUID del usuario — nullable (login fallido) |
| userEmail | user_email | String? | Desnormalizado — persiste aunque el usuario se borre |
| userRole | user_role | String? | Desnormalizado |
| ipAddress | ip_address | String? | |
| userAgent | user_agent | String? | |
| createdAt | created_at | DateTime | `@default(now())` — solo inserción |

```prisma
enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
  SIGN
}

model AuditLog {
  id         String      @id @default(uuid())
  entity     String
  entityId   String      @map("entity_id")
  action     AuditAction
  oldValues  Json?       @map("old_values")
  newValues  Json?       @map("new_values")
  userId     String?     @map("user_id")
  userEmail  String?     @map("user_email")
  userRole   String?     @map("user_role")
  ipAddress  String?     @map("ip_address")
  userAgent  String?     @map("user_agent")
  createdAt  DateTime    @default(now()) @map("created_at")

  @@index([entity, entityId])
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 4. MÓDULOS FUERA DEL ALCANCE — v1.0

Las siguientes tablas **no se crean** en v1.0. Se añadirán cuando se implementen las mejoras futuras correspondientes del ROADMAP.

| Tablas | Módulo | Mejora futura |
|---|---|---|
| `software_licenses`, `license_assignments` | Gestión de licencias | MF-02 |
| `suppliers`, `supplier_contacts`, `supplier_contracts` | Gestión de proveedores | MF-01 |
| `depreciation_records`, `budget_lines` | Módulo financiero | MF-03 |

En v1.0, `assets.supplierName` es un campo de texto libre que preserva el nombre del proveedor sin requerir el módulo completo.

---

## 5. RELACIONES ENTRE MODELOS — RESUMEN

```
Location (1) ──── (N) User
Location (1) ──── (N) Asset

User (1) ──── (N) AssetAssignment  [como receptor]
User (1) ──── (N) AssetAssignment  [como quien asigna]
User (1) ──── (N) Incident         [como quien reporta]
User (1) ──── (N) Asset            [como quien creó el registro]

Asset (1) ──── (N) AssetAssignment
Asset (1) ──── (N) Incident
Asset (1) ──── (N) MaintenanceOrder
Asset (1) ──── (N) MaintenanceSchedule
Asset (1) ──── (N) Document        [entityType = "asset"]

Incident (1) ──── (0..1) MaintenanceOrder  [correctivo]

MaintenanceOrder (1) ──── (N) Document     [entityType = "maintenance_order"]

AlertRule (1) ──── (N) AlertInstance

AuditLog — sin relaciones FK (datos de usuario desnormalizados)
```

---

## 6. ESTRATEGIA DE MIGRACIONES CON PRISMA

```bash
# Desarrollo: crear migración a partir de cambios en schema.prisma
npx prisma migrate dev --name descripcion_del_cambio

# Producción (Railway build step — se ejecuta automáticamente en el deploy)
npx prisma migrate deploy

# Regenerar el Prisma Client después de cualquier cambio en schema
npx prisma generate

# UI visual de la BD en desarrollo
npx prisma studio
```

**Reglas de migración:**
- `prisma/schema.prisma` es la **única fuente de verdad** — nunca se modifica la BD directamente.
- Las migraciones generadas en `prisma/migrations/` son archivos SQL versionados — se commitean al repositorio.
- Los cambios son aditivos siempre que sea posible (añadir columnas `nullable` antes de hacerlas `NOT NULL`).
- El índice parcial de asignaciones activas (`WHERE returned_at IS NULL`) requiere una migración con SQL raw:

```sql
-- Añadir dentro de la migración generada por Prisma:
CREATE UNIQUE INDEX idx_one_active_assignment
ON asset_assignments(asset_id)
WHERE returned_at IS NULL;
```

---

## 7. ESTRATEGIA DE BACKUP

Los backups de PostgreSQL son automáticos en Railway (incluidos en el plan). Para backup manual o migración de datos:

```bash
# Exportar
pg_dump -Fc "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).dump

# Restaurar
pg_restore -d "$DATABASE_URL" backup_YYYYMMDD_HHMMSS.dump
```
