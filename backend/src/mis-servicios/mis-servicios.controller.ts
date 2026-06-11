import { Controller, Get, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
  
import { MisServiciosService } from './mis-servicios.service';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import type { AuthenticatedRequest } from 'src/request/AuthenticatedRequest';


@Controller('mis-servicios')
export class MisServiciosController {
  constructor(private readonly misServiciosService: MisServiciosService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  async obtenerServiciosResidente(@Req() req: AuthenticatedRequest) {
    const idUsuario = req.user.userId;

    return await this.misServiciosService.obtenerMisServicios(idUsuario);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  @UseInterceptors(FileInterceptor('foto'))
  async crearServicioResidente(
    @Req() req: AuthenticatedRequest,
    @Body() body: any,
    @UploadedFile() foto?: Express.Multer.File
  ) {
    const idUsuario = req.user.userId;

    return await this.misServiciosService.crearServicio(idUsuario, body, foto);
  }
}