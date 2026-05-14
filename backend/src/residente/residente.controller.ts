import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResidenteService } from './residente.service';
import { CreateResidenteDto } from './dto/create-residente.dto';
import { UpdateResidenteDto } from './dto/update-residente.dto';

@Controller('residente')
export class ResidenteController {
  constructor(private readonly residenteService: ResidenteService) {}

  @Post()
  create(@Body() createResidenteDto: CreateResidenteDto) {
    return this.residenteService.create(createResidenteDto);
  }

  @Get()
  findAll() {
    return this.residenteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.residenteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResidenteDto: UpdateResidenteDto,
  ) {
    return this.residenteService.update(+id, updateResidenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.residenteService.remove(+id);
  }
}
