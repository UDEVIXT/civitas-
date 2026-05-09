import { Module } from '@nestjs/common';
import { EvidenciaIncidenciaService } from './evidencia-incidencia.service';
import { EvidenciaIncidenciaController } from './evidencia-incidencia.controller';

@Module({
  controllers: [EvidenciaIncidenciaController],
  providers: [EvidenciaIncidenciaService],
})
export class EvidenciaIncidenciaModule {}
