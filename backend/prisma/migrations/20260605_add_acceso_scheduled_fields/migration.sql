-- Add scheduled visit fields to Acceso and backfill from existing columns
ALTER TABLE "Acceso"
  ADD COLUMN IF NOT EXISTS "fecha_visita_programada" timestamptz;

ALTER TABLE "Acceso"
  ADD COLUMN IF NOT EXISTS "fecha_salida_programada" timestamptz;

-- Backfill: set programados equal to existing creados/expiracion when null
UPDATE "Acceso"
SET "fecha_visita_programada" = "fecha_creacion"
WHERE "fecha_visita_programada" IS NULL;

UPDATE "Acceso"
SET "fecha_salida_programada" = "fecha_expiracion"
WHERE "fecha_salida_programada" IS NULL;

-- Index to speed queries by scheduled date
CREATE INDEX IF NOT EXISTS "idx_acceso_fecha_visita_programada" ON "Acceso" ("fecha_visita_programada");
