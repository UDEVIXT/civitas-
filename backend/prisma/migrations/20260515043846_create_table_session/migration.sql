-- CreateTable
CREATE TABLE "sesiones" (
    "id_sesion" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ip" TEXT,
    "dispositivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id_sesion")
);

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
