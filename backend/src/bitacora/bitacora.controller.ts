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
  Req,
} from '@nestjs/common';

import { BitacoraService } from './bitacora.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';

import { Subject, Observable } from 'rxjs';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

const bitacoraUpdates$ = new Subject<any>();

@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  private resolveResidentUserId(
    request: { headers?: Record<string, unknown>; user?: Record<string, unknown> },
    residentUserIdFromQuery?: string,
  ) {
    const userIdFromRequest =
      typeof request.user?.id_usuario === 'string'
        ? request.user.id_usuario
        : undefined;

    const userIdFromHeader =
      typeof request.headers?.['x-resident-user-id'] === 'string'
        ? request.headers['x-resident-user-id']
        : undefined;

    return userIdFromRequest ?? residentUserIdFromQuery ?? userIdFromHeader;
  }

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

  @Get('mi-bitacora')
  async getMiBitacora(
    @Req() req: { headers?: Record<string, unknown>; user?: Record<string, unknown> },
    @Query('residentUserId') residentUserId?: string,
    @Query('residentName') residentName?: string,
    @Query('search') search?: string,
    @Query('personType') personType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const resolvedResidentUserId = this.resolveResidentUserId(
      req,
      residentUserId,
    );

    const data = await this.bitacoraService.obtenerMiBitacora({
      residentUserId: resolvedResidentUserId,
      residentName,
      search,
      personType,
      dateFrom,
      dateTo,
      sort,
      page: Number(page),
      limit: Number(limit),
    });

    return {
      success: true,
      ...data,
    };
  }

  @Get('mi-bitacora/:id_bitacora')
  async getDetalleMiBitacora(
    @Req() req: { headers?: Record<string, unknown>; user?: Record<string, unknown> },
    @Param('id_bitacora') id_bitacora: string,
    @Query('residentUserId') residentUserId?: string,
    @Query('residentName') residentName?: string,
  ) {
    const resolvedResidentUserId = this.resolveResidentUserId(
      req,
      residentUserId,
    );

    const data = await this.bitacoraService.obtenerDetalleMiBitacora(
      id_bitacora,
      resolvedResidentUserId,
      residentName,
    );

    return {
      success: true,
      data,
    };
  }

  // ---------------------------------------------------------
  // CA012: Actualizar Frecuencia de Visitante
  // ---------------------------------------------------------
  @Patch('mi-bitacora/:id_bitacora/frecuencia')
  async actualizarFrecuencia(
    @Body() body: { es_frecuente: boolean },
    @Req() req: { headers?: Record<string, unknown>; user?: Record<string, unknown> },
    @Param('id_bitacora') id_bitacora: string,
    @Query('residentUserId') residentUserId?: string,
    @Query('residentName') residentName?: string,
  ) {
    const resolvedResidentUserId = this.resolveResidentUserId(
      req,
      residentUserId,
    );

    const resultado = await this.bitacoraService.actualizarFrecuenciaVisitante(
      id_bitacora,
      body.es_frecuente,
      resolvedResidentUserId,
      residentName,
    );

    bitacoraUpdates$.next({
      tipo_evento: 'FRECUENCIA_ACTUALIZADA',
      id_bitacora,
      es_frecuente: body.es_frecuente,
      timestamp: new Date().toISOString(),
      mensaje: resultado.message,
    });

    return {
      success: true,
      ...resultado,
    };
  }

  // ---------------------------------------------------------
  // GET BITACORA
  // ---------------------------------------------------------
  @Get()
  async getBitacora(
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const data = await this.bitacoraService.obtenerProveedoresActivos({
      search,
      tipo,
      page: Number(page),
      limit: Number(limit),
    });

    return {
      success: true,
      ...data,
    };
  }

  // ---------------------------------------------------------
  // REGISTRAR SALIDA
  // ---------------------------------------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Guardia')
  @Patch('proveedores/:id_bitacora/salida')
  async registrarSalida(
    @Param('id_bitacora') id_bitacora: string,
    @Body() createBitacoraDto: CreateBitacoraDto,
  ) {
    const { id_guardia, comentario_salida } = createBitacoraDto;

    const resultado = await this.bitacoraService.registrarSalidaProveedor(
      id_bitacora,
      id_guardia,
      comentario_salida,
    );

    // SSE EVENT
    bitacoraUpdates$.next({
      tipo_evento: 'PROVEEDOR_SALIDA',
      id_bitacora: resultado.id_bitacora,
      fecha: resultado.fecha_hora_salida,
      mensaje: `Salida registrada para el registro ${id_bitacora}`,
    });

    return {
      success: true,
      message: 'Salida registrada correctamente',
      data: resultado,
    };
  }
}
