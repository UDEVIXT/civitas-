// 1. EL CONTROLADOR (reportes.controller.ts)
import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { ArchivosService } from './archivos.service'; // Ajusta la ruta

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly archivosService: ArchivosService,
  ) {}

  @Post()
  // El interceptor busca un campo llamado 'imagen' en la petición del frontend
  @UseInterceptors(FileInterceptor('imagen')) 
  async crearReporte(
    @UploadedFile() archivo: any, // Usamos 'any' por la configuración actual de Docker
    @Body() datosReporte: any     // Aquí vienen el motivo, descripcion, etc.
  ) {
    let urlArchivo: string | null = null;
    let nombreArchivo: string | null = null;

    // Si el usuario adjuntó una imagen, la subimos "on the fly"
    if (archivo) {
      urlArchivo = await this.archivosService.subirImagen(archivo);
      nombreArchivo = archivo.originalname; // Guardamos el nombre original para la DB
    }

    // Pasamos los datos del formulario y los datos del archivo a nuestro servicio
    return this.reportesService.crearConEvidencia(datosReporte, urlArchivo, nombreArchivo);
  }
}