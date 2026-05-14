import { Controller, Get, Query, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IncidenciasService } from './incidencias.service';
import { EstadoIncidencia } from '@prisma/client';

@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  @Get()
  async findAll(
    @Query('residenteId') id: string, 
    @Query('estado') estado: EstadoIncidencia
  ) {
    return this.service.getIncidencias(id, estado);
  }

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.service.getStream().pipe(
      map((msg) => ({ data: msg } as MessageEvent))
    );
  }
}