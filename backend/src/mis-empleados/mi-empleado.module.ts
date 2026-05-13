import { Module } from '@nestjs/common';
import { EmpleadoController } from './mi-empleado.controller';
import { EmpleadoService } from './mi-empleado.service';

@Module({
  controllers: [EmpleadoController],
  providers: [EmpleadoService],
})
export class EmpleadoModule {}