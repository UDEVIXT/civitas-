import { Module } from '@nestjs/common';
import { VisitanteService } from './visitante.service';
import { VisitanteController } from './visitante.controller';
import { ArchivosModule } from '../r2-module/archivos.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ArchivosModule],
  controllers: [VisitanteController],
  providers: [VisitanteService],
})
export class VisitanteModule {}
