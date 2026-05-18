-- AlterTable
ALTER TABLE "Bitacora" ADD COLUMN     "id_guardia_salida" TEXT;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_id_guardia_salida_fkey" FOREIGN KEY ("id_guardia_salida") REFERENCES "Guardia"("id_guardia") ON DELETE SET NULL ON UPDATE CASCADE;
