import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BitacoraGuardiaService } from './bitacora-guardia.service';
import { BitacoraFiltroDto } from './dto/bitacora-filtro.dto';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@Controller('bitacora-guardia')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Guardia', 'Admin', 'Administrador')
export class BitacoraGuardiaController {
  constructor(
    private readonly bitacoraGuardiaService: BitacoraGuardiaService,
  ) {}

  @Get()
  async obtenerBitacoraHistorica(@Query() filtros: BitacoraFiltroDto) {
    const result =
      await this.bitacoraGuardiaService.obtenerBitacoraHistorica(filtros);

    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  async obtenerDetalleRegistro(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.bitacoraGuardiaService.obtenerDetalleRegistro(id);

    return {
      success: true,
      data: result,
    };
  }
}
