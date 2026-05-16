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

// Importamos tu servicio especializado de la carpeta mis-empleados
import { EmpleadoService } from './mi-empleado.service';

@Controller('mi-empleado') // 1. Cambiado para que sea tu endpoint exclusivo
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

    // 1. Declaramos las variables correctamente aquí arriba como strings
    const byResidenteIdValue = byResidenteId || undefined;
    const byViviendaIdValue = byViviendaId || undefined;

    // 2. Pasamos solo las propiedades y sus valores dentro del objeto
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
  async update(
    @Param('id') id: string,
    @Body() body: { accion?: string; data?: any; activo?: boolean; motivo?: string },
  ) {
    const { accion, data, activo, motivo } = body;

    // ESCENARIO A: Tu actualización personalizada desde el modal del residente
    if (accion === 'actualizacion_residente') {
      if (!data || !data.nombre) {
        throw new BadRequestException('El nombre del empleado es obligatorio para actualizar');
      }
      // Llamamos al servicio pasando los datos estructurados del modal
      return this.empleadoService.actualizarEmpleado(id, data);
    }

    // ESCENARIO B: Cambio de estado rápido (Baja / Reactivación tradicional)
    if (activo !== undefined) {
      if (activo === false) {
        if (!motivo || !motivo.trim()) {
          throw new BadRequestException('El motivo de la baja es requerido');
        }
        return this.empleadoService.eliminarEmpleado(id, motivo);
      }
      return this.empleadoService.reactivarEmpleado(id);
    }

    // Si no entra en ninguna condición válida
    throw new BadRequestException('Petición no reconocida. Verifica los parámetros enviados.');
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}