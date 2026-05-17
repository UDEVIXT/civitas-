import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Sse,
  MessageEvent,
  Query,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';

import { BitacoraService } from './bitacora.service';

import { Subject, Observable } from 'rxjs';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

const bitacoraUpdates$ = new Subject<any>();

@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  // ---------------------------------------------------------
  // SSE
  // ---------------------------------------------------------
  @Sse('updates')
  sse(): Observable<MessageEvent> {
    return bitacoraUpdates$.asObservable().pipe(
      map((data) => ({
        data,
      })),
    );
  }

  // ---------------------------------------------------------
  // GET MI BITACORA (Residente específico)
  // ---------------------------------------------------------
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('Residente')
  @Get('mi-bitacora')
  async obtenerMiBitacora(
    @Query('residentUserId') residentUserId?: string,
    @Query('search') search?: string,
    @Query('personType') personType?: 'visitante' | 'empleado' | 'proveedor',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const data = await this.bitacoraService.obtenerMiBitacora({
      residentUserId: residentUserId || '',
      search,
      personType,
      dateFrom,
      dateTo,
      sort: sort || 'desc',
      page: Number(page),
      limit: Number(limit),
    });

    return {
      success: true,
      ...data,
    };
  }

  // ---------------------------------------------------------
  // GET BITACORA
  // ---------------------------------------------------------
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Administrador', 'Guardia', 'Residente')
  async getBitacora(
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('residencia') residencia?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
    @Query('ordenar') ordenar?: string,
    @Query('estado') estado?: 'dentro' | 'fuera' | 'todos',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const data = await this.bitacoraService.obtenerBitacora({
      search,
      tipo,
      residencia,
      fecha_inicio,
      fecha_fin,
      ordenar,
      estado,
      page: Number(page),
      limit: Number(limit),
    });

    return {
      success: true,
      data: data.data,

      meta: data.meta,
    };
  }

  // ---------------------------------------------------------
  // GET ID DETALLE REGISTRO
  // ---------------------------------------------------------
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Administrador', 'Guardia', 'Residente')
  async obtenerDetalleRegistro(@Param('id') id: string) {
    const result = await this.bitacoraService.obtenerDetalleRegistro(id);
    return {
      success: true,
      data: result,
    };
  }

  // ---------------------------------------------------------
  // ACTUALIZAR FRECUENCIA
  // ---------------------------------------------------------
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Residente')
  @Patch(':id/frecuencia')
  async actualizarFrecuencia(
    @Param('id') id: string,
    @Body() body: { es_frecuente: boolean },
  ) {
    const result = await this.bitacoraService.actualizarFrecuenciaVisitante(
      id,
      body.es_frecuente,
    );

    return {
      success: true,
      message: 'Frecuencia actualizada correctamente',
      data: result,
    };
  }

  // ---------------------------------------------------------
  // REGISTRAR SALIDA A -> (Todos) POR ROL (GUARDIA)
  // ---------------------------------------------------------
  @Patch('registrar-salida')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async registrarSalida(
    @Body()
    dto: {
      id_bitacora?: string | string[];
      comentario_salida?: string;
    },

    @Req() req: any,
  ) {
    const { id_bitacora, comentario_salida } = dto;

    const id_guardia = req.user.userId;
    //console.log('ID GUARDIA DESDE TOKEN:', id_guardia, 'ID_BITACORA:', id_bitacora, 'COMENTARIO_SALIDA:', comentario_salida);
    if (
      !id_bitacora ||
      (Array.isArray(id_bitacora) && id_bitacora.length === 0)
    ) {
      throw new BadRequestException(
        'Debes proporcionar al menos un ID de bitácora.',
      );
    }

    const resultado = await this.bitacoraService.registrarSalida(
      id_bitacora,
      id_guardia,
      comentario_salida,
    );

    const idsProcesados = Array.isArray(id_bitacora)
      ? id_bitacora
      : [id_bitacora];

    bitacoraUpdates$.next({
      tipo_evento: 'PROVEEDOR_SALIDA',
      ids_afectados: idsProcesados,
      mensaje:
        idsProcesados.length > 1
          ? `${idsProcesados.length} salidas registradas masivamente`
          : `Salida registrada para el registro ${idsProcesados[0]}`,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Operación realizada con éxito',
      ...resultado,
    };
  }
}
