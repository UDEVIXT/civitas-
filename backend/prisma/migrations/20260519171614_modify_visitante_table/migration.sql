/*
  Warnings:

  - You are about to drop the column `motivo` on the `Visitante` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Visitante" DROP COLUMN "motivo",
ADD COLUMN     "tipo_vehiculo" TEXT;
