import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvidenciaReporteService } from './evidencia-incidencia.service';
import { CreateEvidenciaReporteDto } from './dto/create-evidencia-reporte.dto';
import { UpdateEvidenciaReporteDto } from './dto/update-evidencia-reporte.dto';

@Controller('evidencia-incidencia')
export class EvidenciaReporteController {
  constructor(private readonly EvidenciaReporteService: EvidenciaReporteService) {}

  @Post()
  create(@Body() createEvidenciaReporteDto: CreateEvidenciaReporteDto) {
    return this.EvidenciaReporteService.create(createEvidenciaReporteDto);
  }

  @Get()
  findAll() {
    return this.EvidenciaReporteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.EvidenciaReporteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvidenciaReporteDto: UpdateEvidenciaReporteDto) {
    return this.EvidenciaReporteService.update(id, updateEvidenciaReporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.EvidenciaReporteService.remove(id);
  }
}
