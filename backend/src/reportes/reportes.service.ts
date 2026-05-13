// 2. EL SERVICIO (reportes.service.ts)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async crearConEvidencia(datos: any, urlArchivo?: string | null, nombreArchivo?: string | null) {
    // IMPORTANTE: En peticiones multipart, todo llega como texto (String).
    // Debemos convertir los números y booleanos a su tipo real antes de guardarlos.
    const latitud = parseFloat(datos.latitud);
    const longitud = parseFloat(datos.longitud);
    const es_anonimo = datos.es_anonimo === 'true' || datos.es_anonimo === true;

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
        
        // Aquí ocurre la magia de Prisma: Crea la Evidencia conectada a este Reporte automáticamente
        ...(urlArchivo && nombreArchivo && {
          evidencias: {
            create: [
              {
                url_archivo: urlArchivo,
                nombre_archivo: nombreArchivo,
              },
            ],
          },
        }),
      },
      // Le pedimos a Prisma que en su respuesta nos incluya las evidencias creadas
      include: {
        evidencias: true, 
      },
    });
  }
}