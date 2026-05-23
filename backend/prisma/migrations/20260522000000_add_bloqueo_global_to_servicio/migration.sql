-- Add a dedicated flag for administrator-level global blocking of an employee.
ALTER TABLE "Servicio"
ADD COLUMN IF NOT EXISTS "bloqueo_global" BOOLEAN NOT NULL DEFAULT false;

-- Keep the schema aligned with the source file.
CREATE INDEX IF NOT EXISTS "Servicio_rfc_idx" ON "Servicio"("rfc");
