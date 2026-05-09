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

  async updateEstado(id: string, nuevoEstado: EstadoIncidencia) {
    const incidencia = await this.prisma.incidencia.update({
      where: { id_incidencia: id }, 
      data: { 
        estado: nuevoEstado,
        historial: { 
          create: { 
            estado: nuevoEstado, 
            comentario: 'Cambio de estado automático' 
          } 
        }
      },
    });

    this.emitChange(incidencia);
    return incidencia;
  }

  emitChange(data: any) {
    this.updates$.next(data);
  }

  getStream(): Observable<any> {
    return this.updates$.asObservable();
  }
}