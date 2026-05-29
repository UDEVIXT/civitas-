import { Module } from '@nestjs/common';
import { SolicitudCambioRolService } from './solicitud_cambio_rol.service';
import { SolicitudCambioRolController } from './solicitud_cambio_rol.controller';

@Module({
  controllers: [SolicitudCambioRolController],
  providers: [SolicitudCambioRolService],
})
export class SolicitudCambioRolModule {}
