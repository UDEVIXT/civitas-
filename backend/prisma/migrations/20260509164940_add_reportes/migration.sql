-- CreateEnum
CREATE TYPE "TipoReporte" AS ENUM ('QUEJA', 'SUGERENCIA', 'INCIDENCIA');

-- CreateEnum
CREATE TYPE "PrioridadReporte" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateTable
CREATE TABLE "Reporte" (
    "id_reporte" UUID NOT NULL,
    "id_usuario" UUID NOT NULL,
    "motivo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoReporte" NOT NULL,
    "latitud" DECIMAL(65,30) NOT NULL,
    "longitud" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoIncidencia" NOT NULL,
    "prioridad" "PrioridadReporte" NOT NULL,
    "es_anonimo" BOOLEAN NOT NULL,
    "resultado_esperado" TEXT,
    "resultado_solucion" TEXT,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id_reporte")
);

-- CreateTable
CREATE TABLE "EvidenciaReporte" (
    "id_evidencia" UUID NOT NULL,
    "id_reporte" UUID NOT NULL,
    "url_archivo" TEXT NOT NULL,
    "nombre_archivo" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenciaReporte_pkey" PRIMARY KEY ("id_evidencia")
);

-- AddForeignKey
ALTER TABLE "EvidenciaReporte" ADD CONSTRAINT "EvidenciaReporte_id_reporte_fkey" FOREIGN KEY ("id_reporte") REFERENCES "Reporte"("id_reporte") ON DELETE RESTRICT ON UPDATE CASCADE;
