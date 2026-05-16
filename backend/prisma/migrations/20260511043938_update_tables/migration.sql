/*
  Warnings:

  - You are about to drop the column `estado` on the `HistorialIncidencia` table. All the data in the column will be lost.
  - Added the required column `estado_anterior` to the `HistorialIncidencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nuevo_estado` to the `HistorialIncidencia` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `Reporte` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Visitante_id_servicio_key";

-- AlterTable
ALTER TABLE "HistorialIncidencia" DROP COLUMN "estado",
ADD COLUMN     "actualizado_por" TEXT DEFAULT 'Sistema',
ADD COLUMN     "estado_anterior" "EstadoIncidencia" NOT NULL,
ADD COLUMN     "nuevo_estado" "EstadoIncidencia" NOT NULL;

-- AlterTable
ALTER TABLE "Incidencia" ADD COLUMN     "es_anonimo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prioridad" TEXT DEFAULT 'MEDIA';

-- AlterTable
ALTER TABLE "Reporte" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoIncidencia" NOT NULL;

