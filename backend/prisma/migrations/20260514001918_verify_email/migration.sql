/*
  Warnings:

  - A unique constraint covering the columns `[token_verificacion]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "token_verificacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_token_verificacion_key" ON "Usuario"("token_verificacion");
