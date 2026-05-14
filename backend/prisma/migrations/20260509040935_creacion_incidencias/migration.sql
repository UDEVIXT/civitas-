-- CreateEnum
CREATE TYPE "EstadoIncidencia" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'RESUELTA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Incidencia" (
    "id_incidencia" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoIncidencia" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id_residente" TEXT NOT NULL,

    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id_incidencia")
);

-- CreateTable
CREATE TABLE "HistorialIncidencia" (
    "id_historial" TEXT NOT NULL,
    "estado" "EstadoIncidencia" NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_incidencia" TEXT NOT NULL,

    CONSTRAINT "HistorialIncidencia_pkey" PRIMARY KEY ("id_historial")
);

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_id_residente_fkey" FOREIGN KEY ("id_residente") REFERENCES "Residente"("id_residente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialIncidencia" ADD CONSTRAINT "HistorialIncidencia_id_incidencia_fkey" FOREIGN KEY ("id_incidencia") REFERENCES "Incidencia"("id_incidencia") ON DELETE RESTRICT ON UPDATE CASCADE;
