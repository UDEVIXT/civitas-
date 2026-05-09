/*
  Warnings:

  - A unique constraint covering the columns `[id_servicio]` on the table `Visitante` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Visitante_id_servicio_key" ON "Visitante"("id_servicio");
