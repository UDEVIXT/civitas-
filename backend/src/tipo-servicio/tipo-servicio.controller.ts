import { Controller, Get } from '@nestjs/common';
import { TipoServicioService } from './tipo-servicio.service';

@Controller('tipo-servicio')
export class TipoServicioController {
  constructor(private readonly service: TipoServicioService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }
}
