import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
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

  @Get('actividad-reciente')
  async obtenerActividadReciente() {
    return {
      success: true,
      data: await this.accesosServiciosService.obtenerActividadReciente(),
    };
  }

  @Get(':id')
  async obtenerDetalleServicio(@Param('id') id: string) {
    return {
      success: true,
      data: await this.accesosServiciosService.obtenerDetalleServicio(id),
    };
  }

  @Post(':id/validar')
  async validarAcceso(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const idGuardia = req.user.userId;
    return {
      success: true,
      data: await this.accesosServiciosService.validarAcceso(id, idGuardia),
    };
  }

  @Post(':id/denegar')
  async denegarAcceso(@Param('id') id: string, @Body() body: { motivo: string }, @Req() req: AuthenticatedRequest) {
    const idGuardia = req.user.userId;
    return {
      success: true,
      data: await this.accesosServiciosService.denegarAcceso(id, idGuardia, body.motivo),
    };
  }
}
