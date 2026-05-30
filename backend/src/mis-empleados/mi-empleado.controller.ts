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
  Req,
} from '@nestjs/common';

// Importamos tu servicio especializado de la carpeta mis-empleados
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { EmpleadoService } from './mi-empleado.service';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { use } from 'passport';
import type { AuthenticatedRequest } from 'src/request/AuthenticatedRequest';

@Controller('mi-empleado') // 1. Cambiado para que sea tu endpoint exclusivo
export class EmpleadoController {
  constructor(private empleadoService: EmpleadoService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
    @Query('isActive') isActive?: string,
    @Query('byViviendaId') byViviendaId?: string,
  ) {
    /*console.log("REQ:", req);
    console.log("USER:", req.user);*/
    const id_user = req.user.userId;
    //console.log(id_user);
    const isActiveValue = isActive?.toLowerCase();
    const isActiveBool =
      isActiveValue === 'true'
        ? true
        : isActiveValue === 'false'
          ? false
          : undefined;

    // 1. Declaramos las variables correctamente aquí arriba como strings
    //const byResidenteIdValue = id_user|| undefined;
    const byViviendaIdValue = byViviendaId || undefined;

    // 2. Pasamos solo las propiedades y sus valores dentro del objeto
    return this.empleadoService.obtenerEmpleados({
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      isActive: isActiveBool,
      byUsuarioId: id_user,
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
    @Body()
    body: {
      accion?: string;
      data?: any;
      activo?: boolean;
      motivo?: string;
      id_residente?: string;
    },
  ) {
    console.log("BODY COMPLETO EN CONTROLLER:", body);
    console.log("DATA EN CONTROLLER:", body.data);
    const { accion, data } = body;
    // Soporte para peticiones donde los datos vienen en la raíz o dentro del objeto 'data'
    const activo = body.activo !== undefined ? body.activo : data?.activo;
    const motivo = body.motivo !== undefined ? body.motivo : data?.motivo;
    const id_residente =
      body.id_residente !== undefined ? body.id_residente : data?.id_residente;

    // ESCENARIO A: Tu actualización personalizada desde el modal del residente
    if (accion === 'actualizacion_residente') {
      if (!data || !data.nombre) {
        throw new BadRequestException(
          'El nombre del empleado es obligatorio para actualizar',
        );
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
        return this.empleadoService.eliminarEmpleado(id, motivo, id_residente);
      }
      return this.empleadoService.reactivarEmpleado(id, id_residente);
    }

    // Si no entra en ninguna condición válida
    throw new BadRequestException(
      'Petición no reconocida. Verifica los parámetros enviados.',
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}
