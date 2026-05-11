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
  // GET BITACORA
  // ---------------------------------------------------------
  //@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Guardia', 'Residente', 'Administrador')
  @Get()
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Guardia', 'Residente', 'Administrador')
  @Get(':id')
  async obtenerDetalleRegistro(@Param('id') id: string) {
    const result = await this.bitacoraService.obtenerDetalleRegistro(id);
    return {
      success: true,
      data: result,
    };
  }

  // ---------------------------------------------------------
  // REGISTRAR SALIDA A -> (Todos) POR ROL (GUARDIA)
  // ---------------------------------------------------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Guardia')
  @Patch('registrar-salida')
  async registrarSalida(
    @Body()
    dto: {
      id_bitacora?: string | string[];
      id_guardia: string;
      comentario_salida?: string;
    },
  ) {
    const { id_bitacora, id_guardia, comentario_salida } = dto;

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

    const idsProcesados = Array.isArray(id_bitacora) ? id_bitacora : [id_bitacora];
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
