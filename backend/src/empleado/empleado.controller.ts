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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';

//Services
import { EmpleadoService } from './empleado.service';

//DTOs
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { CreateEmpleadoDomesticoDto } from './dto/create-empleado-domestico.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from 'src/request/AuthenticatedRequest';

//types
import { EmpleadoEditRequest } from './types';

@Controller('empleado')
export class EmpleadoController {
  constructor(private empleadoService: EmpleadoService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Administrador', 'Residente')
  async findAll(
    @Req() req: AuthenticatedRequest,
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

    const esResidente = req.user?.role === 'Residente';

    return this.empleadoService.obtenerEmpleados({
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      isActive: isActiveBool,
      byResidenteId: esResidente ? undefined : byResidenteId || undefined,
      byViviendaId: byViviendaId || undefined,
      idUsuarioActivo: esResidente ? req.user.userId : undefined,
    });
  }
  // =========================================================================
  // HU-1.5.5: Ruta para que el Guardia consulte la lista de autorizados
  // =========================================================================
  @Get('lista-guardia')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia') // Restringido únicamente para Guardias (CA001)
  async findEmpleadosParaGuardia(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('idVivienda') idVivienda?: string,
  ) {
    return this.empleadoService.obtenerEmpleadosParaGuardia({
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      idVivienda,
    });
  }

  @Get('viviendas-con-empleados')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async getViviendasConEmpleados() {
    return this.empleadoService.obtenerViviendasConEmpleados();
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
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('foto_empleado'))
  async createEmpleadoDomestico(
    @Body() body: CreateEmpleadoDomesticoDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
      file?: Express.Multer.File,
  ) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new BadRequestException(
        'No se pudo identificar al usuario en la sesión actual.',
      );
    }

    return this.empleadoService.crearEmpleadoDomestico(
      body,
      String(userId),
      file,
    );
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
  // =========================================================================
  // HU-1.11.4: Registrar la entrada permitida por el Guardia (CA003)
  // =========================================================================
  @Post(':id_acceso/aceptar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia') // CA001 y CA009: Solo accesible para Guardias en sesión válida
  async aceptarAcceso(
    @Param('id_acceso') id_acceso: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const idUsuarioGuardia = req.user?.userId;

    if (!idUsuarioGuardia) {
      throw new BadRequestException(
        'No se pudo identificar al guardia en la sesión actual.',
      );
    }

    return this.empleadoService.aceptarAccesoVisitante(
      id_acceso, 
      String(idUsuarioGuardia)
    );
  }

  // =========================================================================
  // HU-1.11.4: Registrar el rechazo de acceso con su motivo (CA004)
  // =========================================================================
  @Post(':id_acceso/rechazar')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia') // CA001 y CA009: Protegido por roles
  async rechazarAcceso(
    @Param('id_acceso') id_acceso: string,
    @Body('motivo') motivo: string, // Recibe el texto directo desde el JSON del body
    @Req() req: AuthenticatedRequest,
  ) {
    const idUsuarioGuardia = req.user?.userId;

    if (!idUsuarioGuardia) {
      throw new BadRequestException(
        'No se pudo identificar al guardia en la sesión actual.',
      );
    }

    return this.empleadoService.rechazarAccesoVisitante(
      id_acceso,
      String(idUsuarioGuardia),
      motivo
    );
  }
}
