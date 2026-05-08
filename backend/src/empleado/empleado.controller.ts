import {
  Query,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';

import { EmpleadoService } from './empleado.service';

@Controller('empleado')
export class EmpleadoController {
  constructor(private empleadoService: EmpleadoService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('isActive') isActive?: string,
    @Query('byResidenteId') byResidenteId?: string,
    @Query('byViviendaId') byViviendaId?: string,
  ) {
    const isActiveBool = isActive
      ? isActive.toLowerCase() === 'true'
      : undefined;
    const byResidenteIdNum = byResidenteId
      ? parseInt(byResidenteId, 10)
      : undefined;
    const byViviendaIdNum = byViviendaId
      ? parseInt(byViviendaId, 10)
      : undefined;

    return this.empleadoService.obtenerEmpleadosActivos({
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
  update(@Param('id') id: string) {
    return { message: `Empleado ${id} actualizado` };
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: `Empleado ${id} eliminado` };
  }
}
