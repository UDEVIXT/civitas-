import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { EmpleadoGeneralService } from './empleado-general.service';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

import type { Request } from 'express';

@Controller('empleado-general')
export class EmpleadoGeneralController {
  constructor(
    private empleadoGeneralService: EmpleadoGeneralService,
  ) {}

  @Get('mis-empleados')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async obtenerMisEmpleados(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '7',
    @Query('isActive') isActive?: string,
  ) {
    // 🔥 usuario real autenticado
    const userId = req.user!['userId'];

    const isActiveValue = isActive?.toLowerCase();

    const isActiveBool =
      isActiveValue === 'true'
        ? true
        : isActiveValue === 'false'
          ? false
          : undefined;

    return this.empleadoGeneralService.obtenerMisEmpleados(
      userId,
      {
        search,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        isActive: isActiveBool,
      },
    );
  }
}