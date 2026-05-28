import { Body, Controller, Get, Req, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import type { AuthenticatedRequest } from 'src/request/AuthenticatedRequest';
import { PerfilService } from './perfil.service';

@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente', 'Guardia', 'Administrador')
  async obtenerMiPerfil(@Req() req: AuthenticatedRequest) {
    const id_usuario = req.user.userId;

    return this.perfilService.obtenerMiPerfil(id_usuario);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente', 'Guardia', 'Administrador')
  async actualizarMiPerfil(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdatePerfilDto,
  ) {
    const id_usuario = req.user.userId;

    return this.perfilService.actualizarMiPerfil(id_usuario, body);
  }
  
}

