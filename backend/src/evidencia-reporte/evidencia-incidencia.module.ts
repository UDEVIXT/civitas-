import { Module } from '@nestjs/common';
import { EvidenciaReporteService } from './evidencia-incidencia.service';
import { EvidenciaReporteController } from './evidencia-incidencia.controller';

@Module({
  controllers: [EvidenciaReporteController],
  providers: [EvidenciaReporteService],
})
export class EvidenciaReporteModule {}
