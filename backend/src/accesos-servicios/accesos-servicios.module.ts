import { Module } from '@nestjs/common';
import { AccesosServiciosController } from './accesos-servicios.controller';
import { AccesosServiciosService } from './accesos-servicios.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccesosServiciosController],
  providers: [AccesosServiciosService],
})
export class AccesosServiciosModule {}
