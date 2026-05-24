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
  UseGuards,
  Req,
} from '@nestjs/common';
import { VisitanteService } from './visitante.service';
import { CreateVisitanteDto } from './dto/create-visitante.dto';
import { UpdateVisitanteDto } from './dto/update-visitante.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import type { Request } from 'express';
import type { AuthenticatedRequest } from 'src/request/AuthenticatedRequest';

@Controller('visitante')
export class VisitanteController {
  constructor(private readonly visitanteService: VisitanteService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  @UseInterceptors(FileInterceptor('foto_visitante'))
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createVisitanteDto: CreateVisitanteDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.visitanteService.create(
      createVisitanteDto,
      req.user.userId,
      file,
    );
  }

  @Post('accesos/:idAcceso/generar-qr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  generarQr(
    @Param('idAcceso') idAcceso: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { fecha_inicio?: string; fecha_fin?: string },
  ) {
    return this.visitanteService.generarQrParaVisita(
      idAcceso,
      req.user.userId,
      body,
    );
  }

  @Post(':idVisitante/generar-qr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  generarQrParaVisitante(
    @Param('idVisitante') idVisitante: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { fecha_inicio?: string; fecha_fin?: string },
  ) {
    return this.visitanteService.generarQrParaVisitante(
      idVisitante,
      req.user.userId,
      body,
    );
  }

  @Get('accesos/:idAcceso')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente', 'Guardia', 'Administrador')
  obtenerDetalleVisita(
    @Param('idAcceso') idAcceso: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.visitanteService.obtenerDetalleVisita(idAcceso, req.user);
  }

  @Get('qr/:codigoQr')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Guardia', 'Administrador')
  consultarQr(@Param('codigoQr') codigoQr: string) {
    return this.visitanteService.consultarQr(codigoQr);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Residente')
  findAll(@Req() req: AuthenticatedRequest) {
    return this.visitanteService.findAllByResidente(req.user.userId);
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
