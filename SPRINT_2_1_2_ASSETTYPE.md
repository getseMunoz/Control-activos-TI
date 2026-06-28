# Sprint 2.1.2 — Refactor de AssetType: de enum a tabla administrable

**Fecha:** 2026-06-27
**Scope:** Cambio arquitectónico puntual en `prisma/schema.prisma` antes de la primera migración.

---

## 1. Qué cambió

### Eliminado

```prisma
enum AssetType {
  desktop
  laptop
  raspberry_pi
  mobile_phone
  radio
  printer
}
```

### Añadido

```prisma
model AssetType {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  assets Asset[]

  @@index([isActive])
  @@map("asset_types")
}
```

### Modificado en el modelo `Asset`

| Antes | Después |
|---|---|
| `assetType AssetType @map("asset_type")` | `assetTypeId String @map("asset_type_id")` |
| *(sin relación explícita)* | `assetType AssetType @relation(fields: [assetTypeId], references: [id])` |
| `@@index([assetType])` | `@@index([assetTypeId])` |

---

## 2. Por qué este cambio mejora el sistema

### Problema con el enum

Un enum de PostgreSQL es parte del schema de la base de datos. Añadir un nuevo valor requiere:

1. Modificar el código fuente (`schema.prisma`)
2. Generar una migración (`prisma migrate dev`)
3. Ejecutar la migración en producción (`prisma migrate deploy`)
4. Hacer deploy de la aplicación

Para una empresa que podría adquirir drones, cámaras, tablets u otros dispositivos en cualquier momento, este proceso crea una dependencia operativa innecesaria: el administrador de TI depende del equipo de desarrollo para algo tan simple como registrar un nuevo tipo de activo.

### Solución con la tabla

Con `AssetType` como tabla:
- El Admin TI crea un nuevo tipo desde la interfaz del sistema (CRUD estándar)
- No se requiere código, migración ni deploy
- Los tipos desactivados (`isActive = false`) dejan de aparecer en formularios pero mantienen la integridad referencial con activos históricos
- La unicidad de nombres (`@unique` en `name`) evita duplicados sin lógica adicional

### Por qué el modelo es tan simple

Los campos incluidos son exactamente los necesarios:
- `name` — identificador del tipo (ej: "Laptop", "Drone", "Cámara IP")
- `description` — contexto opcional para el Admin TI
- `isActive` — permite retirar tipos sin romper activos existentes
- `createdAt` / `updatedAt` — trazabilidad estándar

No se añadió nada más porque no hay requisitos adicionales en V1 para esta entidad.

---

## 3. Modelos modificados

| Modelo | Tipo de cambio | Descripción |
|---|---|---|
| `AssetType` | **Creado** | Nueva tabla de catálogo en `asset_types` |
| `Asset` | **Modificado** | Campo `assetType` → FK `assetTypeId` + relación explícita + índice actualizado |

**Modelos no tocados:** `Location`, `User`, `AssetAssignment`, `AssetExpense`, `Incident`, `MaintenanceOrder`, `MaintenanceSchedule`, `Document`, `AuditLog`.

---

## 4. Confirmación de estabilidad del resto del schema

- Todos los demás modelos permanecen sin cambios.
- Todos los enums restantes (`Role`, `Modality`, `AssetStatus`, `IncidentStatus`, `Priority`, `MaintenanceType`, `MaintenanceStatus`, `MaintenanceResult`, `FrequencyType`, `DocumentType`, `AuditAction`) permanecen sin cambios después de los ajustes aprobados.
- Todas las relaciones, índices y constraints del resto del schema permanecen sin cambios.
- `prisma validate` finaliza sin errores.
- Nota: `AssetCondition` fue eliminado posteriormente porque la condición física se registrará mediante notas/evidencia, evitando clasificaciones subjetivas.

---

## 5. Impacto en la primera migración

Al ejecutar `npm run db:migrate`, Prisma generará la tabla `asset_types` con su FK desde `assets.asset_type_id`.

La tabla `asset_types` debe poblarse con los tipos iniciales mediante seed o desde la interfaz antes de poder registrar el primer activo. Los tipos de partida sugeridos:

| name | description |
|---|---|
| Desktop | Computadora de escritorio |
| Laptop | Computadora portátil |
| Raspberry Pi | Computadora de placa única |
| Teléfono móvil | Dispositivo móvil corporativo |
| Radio | Radio de comunicación |
| Impresora | Impresora o multifuncional |

Estos valores son sugerencia operativa, no parte del schema. El Admin TI puede modificarlos desde la interfaz una vez desplegado el sistema.
