/*
  Warnings:

  - Changed the type of `dia_semana` on the `HorarioAccesoServicios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- AlterTable
ALTER TABLE "HorarioAccesoServicios" DROP COLUMN "dia_semana",
ADD COLUMN     "dia_semana" "DiaSemana" NOT NULL;

-- CreateIndex
CREATE INDEX "HorarioAccesoServicios_dia_semana_activo_idx" ON "HorarioAccesoServicios"("dia_semana", "activo");
