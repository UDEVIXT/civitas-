-- DropForeignKey
ALTER TABLE "Acceso" DROP CONSTRAINT "Acceso_id_visitante_fkey";

-- DropForeignKey
ALTER TABLE "Bitacora" DROP CONSTRAINT "Bitacora_id_acceso_fkey";

-- AddForeignKey
ALTER TABLE "Acceso" ADD CONSTRAINT "Acceso_id_visitante_fkey" FOREIGN KEY ("id_visitante") REFERENCES "Visitante"("id_visitante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_id_acceso_fkey" FOREIGN KEY ("id_acceso") REFERENCES "Acceso"("id_acceso") ON DELETE CASCADE ON UPDATE CASCADE;
