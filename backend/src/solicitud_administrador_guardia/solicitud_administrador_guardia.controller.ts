import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { SolicitudAdministradorGuardiaService } from './solicitud_administrador_guardia.service';
import { CreateSolicitudAdministradorGuardiaDto } from './dto/create-solicitud_administrador_guardia.dto';
import { UpdateSolicitudAdministradorGuardiaDto } from './dto/update-solicitud_administrador_guardia.dto';
import { AprobarMasivoDto } from './dto/aprobar-masivo.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Administrador')
@Controller('solicitud-administrador-guardia')
export class SolicitudAdministradorGuardiaController {
  constructor(private readonly solicitudAdministradorGuardiaService: SolicitudAdministradorGuardiaService) {}

  @Post()
  create(@Body() createSolicitudAdministradorGuardiaDto: CreateSolicitudAdministradorGuardiaDto) {
    return this.solicitudAdministradorGuardiaService.create(createSolicitudAdministradorGuardiaDto);
  }

  @Get()
  findAll() {
    return this.solicitudAdministradorGuardiaService.findAll();
  }

  @Patch('aprobar-masivo')
  aprobarMasivo(@Body() aprobarMasivoDto: AprobarMasivoDto) {
    return this.solicitudAdministradorGuardiaService.aprobarMasivo(aprobarMasivoDto.ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudAdministradorGuardiaService.findOne(id);
  }

  // Streaming protegido de la credencial INE: la URL real en R2 nunca se expone al cliente.
  @Get(':id/credencial/:lado')
  async obtenerCredencial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lado') lado: string,
    @Res() res: Response,
  ) {
    if (lado !== 'frente' && lado !== 'reverso') {
      throw new BadRequestException('El lado de la credencial debe ser "frente" o "reverso".');
    }
    await this.solicitudAdministradorGuardiaService.obtenerImagenCredencial(id, lado, res);
  }

  @Patch(':id/aprobar')
  aprobar(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudAdministradorGuardiaService.aprobar(id);
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudAdministradorGuardiaService.rechazar(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSolicitudAdministradorGuardiaDto: UpdateSolicitudAdministradorGuardiaDto
  ) {
    return this.solicitudAdministradorGuardiaService.update(id, updateSolicitudAdministradorGuardiaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudAdministradorGuardiaService.remove(id);
  }
}