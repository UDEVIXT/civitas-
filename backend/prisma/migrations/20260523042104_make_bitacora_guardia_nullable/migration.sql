-- DropForeignKey
ALTER TABLE "Bitacora" DROP CONSTRAINT "Bitacora_id_guardia_fkey";

-- AlterTable
ALTER TABLE "Bitacora" ALTER COLUMN "id_guardia" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_id_guardia_fkey" FOREIGN KEY ("id_guardia") REFERENCES "Guardia"("id_guardia") ON DELETE SET NULL ON UPDATE CASCADE;
