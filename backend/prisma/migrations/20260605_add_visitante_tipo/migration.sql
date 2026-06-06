-- Add a dedicated visitor type column so it is no longer stored in motivo
ALTER TABLE "Visitante"
  ADD COLUMN IF NOT EXISTS "tipo_visitante" text;

-- Backfill existing data from the previous overloaded column
UPDATE "Visitante"
SET "tipo_visitante" = COALESCE("motivo", 'Otro')
WHERE "tipo_visitante" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_visitante_tipo_visitante" ON "Visitante" ("tipo_visitante");
