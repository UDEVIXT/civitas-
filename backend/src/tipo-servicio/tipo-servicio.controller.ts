import { Controller, Get, Query } from '@nestjs/common';
import { TipoServicioService } from './tipo-servicio.service';

@Controller('tipo-servicio')
export class TipoServicioController {
  constructor(private readonly service: TipoServicioService) {}

  @Get()
  async findAll(@Query('categoria') categoria?: string) {
    return this.service.findAll(categoria);
  }
}
