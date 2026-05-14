import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ReportesModule } from './reportes/reportes.module';
import { EvidenciaReporteModule } from './evidencia-reporte/evidencia-incidencia.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { AuthModule } from './auth/auth.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { ViviendaModule } from './vivienda/vivienda.module';
import { ResidenteModule } from './residente/residente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BitacoraModule,
    ReportesModule,
    EvidenciaReporteModule,
    EmpleadoModule,
    AuthModule,
    IncidenciasModule,
    ResidenteModule,
    ViviendaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
