// src/solicitud_administrador_guardia/solicitud_administrador_guardia.module.ts
import { Module } from '@nestjs/common';
import { SolicitudAdministradorGuardiaService } from './solicitud_administrador_guardia.service';
import { SolicitudAdministradorGuardiaController } from './solicitud_administrador_guardia.controller';
import { ArchivosModule } from '../r2-module/archivos.module';

@Module({
  imports: [ArchivosModule],
  controllers: [SolicitudAdministradorGuardiaController],
  providers: [SolicitudAdministradorGuardiaService],
  exports: [SolicitudAdministradorGuardiaService],
})
export class SolicitudAdministradorGuardiaModule {}