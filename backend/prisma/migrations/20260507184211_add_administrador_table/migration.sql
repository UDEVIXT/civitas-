-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('Gobierno', 'Comite');

-- CreateTable
CREATE TABLE "Administrador" (
    "id_administrador" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "nombre" VARCHAR(128) NOT NULL,
    "apellidos" VARCHAR(128) NOT NULL,
    "cargo" "Cargo" NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_id_usuario_key" ON "Administrador"("id_usuario");

-- AddForeignKey
ALTER TABLE "Administrador" ADD CONSTRAINT "Administrador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
