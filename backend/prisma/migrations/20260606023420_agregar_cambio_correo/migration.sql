/*
  Warnings:

  - A unique constraint covering the columns `[token_cambio_correo]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "correo_pendiente" TEXT,
ADD COLUMN     "token_cambio_correo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_token_cambio_correo_key" ON "Usuario"("token_cambio_correo");
