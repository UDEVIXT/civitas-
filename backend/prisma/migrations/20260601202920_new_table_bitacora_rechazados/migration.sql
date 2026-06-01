-- CreateEnum
CREATE TYPE "Estatus_Solicitud" AS ENUM ('Pendiente', 'Aceptada', 'Rechazada');

-- CreateTable
CREATE TABLE "Solicitud_administrador_guardia" (
    "id_solicitud" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "rol_solicitado" "Rol" NOT NULL,
    "nombre" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT,
    "correo" TEXT NOT NULL,
    "estatus_solicitud" "Estatus_Solicitud" NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitud_administrador_guardia_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "BitacoraDesactivacionQr" (
    "id_desactivacion" TEXT NOT NULL,
    "id_acceso" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "motivo" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BitacoraDesactivacionQr_pkey" PRIMARY KEY ("id_desactivacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_administrador_guardia_id_usuario_key" ON "Solicitud_administrador_guardia"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitud_administrador_guardia_correo_key" ON "Solicitud_administrador_guardia"("correo");

-- CreateIndex
CREATE INDEX "BitacoraDesactivacionQr_id_acceso_idx" ON "BitacoraDesactivacionQr"("id_acceso");

-- AddForeignKey
ALTER TABLE "Solicitud_administrador_guardia" ADD CONSTRAINT "Solicitud_administrador_guardia_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraDesactivacionQr" ADD CONSTRAINT "BitacoraDesactivacionQr_id_acceso_fkey" FOREIGN KEY ("id_acceso") REFERENCES "Acceso"("id_acceso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraDesactivacionQr" ADD CONSTRAINT "BitacoraDesactivacionQr_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
