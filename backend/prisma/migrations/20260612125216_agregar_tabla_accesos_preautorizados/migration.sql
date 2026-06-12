-- CreateEnum
CREATE TYPE "Tipo_Visita" AS ENUM ('Visitante', 'Proveedor', 'Empleado');

-- CreateEnum
CREATE TYPE "Estado_QR" AS ENUM ('Activo', 'Expirado', 'Desactivado');

-- DropIndex
DROP INDEX "idx_visitante_tipo_visitante";

-- CreateTable
CREATE TABLE "AccesoPreautorizado" (
    "id_acceso_preautorizado" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "informacion_general" TEXT,
    "propiedad" TEXT NOT NULL,
    "nombre_residente" TEXT NOT NULL,
    "fecha_llegada" TIMESTAMP(3),
    "fecha_salida" TIMESTAMP(3),
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "tipo" "Tipo_Visita" NOT NULL,
    "tiene_nota" BOOLEAN NOT NULL DEFAULT false,
    "id_usuario" TEXT NOT NULL,
    "id_acceso" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccesoPreautorizado_pkey" PRIMARY KEY ("id_acceso_preautorizado")
);

-- AddForeignKey
ALTER TABLE "AccesoPreautorizado" ADD CONSTRAINT "AccesoPreautorizado_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesoPreautorizado" ADD CONSTRAINT "AccesoPreautorizado_id_acceso_fkey" FOREIGN KEY ("id_acceso") REFERENCES "Acceso"("id_acceso") ON DELETE CASCADE ON UPDATE CASCADE;
