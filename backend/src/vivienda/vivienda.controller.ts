import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ViviendaService } from './vivienda.service';
import { CreateViviendaDto } from './dto/create-vivienda.dto';
import { UpdateViviendaDto } from './dto/update-vivienda.dto';

@Controller('vivienda')
export class ViviendaController {
  constructor(private readonly viviendaService: ViviendaService) {}

  @Post()
  create(@Body() createViviendaDto: CreateViviendaDto) {
    return this.viviendaService.create(createViviendaDto);
  }

  @Get()
  findAll() {
    return this.viviendaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viviendaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateViviendaDto: UpdateViviendaDto,
  ) {
    return this.viviendaService.update(+id, updateViviendaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viviendaService.remove(+id);
  }
}
