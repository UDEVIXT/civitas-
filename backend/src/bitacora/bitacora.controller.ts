import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Sse,
  MessageEvent,
  Query,
} from '@nestjs/common';

import { BitacoraService } from './bitacora.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';

import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
