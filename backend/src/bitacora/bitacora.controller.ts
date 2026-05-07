import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const bitacoraUpdates$ = new Subject<any>();

@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @Sse('updates')
  sse(): Observable<MessageEvent> {
    return bitacoraUpdates$.asObservable().pipe(
      map((data) => ({
        data: data,
      })),
    );
  }

  @Get('proveedores-activos')
  async getProveedoresActivos() {
    const data = await this.bitacoraService.obtenerProveedoresActivos();
    return {
      success: true,
      data,
    };
  }

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
