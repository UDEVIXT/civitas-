import { Controller, Get, Post, Body, Param, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { AccesosServiciosService } from './accesos-servicios.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Request } from 'express';
import { RegistroManualDto } from './dto/registro-manual.dto';
import { obtenerIdDesdeUrlQr } from '../common/utils/qr-utils';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    role: 'Administrador' | 'Guardia' | 'Residente';
  };
}

@Controller('accesos-servicios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Guardia', 'Administrador')
export class AccesosServiciosController {
  constructor(private readonly accesosServiciosService: AccesosServiciosService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async obtenerActividadReciente(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit = '5',
  ) {
    return await this.accesosServiciosService.obtenerActividadReciente(
      Number(limit),
    );
  }

  @Get('escanear/:codigoQr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async escanearQr(@Param('codigoQr') codigoQr: string) {
    try {
      let idLimpioQr = codigoQr;

      // Si parece una URL, intentamos extraer el ID; si no, asumimos que es el UUID directo.
      if (codigoQr.startsWith('http') || codigoQr.includes('%3A%2F%2F')) {
        idLimpioQr = await obtenerIdDesdeUrlQr(codigoQr);
      }

      return {
        success: true,
        data: await this.accesosServiciosService.obtenerDatosPorQr(idLimpioQr),
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error interno al procesar el código QR.',
      );
    }
  }

  @Get(':id')
  async obtenerDetalleServicio(@Param('id') id: string) {
    return {
      success: true,
      data: await this.accesosServiciosService.obtenerDetalleServicio(id),
    };
  }

  @Get('validar/:codigoQr')
  async validarAcceso(
    @Param('codigoQr') codigoQr: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const idGuardia = req.user.userId;
    return {
      success: true,
      data: await this.accesosServiciosService.validarAcceso(
        codigoQr,
        idGuardia,
      ),
    };
  }

  @Post('denegar/:codigoQr')
  async denegarAcceso(
    @Param('codigoQr') codigoQr: string,
    @Body() body: { motivo: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const idGuardia =
      req.user.userId;

    return {
      success: true,

      data:
        await this.accesosServiciosService
          .denegarAcceso(
            codigoQr,
            idGuardia,
            body.motivo,
          ),
    };
  }

  @Post('registro-manual')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async registrarIngresoManual(
    @Req() req: AuthenticatedRequest,
    @Body() body: RegistroManualDto,
  ) {
    const idGuardia = req.user.userId;
    
    return {
      success: true,
      data: await this.accesosServiciosService.registrarIngresoManual(
        body,
        idGuardia,
      ),
    };
  }
}
