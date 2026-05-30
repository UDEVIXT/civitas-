import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IncidenciasService } from './incidencias.service';

@Controller('incidencias')
// Si usas guards de autenticación (ej: JwtAuthGuard), van aquí.
export class IncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) {}

  @Get()
  async getIncidentes(@Query() query: { page?: string; limit?: string; estado?: string; prioridad?: string }) {
    // Llama al servicio que procesará todo
    return await this.incidenciasService.obtenerIncidentesPaginados(query);
  }
}
