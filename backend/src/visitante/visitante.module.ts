import { Module } from '@nestjs/common';
import { VisitanteService } from './visitante.service';
import { VisitanteController } from './visitante.controller';

@Module({
  controllers: [VisitanteController],
  providers: [VisitanteService],
})
export class VisitanteModule {}
