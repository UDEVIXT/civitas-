import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async crearConEvidencia(datos: any, urlArchivo?: string | null, nombreArchivo?: string | null) {
    const latitud = parseFloat(datos.latitud);
    const longitud = parseFloat(datos.longitud);
    const es_anonimo = datos.es_anonimo === 'true' || datos.es_anonimo === true;

    // 1. Buscamos primero si el Controlador nos mandó un archivo físico.
    let urlFinal = urlArchivo;
    let nombreFinal = nombreArchivo;

    // 2. Si NO hay archivo físico, revisamos si enviaste la estructura manual en el JSON crudo.
    // El operador '?.' (Optional Chaining) evita que el servidor explote si 'evidencias' no existe en el JSON.
    if (!urlFinal && datos.evidencias?.create?.[0]) {
      urlFinal = datos.evidencias.create[0].url_archivo;
      nombreFinal = datos.evidencias.create[0].nombre_archivo;
    }

    return this.prisma.reporte.create({
      data: {
        id_usuario: datos.id_usuario,
        motivo: datos.motivo,
        descripcion: datos.descripcion,
        tipo: datos.tipo,
        latitud: latitud,
        longitud: longitud,
        estado: datos.estado || 'PENDIENTE',
        prioridad: datos.prioridad || 'MEDIA',
        es_anonimo: es_anonimo,
        
        // 3. Ahora usamos nuestras variables 'Finales'. 
        // Prisma creará la evidencia si encontró datos en el archivo físico o en el JSON.
        ...(urlFinal && nombreFinal && {
          evidencias: {
            create: [
              {
                url_archivo: urlFinal,
                nombre_archivo: nombreFinal,
              },
            ],
          },
        }),
      },
      include: {
        evidencias: true, 
      },
    });
  }
}