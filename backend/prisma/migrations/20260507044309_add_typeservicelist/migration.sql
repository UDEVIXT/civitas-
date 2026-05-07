/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `TipoServicio` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TipoServicio_categoria_key";

-- CreateIndex
CREATE UNIQUE INDEX "TipoServicio_nombre_key" ON "TipoServicio"("nombre");
