-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'SUSPENDIDO');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "correo_verificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO';
