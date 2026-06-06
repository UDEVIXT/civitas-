-- CreateTable
CREATE TABLE "BitacoraQrVisitante" (
    "id_bitacora_qr" TEXT NOT NULL,
    "id_acceso" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "accion" VARCHAR(32) NOT NULL,
    "motivo" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BitacoraQrVisitante_pkey" PRIMARY KEY ("id_bitacora_qr")
);

-- CreateIndex
CREATE INDEX "BitacoraQrVisitante_id_acceso_idx" ON "BitacoraQrVisitante"("id_acceso");

-- CreateIndex
CREATE INDEX "BitacoraQrVisitante_id_usuario_idx" ON "BitacoraQrVisitante"("id_usuario");

-- CreateIndex
CREATE INDEX "BitacoraQrVisitante_accion_idx" ON "BitacoraQrVisitante"("accion");

-- AddForeignKey
ALTER TABLE "BitacoraQrVisitante" ADD CONSTRAINT "BitacoraQrVisitante_id_acceso_fkey" FOREIGN KEY ("id_acceso") REFERENCES "Acceso"("id_acceso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraQrVisitante" ADD CONSTRAINT "BitacoraQrVisitante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
