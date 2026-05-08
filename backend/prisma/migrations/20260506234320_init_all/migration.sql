/*
  Warnings:

  - You are about to drop the column `tipo_servicio` on the `HorarioAccesoServicios` table. All the data in the column will be lost.
  - You are about to drop the column `id_horario` on the `Servicio` table. All the data in the column will be lost.
  - You are about to drop the column `contraseña` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre_usuario]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_persona]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero_vivienda]` on the table `Vivienda` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_servicio` to the `HorarioAccesoServicios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HorarioAccesoServicios" DROP CONSTRAINT "HorarioAccesoServicios_tipo_servicio_fkey";

-- AlterTable
ALTER TABLE "HorarioAccesoServicios" DROP COLUMN "tipo_servicio",
ADD COLUMN     "id_servicio" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Servicio" DROP COLUMN "id_horario";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "contraseña",
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombre_usuario_key" ON "Usuario"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_id_persona_key" ON "Usuario"("id_persona");

-- CreateIndex
CREATE UNIQUE INDEX "Vivienda_numero_vivienda_key" ON "Vivienda"("numero_vivienda");

-- AddForeignKey
ALTER TABLE "Visitante" ADD CONSTRAINT "Visitante_id_residente_fkey" FOREIGN KEY ("id_residente") REFERENCES "Residente"("id_residente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_id_guardia_fkey" FOREIGN KEY ("id_guardia") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioAccesoServicios" ADD CONSTRAINT "HorarioAccesoServicios_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "Servicio"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;
