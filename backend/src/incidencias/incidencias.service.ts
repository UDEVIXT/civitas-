import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoIncidencia, Incidencia } from '@prisma/client';

@Injectable()
export class IncidenciasService {
  private updates$ = new Subject<any>();

  constructor(private prisma: PrismaService) {}

  async getIncidencias(
    id_residente: string, 
    estado?: EstadoIncidencia, 
    order: 'asc' | 'desc' = 'desc', 
    skip: number = 0,               
    take: number = 10               
  ) {
    return this.prisma.incidencia.findMany({
      where: {
        id_residente,
        ...(estado && { estado }),
      },
      include: { 
        _count: { select: { historial: true } } // Para saber si tiene historial rápido
      },
      orderBy: { fecha_creacion: order },
      skip: skip,
      take: take,
    });
  }

  emitChange(data: any) {
    this.updates$.next(data);
  }

  getStream(): Observable<any> {
    return this.updates$.asObservable();
  }

  async updateEstado(id: string, nuevoEstado: EstadoIncidencia) {
    const incidenciaActual = await this.prisma.incidencia.findUnique({
      where: { id_incidencia: id },
    });

    if (!incidenciaActual) {
      throw new Error('Incidencia no encontrada');
    }

    const incidencia = await this.prisma.incidencia.update({
      where: { id_incidencia: id },

      data: {
        estado: nuevoEstado,
      },
    });

    await this.prisma.historialIncidencia.create({
      data: {
        estado_anterior: incidenciaActual.estado,
        nuevo_estado: nuevoEstado,
        comentario: 'Cambio de estado automático',
        id_incidencia: id,
      },
    });

    this.emitChange(incidencia);

    return incidencia;
  }
}
