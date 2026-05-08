import { Module } from '@nestjs/common';
import { EmpleadoController } from './empleado.controller';
import { EmpleadoService } from './empleado.service';

@Module({
  controllers: [EmpleadoController],
  providers: [EmpleadoService],
})
export class EmpleadoModule {}