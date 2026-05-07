/*
  Warnings:

  - A unique constraint covering the columns `[categoria]` on the table `TipoServicio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoria` to the `TipoServicio` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TipoServicio_nombre_key";

-- AlterTable
ALTER TABLE "TipoServicio" ADD COLUMN     "categoria" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TipoServicio_categoria_key" ON "TipoServicio"("categoria");
