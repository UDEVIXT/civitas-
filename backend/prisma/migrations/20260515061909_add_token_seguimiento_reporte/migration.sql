/*
  Warnings:

  - A unique constraint covering the columns `[token_seguimiento]` on the table `Reporte` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reporte" ADD COLUMN     "token_seguimiento" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reporte_token_seguimiento_key" ON "Reporte"("token_seguimiento");
