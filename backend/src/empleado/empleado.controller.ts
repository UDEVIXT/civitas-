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
<<<<<<< Updated upstream
  
=======
>>>>>>> Stashed changes
  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() body: UpdateEmpleadoDto) {
    const requestData: EmpleadoEditRequest = body;

<<<<<<< Updated upstream
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

=======
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
>>>>>>> Stashed changes

  @Delete(':id')
  @UsePipes(new ValidationPipe())
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}
