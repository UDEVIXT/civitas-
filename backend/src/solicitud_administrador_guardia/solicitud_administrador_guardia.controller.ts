import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { SolicitudAdministradorGuardiaService } from './solicitud_administrador_guardia.service';
import { CreateSolicitudAdministradorGuardiaDto } from './dto/create-solicitud_administrador_guardia.dto';
import { UpdateSolicitudAdministradorGuardiaDto } from './dto/update-solicitud_administrador_guardia.dto';

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

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudAdministradorGuardiaService.findOne(id);
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