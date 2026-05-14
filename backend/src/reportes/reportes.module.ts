import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
// Importamos el Módulo (NO el servicio) desde su ruta correspondiente
import { ArchivosModule } from './archivos.module'; 

@Module({
  // Colocamos el módulo invitado en el arreglo de imports
  imports: [ArchivosModule], 
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}