-- DropForeignKey
ALTER TABLE "Servicio" DROP CONSTRAINT "Servicio_id_horario_fkey";

-- AddForeignKey
ALTER TABLE "HorarioAccesoServicios" ADD CONSTRAINT "HorarioAccesoServicios_tipo_servicio_fkey" FOREIGN KEY ("tipo_servicio") REFERENCES "Servicio"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;
