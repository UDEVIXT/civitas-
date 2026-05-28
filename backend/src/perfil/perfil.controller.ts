import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
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
}