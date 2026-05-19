/*
  Warnings:

  - Added the required column `id_residente` to the `Servicio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_vivienda` to the `Servicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "id_residente" TEXT NOT NULL,
ADD COLUMN     "id_vivienda" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_id_residente_fkey" FOREIGN KEY ("id_residente") REFERENCES "Residente"("id_residente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_id_vivienda_fkey" FOREIGN KEY ("id_vivienda") REFERENCES "Vivienda"("id_vivienda") ON DELETE RESTRICT ON UPDATE CASCADE;
