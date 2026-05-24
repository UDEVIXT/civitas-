-- Remove unique RFC constraint so the same employee can be linked to multiple residences.
DROP INDEX IF EXISTS "Servicio_rfc_key";

-- Keep RFC indexed for duplicate lookups and matching.
CREATE INDEX "Servicio_rfc_idx" ON "Servicio"("rfc");
