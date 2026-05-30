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
import { SolicitudCambioRolService } from './solicitud_cambio_rol.service';
import { CreateSolicitudCambioRolDto } from './dto/create-solicitud_cambio_rol.dto';
import { UpdateSolicitudCambioRolDto } from './dto/update-solicitud_cambio_rol.dto';

@Controller('solicitud-cambio-rol')
export class SolicitudCambioRolController {
  constructor(private readonly solicitudCambioRolService: SolicitudCambioRolService) {}

  @Post()
  create(@Body() createSolicitudCambioRolDto: CreateSolicitudCambioRolDto) {
    return this.solicitudCambioRolService.create(createSolicitudCambioRolDto);
  }

  @Get()
  findAll() {
    return this.solicitudCambioRolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudCambioRolService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateSolicitudCambioRolDto: UpdateSolicitudCambioRolDto
  ) {
    return this.solicitudCambioRolService.update(id, updateSolicitudCambioRolDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudCambioRolService.remove(id);
  }
}