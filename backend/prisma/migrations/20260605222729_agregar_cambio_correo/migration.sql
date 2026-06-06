/*
  Warnings:

  - A unique constraint covering the columns `[token_cambio_correo]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Estatus_Solicitud" AS ENUM ('Pendiente', 'Aceptada', 'Rechazada');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "correo_pendiente" TEXT,
ADD COLUMN     "token_cambio_correo" TEXT;

-- CreateTable
CREATE TABLE "Solicitud_cambio_rol" (
    "id_solicitud" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "rol_solicitado" "Rol" NOT NULL,
    "razon" TEXT NOT NULL,
    "estatus_solicitud" "Estatus_Solicitud" NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_cambio_rol_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_token_cambio_correo_key" ON "Usuario"("token_cambio_correo");

-- AddForeignKey
ALTER TABLE "Solicitud_cambio_rol" ADD CONSTRAINT "Solicitud_cambio_rol_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
