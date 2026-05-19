import { Module } from '@nestjs/common';

import { EmpleadoGeneralController } from './empleado-general.controller';
import { EmpleadoGeneralService } from './empleado-general.service';

import { EmpleadoModule } from '../empleado/empleado.module';

@Module({
  imports: [EmpleadoModule],
  controllers: [EmpleadoGeneralController],
  providers: [EmpleadoGeneralService],
})
export class EmpleadoGeneralModule {}