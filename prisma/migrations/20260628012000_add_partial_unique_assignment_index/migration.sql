-- Índice parcial único: garantiza que un activo no puede tener
-- dos asignaciones activas simultáneamente (returned_at IS NULL = activa).
-- No puede ser generado por Prisma — documentado en el encabezado de schema.prisma.
CREATE UNIQUE INDEX idx_one_active_assignment
ON asset_assignments(asset_id)
WHERE returned_at IS NULL;
