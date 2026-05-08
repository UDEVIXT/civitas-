import { Module } from '@nestjs/common';
import { EmpleadoController } from './empleado.controller';

@Module({
  controllers: [EmpleadoController],
})
export class EmpleadoModule {}
