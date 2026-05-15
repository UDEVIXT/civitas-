import { Controller, Post, Get, Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { ArchivosService } from './archivos.service'; 
import { EvidenciaReporteService } from 'src/evidencia-reporte/evidencia-incidencia.service';

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly archivosService: ArchivosService,
    private readonly evidenciaService: EvidenciaReporteService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('imagenes', 10)) 
  async crearReporte(
    @UploadedFiles() archivos: Array<any>, 
    @Body() datosReporte: any
  ) {
    const reporteCreado = await this.reportesService.crearConEvidencia(datosReporte);
    
    // Cambiamos a un arreglo normal, sin promesas.
    let fotosRegistros: Array<any> = [];

    if (archivos && archivos.length > 0) {
      // Magia de Promise.all: Capturamos directamente lo que el 'map' devuelve
      // y esperamos a que TODAS las promesas se resuelvan.
      fotosRegistros = await Promise.all(
        archivos.map(async (archivo) => {
          const urlSubida = await this.archivosService.subirImagen(archivo);
          
          // En lugar de hacer un push(), hacemos un return con el 'await'.
          // Promise.all agarrará este resultado y lo pondrá en la posición correcta del arreglo.
          return await this.evidenciaService.create({
            id_reporte: reporteCreado.id_reporte,
            url_archivo: urlSubida,
            nombre_archivo: archivo.originalname,
          });
        })
      );
    }

    if(fotosRegistros.length > 0){
      return {
        message: "Reporte y evidencias registrados con éxito",
        reporte: reporteCreado,
        // Pasamos el arreglo directamente, sin '.entries'
        fotos: fotosRegistros 
      };
    } else {
      return {
        message: "Reporte registrado con éxito (Sin evidencias)",
        reporte: reporteCreado
      };
    }
  }

  @Get()
  async obtenerReportes() {
    return this.reportesService.obtenerTodos();
  }
}