/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

//Services
import { EmpleadoService } from './empleado.service';

//DTOs
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

//types
import { EmpleadoEditRequest } from './types';

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
    const byResidenteIdValue = byResidenteId || undefined;
    const byViviendaIdValue = byViviendaId || undefined;

    return this.empleadoService.obtenerEmpleados({
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      isActive: isActiveBool,
      byResidenteId: byResidenteIdValue,
      byViviendaId: byViviendaIdValue,
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
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() body: UpdateEmpleadoDto) {
    const requestData: EmpleadoEditRequest = body;

    const accion = requestData.accion || 'edicion';
    const data = requestData.data;

    // Escenario A: Solo cambio de estado (Baja/Reactivación)
    if (accion === 'baja' || accion === 'reactivacion') {
      return accion == 'baja'
        ? this.empleadoService.eliminarEmpleado(id, data?.motivo)
        : this.empleadoService.reactivarEmpleado(id);
    }

    // Escenario B: Edición completa (HU-1.5.4)
    if (!data.nombre || !data.horarios || !Array.isArray(data.horarios)) {
      throw new BadRequestException(
        'El nombre y los horarios son obligatorios para editar',
      );
    }

    return this.empleadoService.actualizarEmpleado(id, body);
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe())
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}
