import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MisServiciosService } from './mis-servicios.service';

@Controller('mis-servicios')
export class MisServiciosController {
  constructor(private readonly misServiciosService: MisServiciosService) {}

  @Get()
  async obtenerServiciosResidente(@Req() req: any) {
    // 👈 2. DINÁMICO: Sacamos el ID real del usuario directamente desde el Token encriptado
    const idUsuario = req.user.id_usuario; 
    
    return await this.misServiciosService.obtenerMisServicios(idUsuario);
  }
}