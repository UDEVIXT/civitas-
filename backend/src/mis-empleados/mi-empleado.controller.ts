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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

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
@UseInterceptors(FileInterceptor('foto_empleado'))
async update(
  @Param('id') id: string,
  @Body() body: any = {},
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
        new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
      ],
      fileIsRequired: false,
    }),
  )
  file?: Express.Multer.File,
) {
  console.log('🔥 ENTRÓ AL PUT /mi-empleado/:id');
  console.log('ID:', id);
  console.log('BODY COMPLETO EN CONTROLLER:', body);
  console.log('FILE EN CONTROLLER:', file?.originalname);

  const accion = body.accion;

  const dataRecibida = body.data ?? body;

  if (accion === 'actualizacion_residente') {
    const diasAutorizados =
      typeof dataRecibida.dias_autorizados === 'string'
        ? JSON.parse(dataRecibida.dias_autorizados)
        : dataRecibida.dias_autorizados || [];

    const data = {
      nombre: dataRecibida.nombre,
      telefono: dataRecibida.telefono,
      cargo: dataRecibida.cargo,
      notas_adicionales: dataRecibida.notas_adicionales,
      hora_entrada: dataRecibida.hora_entrada,
      hora_salida: dataRecibida.hora_salida,
      dias_autorizados: diasAutorizados,
    };

    if (!data.nombre) {
      throw new BadRequestException(
        'El nombre del empleado es obligatorio para actualizar',
      );
    }

    return this.empleadoService.actualizarEmpleado(id, data, file);
  }

  const activo = body.activo !== undefined ? body.activo : dataRecibida.activo;
  const motivo = body.motivo !== undefined ? body.motivo : dataRecibida.motivo;
  const id_residente =
    body.id_residente !== undefined
      ? body.id_residente
      : dataRecibida.id_residente;

  if (activo !== undefined) {
    const activoBool = activo === true || activo === 'true';

    if (activoBool === false) {
      if (!motivo || !motivo.trim()) {
        throw new BadRequestException('El motivo de la baja es requerido');
      }

      return this.empleadoService.eliminarEmpleado(id, motivo, id_residente);
    }

    return this.empleadoService.reactivarEmpleado(id, id_residente);
  }

  throw new BadRequestException(
    'Petición no reconocida. Verifica los parámetros enviados.',
  );
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoService.eliminarEmpleado(id);
  }
}
