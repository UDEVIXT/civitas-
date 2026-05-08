-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "id_tipo_servicio" TEXT;

-- CreateTable
CREATE TABLE "TipoServicio" (
    "id_tipo_servicio" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "TipoServicio_pkey" PRIMARY KEY ("id_tipo_servicio")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoServicio_nombre_key" ON "TipoServicio"("nombre");

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_id_tipo_servicio_fkey" FOREIGN KEY ("id_tipo_servicio") REFERENCES "TipoServicio"("id_tipo_servicio") ON DELETE SET NULL ON UPDATE CASCADE;
