// 1. Importamos BadRequestException para manejar errores de datos faltantes
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async crearConEvidencia(datos: any, urlArchivo?: string | null, nombreArchivo?: string | null) {
    // 2. Validación defensiva: Si no nos mandaron el id_usuario, detenemos la 
    // ejecución inmediatamente y le avisamos al cliente con un error claro.
    if (!datos.id_usuario) {
      throw new BadRequestException('El campo id_usuario es estrictamente obligatorio.');
    }

    const latitud = parseFloat(datos.latitud);
    const longitud = parseFloat(datos.longitud);
    const es_anonimo = datos.es_anonimo === 'true' || datos.es_anonimo === true;

    let urlFinal = urlArchivo;
    let nombreFinal = nombreArchivo;

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