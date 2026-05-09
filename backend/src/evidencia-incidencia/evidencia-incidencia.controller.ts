import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvidenciaIncidenciaService } from './evidencia-incidencia.service';
import { CreateEvidenciaIncidenciaDto } from './dto/create-evidencia-incidencia.dto';
import { UpdateEvidenciaIncidenciaDto } from './dto/update-evidencia-incidencia.dto';

@Controller('evidencia-incidencia')
export class EvidenciaIncidenciaController {
  constructor(private readonly evidenciaIncidenciaService: EvidenciaIncidenciaService) {}

  @Post()
  create(@Body() createEvidenciaIncidenciaDto: CreateEvidenciaIncidenciaDto) {
    return this.evidenciaIncidenciaService.create(createEvidenciaIncidenciaDto);
  }

  @Get()
  findAll() {
    return this.evidenciaIncidenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evidenciaIncidenciaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvidenciaIncidenciaDto: UpdateEvidenciaIncidenciaDto) {
    return this.evidenciaIncidenciaService.update(id, updateEvidenciaIncidenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evidenciaIncidenciaService.remove(id);
  }
}
