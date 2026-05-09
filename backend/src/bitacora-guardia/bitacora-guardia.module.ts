import { Module } from '@nestjs/common';
import { BitacoraGuardiaService } from './bitacora-guardia.service';
import { BitacoraGuardiaController } from './bitacora-guardia.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BitacoraGuardiaController],
  providers: [BitacoraGuardiaService, PrismaService],
})
export class BitacoraGuardiaModule {}
