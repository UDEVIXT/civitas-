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
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';

//Services
import { EmpleadoService } from './empleado.service';

//DTOs
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateEmpleadoDomesticoDto } from './dto/create-empleado-domestico.dto';

//types
import { EmpleadoEditRequest } from './types';

@Controller('empleado')
export class EmpleadoController {
  constructor(private empleadoService: EmpleadoService) {}

 @Get()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Administrador', 'Residente') // 1. Permitimos acceso al residente
async findAll(
  @Req() req, // 2. Inyectamos la request para leer al usuario logueado
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

  // 3. Determinamos si quien llama es el residente
  const esResidente = req.user?.role === 'Residente';

  return this.empleadoService.obtenerEmpleados({
    search,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    isActive: isActiveBool,
    // Si es residente, ignoramos el query de la URL por seguridad.
    byResidenteId: esResidente ? undefined : (byResidenteId || undefined),
    byViviendaId: byViviendaId || undefined,
    // Pasamos el ID real de su sesión al servicio para que este lo resuelva
    idUsuarioActivo: esResidente ? req.user.id_usuario : undefined, 
  });
}
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Administrador')
  findOne(@Param('id') id: string) {
    return { message: `Empleado ${id}` };
  }
  @Post('empleado-domestico')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  @UsePipes(new ValidationPipe())
  async createEmpleadoDomestico(
    @Body() body: CreateEmpleadoDomesticoDto,
    @Req() req,
  ) {
    // Normalizamos la extracción del ID desde el payload JWT
    // El JwtStrategy devuelve `userId` en `req.user` (payload.sub)
    const userId = req.user?.userId || req.user?.id || req.user?.id_usuario || req.user?.sub;

    if (!userId) {
      throw new BadRequestException('No se pudo identificar al usuario en la sesión actual.');
    }

    return this.empleadoService.crearEmpleadoDomestico(body, String(userId));
  }
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Administrador')
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Administrador')
  @UsePipes(new ValidationPipe())
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}
