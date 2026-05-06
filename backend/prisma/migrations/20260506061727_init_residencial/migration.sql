-- CreateEnum
CREATE TYPE "EstatusAcceso" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('Administrador', 'Guardia', 'Residente');

-- CreateTable
CREATE TABLE "Persona" (
    "id_persona" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT,
    "url_imagen" TEXT,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id_persona")
);

-- CreateTable
CREATE TABLE "Vivienda" (
    "id_vivienda" TEXT NOT NULL,
    "numero_vivienda" TEXT NOT NULL,

    CONSTRAINT "Vivienda_pkey" PRIMARY KEY ("id_vivienda")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" TEXT NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "id_persona" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Residente" (
    "id_residente" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_vivienda" TEXT NOT NULL,

    CONSTRAINT "Residente_pkey" PRIMARY KEY ("id_residente")
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id_bitacora" TEXT NOT NULL,
    "id_acceso" TEXT NOT NULL,
    "id_guardia" TEXT NOT NULL,
    "fecha_hora_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_hora_salida" TIMESTAMP(3),
    "comentario" TEXT,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id_bitacora")
);

-- CreateTable
CREATE TABLE "Acceso" (
    "id_acceso" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_visitante" TEXT NOT NULL,
    "codigo_qr" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "estatus" "EstatusAcceso" NOT NULL DEFAULT 'Activo',
    "comentario_admin" TEXT,

    CONSTRAINT "Acceso_pkey" PRIMARY KEY ("id_acceso")
);

-- CreateTable
CREATE TABLE "Visitante" (
    "id_visitante" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "es_frecuente" BOOLEAN NOT NULL DEFAULT false,
    "telefono" TEXT,
    "url_imagen" TEXT,
    "motivo" TEXT,
    "id_residente" TEXT NOT NULL,
    "id_servicio" TEXT,

    CONSTRAINT "Visitante_pkey" PRIMARY KEY ("id_visitante")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id_servicio" TEXT NOT NULL,
    "nombre_servicio" TEXT NOT NULL,
    "cargo" TEXT,
    "nombre_empresa" TEXT,
    "tipo_carro" TEXT,
    "placas" TEXT,
    "id_horario" TEXT,
    "rfc" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "HorarioAccesoServicios" (
    "id_horario" TEXT NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fin" TIMESTAMP(3) NOT NULL,
    "tipo_servicio" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HorarioAccesoServicios_pkey" PRIMARY KEY ("id_horario")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Bitacora_id_acceso_key" ON "Bitacora"("id_acceso");

-- CreateIndex
CREATE UNIQUE INDEX "Acceso_codigo_qr_key" ON "Acceso"("codigo_qr");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_placas_key" ON "Servicio"("placas");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_rfc_key" ON "Servicio"("rfc");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Residente" ADD CONSTRAINT "Residente_id_vivienda_fkey" FOREIGN KEY ("id_vivienda") REFERENCES "Vivienda"("id_vivienda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Residente" ADD CONSTRAINT "Residente_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_id_acceso_fkey" FOREIGN KEY ("id_acceso") REFERENCES "Acceso"("id_acceso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acceso" ADD CONSTRAINT "Acceso_id_visitante_fkey" FOREIGN KEY ("id_visitante") REFERENCES "Visitante"("id_visitante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acceso" ADD CONSTRAINT "Acceso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitante" ADD CONSTRAINT "Visitante_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "Servicio"("id_servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_id_horario_fkey" FOREIGN KEY ("id_horario") REFERENCES "HorarioAccesoServicios"("id_horario") ON DELETE SET NULL ON UPDATE CASCADE;
