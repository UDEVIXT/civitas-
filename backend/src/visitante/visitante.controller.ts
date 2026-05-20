import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { VisitanteService } from './visitante.service';
import { CreateVisitanteDto } from './dto/create-visitante.dto';
import { UpdateVisitanteDto } from './dto/update-visitante.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('visitante')
export class VisitanteController {
  constructor(private readonly visitanteService: VisitanteService) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto_visitante'))
  create(
    @Body() createVisitanteDto: CreateVisitanteDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.visitanteService.create(createVisitanteDto, file);
  }

  @Get()
  findAll() {
    return this.visitanteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitanteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVisitanteDto: UpdateVisitanteDto,
  ) {
    return this.visitanteService.update(+id, updateVisitanteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.visitanteService.remove(+id);
  }
}
