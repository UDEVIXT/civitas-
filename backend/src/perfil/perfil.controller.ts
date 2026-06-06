import { Body, Controller, Get, Req, Put, UseGuards, Query, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import type { AuthenticatedRequest } from 'src/request/AuthenticatedRequest';
import { PerfilService } from './perfil.service';
import type { Response } from 'express';

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

  @Put('cambiar-contrasena')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente', 'Guardia', 'Administrador')
  async cambiarContrasena(
    @Req() req: AuthenticatedRequest,
    @Body() body: { contrasena_actual: string; nueva_contrasena: string },
  ) {
    const id_usuario = req.user.userId;

    return this.perfilService.cambiarContrasena(id_usuario, body);
  }
 
  @Put('cambiar-correo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente', 'Guardia', 'Administrador')
  async cambiarCorreo(
    @Req() req: AuthenticatedRequest,
    @Body() body: { nuevoCorreo: string },
  ) {
    const id_usuario = req.user.userId;

    return this.perfilService.solicitarCambioCorreo(
      id_usuario,
      body,
    );
  }

  @Get('confirmar-correo')
  async confirmarCambioCorreo(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      await this.perfilService.confirmarCambioCorreo(token);

      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Correo verificado</title>
            <style>
              body {
                font-family: Arial;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #f5f5f5;
              }
              .box {
                text-align: center;
                padding: 30px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>Correo verificado ✅</h1>
              <p>Su correo ha sido verificado correctamente.</p>
              <p>Puede cerrar esta página.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      return res.status(400).send(`
        <h1>Error al verificar el correo</h1>
        <p>${error.message}</p>
      `);
    }
  }
}

