import { Module } from '@nestjs/common';
import { ViviendaService } from './vivienda.service';
import { ViviendaController } from './vivienda.controller';

@Module({
  controllers: [ViviendaController],
  providers: [ViviendaService],
})
export class ViviendaModule {}
