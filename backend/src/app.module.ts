import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ReportesModule } from './reportes/reportes.module';
import { EvidenciaReporteModule } from './evidencia-reporte/evidencia-incidencia.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { AuthModule } from './auth/auth.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { ResidenteModule } from './residente/residente.module';
import { ViviendaModule } from './vivienda/vivienda.module';
import { APP_GUARD } from '@nestjs/core/constants';
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 50,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
