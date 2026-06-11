import { Module } from '@nestjs/common';
import { MisServiciosController } from './mis-servicios.controller';
import { MisServiciosService } from './mis-servicios.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MisServiciosController],
  providers: [MisServiciosService],
})
export class MisServiciosModule {}