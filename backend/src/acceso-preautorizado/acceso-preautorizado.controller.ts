import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccesoPreautorizadoService } from './acceso-preautorizado.service';
import { CreateAccesoPreautorizadoDto } from './dto/create-acceso-preautorizado.dto';
import { UpdateAccesoPreautorizadoDto } from './dto/update-acceso-preautorizado.dto';

@Controller('acceso-preautorizado')
export class AccesoPreautorizadoController {
  constructor(private readonly accesoPreautorizadoService: AccesoPreautorizadoService) {}

  @Post()
  create(@Body() createAccesoPreautorizadoDto: CreateAccesoPreautorizadoDto) {
    return this.accesoPreautorizadoService.create(createAccesoPreautorizadoDto);
  }

  @Get()
  async findAll() {
    return await this.accesoPreautorizadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accesoPreautorizadoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccesoPreautorizadoDto: UpdateAccesoPreautorizadoDto) {
    return this.accesoPreautorizadoService.update(id, updateAccesoPreautorizadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accesoPreautorizadoService.remove(id);
  }
}