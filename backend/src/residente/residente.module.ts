import { Module } from '@nestjs/common';
import { ResidenteService } from './residente.service';
import { ResidenteController } from './residente.controller';

@Module({
  controllers: [ResidenteController],
  providers: [ResidenteService],
})
export class ResidenteModule {}
