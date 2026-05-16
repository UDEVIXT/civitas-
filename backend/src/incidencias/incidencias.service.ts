import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoIncidencia, Incidencia } from '@prisma/client';

@Injectable()
export class IncidenciasService {
  private updates$ = new Subject<any>();

  constructor(private prisma: PrismaService) {}

  /**
   * CA001, CA002, CA006, CA007, CA010
   * Obtiene la lista paginada, filtrada y ordenada.
   */
  async getIncidencias(
    id_residente: string,
    estado?: EstadoIncidencia,
    order: 'asc' | 'desc' = 'desc',
    skip: number = 0,
    take: number = 10
  ) {
    try {
      return await this.prisma.incidencia.findMany({
        where: {
          id_residente: id_residente,
          ...(estado && { estado }),
        },
        // CA002: Aseguramos que traiga todos los campos necesarios
        select: {
          id_incidencia: true,
          titulo: true,
          descripcion: true,
          fecha_creacion: true,
          updatedAt: true, 
          estado: true,
          prioridad: true,
          es_anonimo: true,
          _count: { select: { historial: true } }
        },
        orderBy: { fecha_creacion: order },
        skip,
        take,
      });
    } catch (error) {
      // CA009: Mensaje claro en caso de error técnico
      console.log('Error al cargar incidencias:', error);
      throw new InternalServerErrorException('Error al cargar las incidencias. Intente más tarde.');
    }
  }

  /**
   * CA003, CA005
   * Obtiene el detalle de una incidencia con su historial completo.
   */
  async getIncidenciaDetalle(id_incidencia: string) {
    const incidencia = await this.prisma.incidencia.findUnique({
      where: { id_incidencia },
      include: {
        historial: {
          orderBy: { fecha: 'desc' },
          // CA005: El historial incluye estado anterior, nuevo, fecha y quién actualizó
        },
      },
    });

    if (!incidencia) {
      throw new NotFoundException(`La incidencia con ID ${id_incidencia} no existe.`);
    }

    return incidencia;
  }

  /**
   * CA004, CA005, CA011
   * Actualiza el estado y crea el historial en una transacción.
   */
  async updateEstado(id: string, nuevoEstado: EstadoIncidencia, nombreAdmin: string) {
    try {
      const resultado = await this.prisma.$transaction(async (tx) => {
        // 1. Verificar existencia
        const incidenciaActual = await tx.incidencia.findUnique({
          where: { id_incidencia: id },
        });

        if (!incidenciaActual) {
          throw new NotFoundException('Incidencia no encontrada');
        }

        // 2. Actualizar la incidencia (CA004)
        const incidenciaActualizada = await tx.incidencia.update({
          where: { id_incidencia: id },
          data: { estado: nuevoEstado },
        });

        // 3. Crear registro en historial (CA005)
        await tx.historialIncidencia.create({
          data: {
            estado_anterior: incidenciaActual.estado,
            nuevo_estado: nuevoEstado,
            comentario: `Estado actualizado a ${nuevoEstado}`,
            actualizado_por: nombreAdmin, // Se guarda quién hizo el cambio
            id_incidencia: id,
          },
        });

        return incidenciaActualizada;
      });

      // CA004: Emitir cambio para actualización inmediata (WebSockets)
      this.emitChange(resultado);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el estado.');
    }
  }

  private emitChange(data: any) {
    this.updates$.next(data);
  }

  getStream(): Observable<any> {
    return this.updates$.asObservable();
  }
}