import { Controller, Get, Query, Patch, Param, Body, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { IncidenciasService } from './incidencias.service';
import { EstadoIncidencia } from '@prisma/client';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  /**
   * CA001, CA002, CA006, CA007, CA010
   */
  @Get()
  async findAll(
    @Query('residenteId') id: string, 
    @Query('estado') estado?: EstadoIncidencia, // Opcional
    @Query('order') order: 'asc' | 'desc' = 'desc', // Tiene valor por defecto (cuenta como opcional)
    @Query('skip') skip?: string, // Lo ponemos opcional para evitar el error
    @Query('take') take?: string  // Lo ponemos opcional para evitar el error
  ) {
    // Convertimos a número antes de enviar al servicio
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 10;
    
    return this.service.getIncidencias(id, estado, order, skipNum, takeNum);
  }

  /**
   * CA003, CA005: Detalle de incidencia
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.getIncidenciaDetalle(id);
  }

  /**
   * CA004, CA005, CA011: Actualizar estado
   */
  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body('nuevoEstado') nuevoEstado: EstadoIncidencia,
    @Body('nombreAdmin') nombreAdmin: string,
  ) {
    return this.service.updateEstado(id, nuevoEstado, nombreAdmin);
  }
}