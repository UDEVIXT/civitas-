import {
  Query,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  BadRequestException,
} from '@nestjs/common';

import { EmpleadoService } from './empleado.service';

@Controller('empleado')
export class EmpleadoController {
  constructor(private empleadoService: EmpleadoService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '7',
    @Query('isActive') isActive?: string,
    @Query('byResidenteId') byResidenteId?: string,
    @Query('byViviendaId') byViviendaId?: string,
  ) {
    const isActiveValue = isActive?.toLowerCase();
    const isActiveBool =
      isActiveValue === 'true'
        ? true
        : isActiveValue === 'false'
          ? false
          : undefined;
    const byResidenteIdNum = byResidenteId
      ? parseInt(byResidenteId, 10)
      : undefined;
    const byViviendaIdNum = byViviendaId
      ? parseInt(byViviendaId, 10)
      : undefined;

    return this.empleadoService.obtenerEmpleados({
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      isActive: isActiveBool,
      byResidenteId: byResidenteIdNum,
      byViviendaId: byViviendaIdNum,
    });
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: `Empleado ${id}` };
  }
  @Post()
  create() {
    return { message: 'Empleado creado' };
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { activo?: boolean; motivo?: string },
  ) {
    const { activo, motivo } = body;

    if (activo === undefined) {
      throw new BadRequestException('El campo "activo" es requerido');
    }

    if (activo === false) {
      if (!motivo || !motivo.trim()) {
        throw new BadRequestException('El motivo es requerido');
      }
      return this.empleadoService.eliminarEmpleado(id, motivo);
    }

    return this.empleadoService.reactivarEmpleado(id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}
