/*
  Warnings:

  - The primary key for the `EvidenciaReporte` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Reporte` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `HistorialIncidencia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Incidencia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EvidenciaReporte" DROP CONSTRAINT "EvidenciaReporte_id_reporte_fkey";

-- DropForeignKey
ALTER TABLE "HistorialIncidencia" DROP CONSTRAINT "HistorialIncidencia_id_incidencia_fkey";

-- DropForeignKey
ALTER TABLE "Incidencia" DROP CONSTRAINT "Incidencia_id_residente_fkey";

-- AlterTable
ALTER TABLE "EvidenciaReporte" DROP CONSTRAINT "EvidenciaReporte_pkey",
ALTER COLUMN "id_evidencia" SET DATA TYPE TEXT,
ALTER COLUMN "id_reporte" SET DATA TYPE TEXT,
ADD CONSTRAINT "EvidenciaReporte_pkey" PRIMARY KEY ("id_evidencia");

-- AlterTable
ALTER TABLE "Reporte" DROP CONSTRAINT "Reporte_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id_reporte" SET DATA TYPE TEXT,
ALTER COLUMN "id_usuario" SET DATA TYPE TEXT,
ADD CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id_reporte");

-- DropTable
DROP TABLE "HistorialIncidencia";

-- DropTable
DROP TABLE "Incidencia";

-- AddForeignKey
ALTER TABLE "EvidenciaReporte" ADD CONSTRAINT "EvidenciaReporte_id_reporte_fkey" FOREIGN KEY ("id_reporte") REFERENCES "Reporte"("id_reporte") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
