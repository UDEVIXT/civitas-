import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { EmpleadoGeneralService } from './empleado-general.service';

@Controller('empleado-general')
export class EmpleadoGeneralController {
  constructor(
    private empleadoGeneralService: EmpleadoGeneralService,
  ) {}

  @Get('mis-empleados/:idResidente')
  async obtenerMisEmpleados(
    @Param('idResidente') idResidente: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '7',
    @Query('isActive') isActive?: string,
  ) {
    const isActiveValue = isActive?.toLowerCase();

    const isActiveBool =
      isActiveValue === 'true'
        ? true
        : isActiveValue === 'false'
          ? false
          : undefined;

    return this.empleadoGeneralService.obtenerMisEmpleados(
      idResidente,
      {
        search,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        isActive: isActiveBool,
      },
    );
  }
}