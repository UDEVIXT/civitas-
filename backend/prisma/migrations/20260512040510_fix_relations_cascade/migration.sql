-- DropIndex
DROP INDEX "Bitacora_id_acceso_key";

-- AlterTable
ALTER TABLE "Acceso" ALTER COLUMN "codigo_qr" DROP NOT NULL;
