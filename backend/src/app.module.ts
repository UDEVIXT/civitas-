import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { EmpleadoModule } from './empleado/empleado.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BitacoraModule,
    EmpleadoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
