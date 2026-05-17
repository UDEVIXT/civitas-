import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoIncidencia, Reporte } from '@prisma/client';

@Injectable()
export class IncidenciasService {
  private updates$ = new Subject<any>();

  constructor(private prisma: PrismaService) {}

  /**
   * CA001, CA002, CA006, CA007, CA010
   * Obtiene la lista paginada, filtrada y ordenada desde la tabla Reporte.
   */
  async getIncidencias(
    id_usuario: string, // Cambiado a id_usuario de acuerdo al esquema unificado
    estado?: EstadoIncidencia,
    order: 'asc' | 'desc' = 'desc',
    skip: number = 0,
    take: number = 10
  ) {
    try {
      return await this.prisma.reporte.findMany({
        where: {
          id_usuario: id_usuario,
          tipo: 'INCIDENCIA', 
          ...(estado && { estado }),
        },
        // CA002: Mapeamos los campos equivalentes del modelo Reporte
        select: {
          id_reporte: true,
          motivo: true,        // Mapea como el título o tipo de incidente
          descripcion: true,
          estado: true,        // EstadoIncidencia (PENDIENTE, EN_PROCESO, etc.)
          prioridad: true,     // PrioridadReporte (BAJA, MEDIA, ALTA)
          es_anonimo: true,
          token_seguimiento: true,
          resultado_esperado: true,
          resultado_solucion: true,
          createdAt: true,
          evidencias: {        // CA002: Incluye las evidencias adjuntas
            select: {
              url_archivo: true,
              nombre_archivo: true,
            }
          }
        },
        // Nota: Como tu modelo Reporte actual no tiene un 'fecha_creacion' o 'createdAt',
        // si te marca error aquí, añade 'createdAt DateTime @default(now())' a tu modelo Reporte en el esquema.
        // Por ahora lo ordenamos por id_reporte para evitar fallos si no existe la fecha.
        orderBy: { createdAt: order }, 
        skip,
        take,
      });
    } catch (error) {
      // CA009: Mensaje claro en caso de error técnico
      console.error('Error al cargar incidencias desde reportes:', error);
      throw new InternalServerErrorException('Error al cargar las incidencias. Intente más tarde.');
    }
  }

  /**
   * CA003, CA005
   * Obtiene el detalle de una incidencia (Reporte de tipo INCIDENCIA).
   */
  async getIncidenciaDetalle(id_reporte: string) {
    const reporte = await this.prisma.reporte.findFirst({
      where: { 
        id_reporte,
        tipo: 'INCIDENCIA' // Nos aseguramos de que no sea una queja o sugerencia
      },
      include: {
        evidencias: true,
      },
    });

    if (!reporte) {
      throw new NotFoundException(`La incidencia con ID ${id_reporte} no existe.`);
    }

    return reporte;
  }

  /**
   * CA004, CA011
   * Actualiza el estado del reporte y emite el evento en tiempo real.
   */
  async updateEstado(id_reporte: string, nuevoEstado: EstadoIncidencia) {
    try {
      // 1. Verificar existencia y tipo
      const reporteActual = await this.prisma.reporte.findFirst({
        where: { id_reporte, tipo: 'INCIDENCIA' },
      });

      if (!reporteActual) {
        throw new NotFoundException('Incidencia no encontrada en el sistema');
      }

      // 2. Actualizar el estado en el reporte
      const reporteActualizado = await this.prisma.reporte.update({
        where: { id_reporte },
        data: { estado: nuevoEstado },
      });

      // CA004: Emitir cambio inmediato a través del canal SSE
      this.emitChange(reporteActualizado);
      
      return reporteActualizado;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el estado de la incidencia.');
    }
  }

  private emitChange(data: any) {
    this.updates$.next(data);
  }

  getStream(): Observable<any> {
    return this.updates$.asObservable();
  }
}