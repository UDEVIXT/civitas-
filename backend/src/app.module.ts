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
import { EmpleadoGeneralModule } from './empleado-general/empleado-general.module';
import { AuthModule } from './auth/auth.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { ResidenteModule } from './residente/residente.module';
import { ViviendaModule } from './vivienda/vivienda.module';
import { APP_GUARD } from '@nestjs/core/constants';
import { MiEmpleadoModule } from './mis-empleados/mi-empleado.module'; 
import { MailModule } from './mail/mail.module';
import { MisServiciosModule } from './mis-servicios/mis-servicios.module';
import { AccesosServiciosModule } from './accesos-servicios/accesos-servicios.module';
import { VisitanteModule } from './visitante/visitante.module';
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
    EmpleadoGeneralModule,
    AuthModule,
    IncidenciasModule,
    ResidenteModule,
    ViviendaModule,
    MiEmpleadoModule, 
    MisServiciosModule,
    AccesosServiciosModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 50,
      },
    ]), MailModule, VisitanteModule,
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
