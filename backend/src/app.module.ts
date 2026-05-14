import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { ReportesModule } from './reportes/reportes.module';
import { EvidenciaIncidenciaModule } from './evidencia-incidencia/evidencia-incidencia.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { EmpleadoGeneralModule } from './empleado-general/empleado-general.module';
import { AuthModule } from './auth/auth.module';
import { BitacoraGuardiaModule } from './bitacora-guardia/bitacora-guardia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BitacoraModule,
    ReportesModule,
    EvidenciaIncidenciaModule,
    EmpleadoModule,
    EmpleadoGeneralModule,
    AuthModule,
    BitacoraGuardiaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
