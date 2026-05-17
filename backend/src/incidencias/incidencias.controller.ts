import { Controller, Get, Query, Patch, Param, Body, InternalServerErrorException } from '@nestjs/common';
import { IncidenciasService } from './incidencias.service';
import { EstadoIncidencia } from '@prisma/client';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  /**
   * CA001, CA002, CA006, CA007, CA010
   * Obtiene incidencias filtradas, ordenadas y paginadas por usuarioId
   */
  @Get()
  async findAll(
    @Query('usuarioId') id: string, 
    @Query('estado') estado?: EstadoIncidencia, 
    @Query('order') order: 'asc' | 'desc' = 'desc', 
    @Query('skip') skip?: string, 
    @Query('take') take?: string  
  ) {
    // Convertimos a número antes de enviar al servicio
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 10;
    
    return this.service.getIncidencias(id, estado, order, skipNum, takeNum);
  }

  /**
   * CA003: Obtiene el detalle de una incidencia específica
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.getIncidenciaDetalle(id);
  }

  /**
   * CA004, CA011: Actualizar el estado de la incidencia en el Reporte
   */
  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body('nuevoEstado') nuevoEstado: EstadoIncidencia,
  ) {
    return this.service.updateEstado(id, nuevoEstado);
  }
}