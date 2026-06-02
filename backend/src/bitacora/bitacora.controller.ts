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
import type { Request, Response } from 'express';

import { BitacoraService } from './bitacora.service';

import { Subject, Observable } from 'rxjs';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { map } from 'rxjs/operators';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    role: 'Administrador' | 'Guardia' | 'Residente';
  };
  // Nest's underlying request may expose the response on `req.res` for SSE cleanup
  res?: Response;
}

interface BitacoraSseEvent {
  tipo_evento: string;
  ids_afectados: string[];
  mensaje: string;
  comentario_salida?: string;
  guardia_salida?: string;
  timestamp: Date;
}

interface RegistrarSalidaDto {
  id_bitacora?: string | string[];
  comentario_salida?: string;
}

interface DesactivarQrDto {
  codigo_qr: string;
  motivo: string; //CA008
}

const bitacoraUpdates$ = new Subject<BitacoraSseEvent>();

// Subjects por usuario (username) para enviar eventos SSE sólo a los
// residentes que estén suscritos.
const userSseSubjects = new Map<string, Subject<BitacoraSseEvent>>();

@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  // ---------------------------------------------------------
  // SSE
  // ---------------------------------------------------------
  @Sse('updates')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente', 'Guardia')
  sse(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
    const username = req.user?.username ?? '';

    let subj = userSseSubjects.get(username);
    if (!subj) {
      subj = new Subject<BitacoraSseEvent>();
      userSseSubjects.set(username, subj);
    }

    // Cleanup cuando el cliente cierra la conexión
    const res = req.res;
    if (res && typeof res.on === 'function') {
      res.on('close', () => {
        subj?.complete();
        userSseSubjects.delete(username);
      });
    }

    return subj.asObservable().pipe(map((data) => ({ data })));
  }

  // ---------------------------------------------------------
  // GET MI BITACORA (Residente específico)
  // ---------------------------------------------------------
  @Get('mi-bitacora')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  async obtenerMiBitacora(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('personType') personType?: 'visitante' | 'empleado' | 'proveedor',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const residentUserId = req.user?.username;

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
  @Roles('Administrador', 'Guardia')
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
  async obtenerDetalleRegistro(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.bitacoraService.obtenerDetalleRegistro(
      id,
      req.user,
    );
    return {
      success: true,
      data: result,
    };
  }

  // ---------------------------------------------------------
  // ACTUALIZAR FRECUENCIA
  // ---------------------------------------------------------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  @Patch(':id/frecuencia')
  async actualizarFrecuencia(
    @Param('id') id: string,
    @Body() body: { es_frecuente: boolean },
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.bitacoraService.actualizarFrecuenciaVisitante(
      id,
      body.es_frecuente,
      req.user,
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
    @Body() dto: RegistrarSalidaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { id_bitacora, comentario_salida } = dto;
    //Id de guardia de salida
    const id_guardia = req.user.userId;
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
      comentario_salida,
      guardia_salida: resultado.guardia_salida,
      timestamp: new Date(),
    });

    // Notificar sólo a los residentes afectados por estos IDs
    try {
      const residentUsernames =
        await this.bitacoraService.getResidentUsernamesForRegistroIds(
          idsProcesados,
        );

      const evento: BitacoraSseEvent = {
        tipo_evento: 'SALIDA_REGISTRO',
        ids_afectados: idsProcesados,
        mensaje:
          idsProcesados.length > 1
            ? `${idsProcesados.length} salidas registradas masivamente`
            : `Salida registrada para el registro ${idsProcesados[0]}`,
        timestamp: new Date(),
      };

      for (const u of residentUsernames) {
        const s = userSseSubjects.get(u);
        if (s) s.next(evento);
      }
    } catch {
      // No bloqueamos la respuesta si la notificación falla, sólo registramos.
    }

    return {
      success: true,
      message: 'Salida registrada correctamente',
      data: resultado,
    };
  }

  // ---------------------------------------------------------
  // DESACTIVAR CÓDIGO QR (SÓLO GUARDIA)
  // ---------------------------------------------------------
  @Patch('desactivar-qr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async desactivarQr(
    @Body() dto: DesactivarQrDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { codigo_qr, motivo } = dto;
    const id_usuario = req.user.userId; // El ID de usuario del guardia que escanea

    if (!codigo_qr) {
      throw new BadRequestException(
        'El código QR es requerido para desactivarlo.', //CA004
      );
    }
    const resultado = await this.bitacoraService.desactivarQr(
      codigo_qr,
      id_usuario,
      motivo,
    );

    return {
      success: true,
      message: 'El código QR ha sido desactivado e historiado correctamente.',
      data: resultado,
    };
  }
}
