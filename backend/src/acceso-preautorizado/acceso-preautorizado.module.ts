import { Module } from '@nestjs/common';
import { AccesoPreautorizadoService } from './acceso-preautorizado.service';
import { AccesoPreautorizadoController } from './acceso-preautorizado.controller';

@Module({
  controllers: [AccesoPreautorizadoController],
  providers: [AccesoPreautorizadoService],
})
export class AccesoPreautorizadoModule {}
