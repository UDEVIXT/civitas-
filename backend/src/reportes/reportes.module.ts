import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { ArchivosModule } from './archivos.module'; 
import { EvidenciaReporteModule } from '../evidencia-reporte/evidencia-incidencia.module'; 

@Module({
  imports: [ArchivosModule, EvidenciaReporteModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}