-- DropForeignKey
ALTER TABLE "Bitacora" DROP CONSTRAINT "Bitacora_id_guardia_fkey";

-- CreateTable
CREATE TABLE "Guardia" (
    "id_guardia" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "nombre" VARCHAR(128) NOT NULL,
    "turno" TEXT NOT NULL,

    CONSTRAINT "Guardia_pkey" PRIMARY KEY ("id_guardia")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guardia_id_usuario_key" ON "Guardia"("id_usuario");

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_id_guardia_fkey" FOREIGN KEY ("id_guardia") REFERENCES "Guardia"("id_guardia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guardia" ADD CONSTRAINT "Guardia_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
