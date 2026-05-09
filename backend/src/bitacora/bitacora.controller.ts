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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Guardia', 'Residente', 'Administrador')
  @Get()
  async getBitacora(
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('residencia') residencia?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
    @Query('ordenar') ordenar?: string,
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
      page: Number(page),
      limit: Number(limit),
    });

    return {
      success: true,
      ...data,
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
  @Patch(':id_bitacora/salida')
  async registrarSalida(
    @Param('id_bitacora') id_bitacora: string,
    @Body() createBitacoraDto: CreateBitacoraDto,
  ) {
    const { id_guardia, comentario_salida } = createBitacoraDto;

    const resultado = await this.bitacoraService.registrarSalida(
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
