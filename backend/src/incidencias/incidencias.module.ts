import { Module } from '@nestjs/common';
import { IncidenciasController } from './incidencias.controller';
import { IncidenciasService } from './incidencias.service';
import { PrismaService } from '../prisma/prisma.service';
import { IncidenciasGateway } from './incidencias.gateway';

@Module({
  controllers: [IncidenciasController],
  providers: [IncidenciasService, PrismaService, IncidenciasGateway],
})
export class IncidenciasModule {}