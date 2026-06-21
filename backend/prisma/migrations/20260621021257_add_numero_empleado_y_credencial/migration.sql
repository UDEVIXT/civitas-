/*
  Warnings:

  - A unique constraint covering the columns `[numero_empleado]` on the table `Administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero_empleado]` on the table `Guardia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero_empleado]` on the table `Solicitud_administrador_guardia` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Administrador" ADD COLUMN     "numero_empleado" TEXT;

-- AlterTable
ALTER TABLE "Guardia" ADD COLUMN     "numero_empleado" TEXT;

-- AlterTable
ALTER TABLE "Solicitud_administrador_guardia" ADD COLUMN     "credencial_frente_key" TEXT,
ADD COLUMN     "credencial_reverso_key" TEXT,
ADD COLUMN     "numero_empleado" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_numero_empleado_key" ON "Administrador"("numero_empleado");

-- CreateIndex
CREATE UNIQUE INDEX "Guardia_numero_empleado_key" ON "Guardia"("numero_empleado");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_administrador_guardia_numero_empleado_key" ON "Solicitud_administrador_guardia"("numero_empleado");
