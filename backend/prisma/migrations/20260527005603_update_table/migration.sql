-- AlterTable
ALTER TABLE "Administrador" ALTER COLUMN "apellidos" DROP NOT NULL,
ALTER COLUMN "cargo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Guardia" ALTER COLUMN "turno" DROP NOT NULL;
