import { Module } from '@nestjs/common';
import { TipoServicioController } from './tipo-servicio.controller';
import { TipoServicioService } from './tipo-servicio.service';

@Module({
  controllers: [TipoServicioController],
  providers: [TipoServicioService],
  exports: [TipoServicioService],
})
export class TipoServicioModule {}
