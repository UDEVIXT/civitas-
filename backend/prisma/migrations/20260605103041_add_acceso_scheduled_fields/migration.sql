-- DropIndex
DROP INDEX "idx_acceso_fecha_visita_programada";

-- AlterTable
ALTER TABLE "Acceso" ALTER COLUMN "fecha_visita_programada" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "fecha_salida_programada" SET DATA TYPE TIMESTAMP(3);
