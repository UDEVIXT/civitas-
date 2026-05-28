import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { AccesosServiciosService } from './accesos-servicios.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Request } from 'express';

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
    const id_user = req.user.userId;
    //console.log("ID del usuario autenticado:", id_user);
    return await this.accesosServiciosService.obtenerActividadReciente(Number(limit));
  }

  @Get('escanear/:codigoQr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia')
  async escanearQr(@Param('codigoQr') codigoQr: string) {
    return {
      success: true,
      data: await this.accesosServiciosService.obtenerDatosPorQr(codigoQr),
    };
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
}
