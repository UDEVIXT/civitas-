import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type FrecuenciaServicio = 'UNICA_VEZ' | 'RECURRENTE' | 'PROGRAMADO';

@Injectable()
export class MisServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerMisServicios(idUsuario: string) {
    const residente = await this.prisma.residente.findFirst({
      where: {
        id_usuario: idUsuario,
      },
      select: {
        id_residente: true,
        id_vivienda: true,
      },
    });

    if (!residente) {
      throw new NotFoundException('El usuario no está registrado como residente.');
    }

    const servicios = await this.prisma.servicio.findMany({
      where: {
        id_residente: residente.id_residente,
        id_vivienda: residente.id_vivienda,
      },
      orderBy: {
        fecha_registro: 'desc',
      },
      select: {
        id_servicio: true,
        nombre_servicio: true,
        nombre_empresa: true,
        activo: true,
        fecha_registro: true,
        tipo_servicio: {
          select: {
            nombre: true,
          },
        },
        horarios: {
          where: {
            activo: true,
          },
          select: {
            dia_semana: true,
            hora_inicio: true,
            hora_fin: true,
          },
        },
        visitantes: {
          take: 1,
          select: {
            accesos: {
              orderBy: {
                fecha_creacion: 'desc',
              },
              take: 1,
              select: {
                fecha_visita_programada: true,
                fecha_expiracion: true,
                estatus: true,
              },
            },
          },
        },
      },
    });

    return servicios.map((servicio) => {
      const frecuencia = this.calcularFrecuencia(servicio.horarios.length);

      const ultimoAcceso = servicio.visitantes?.[0]?.accesos?.[0];

      const fechaEsperada =
        ultimoAcceso?.fecha_visita_programada ??
        ultimoAcceso?.fecha_expiracion ??
        servicio.fecha_registro;

      const estatus =
        servicio.activo && ultimoAcceso?.estatus !== 'Inactivo'
          ? 'Activo'
          : 'Pendiente';

      return {
        id: servicio.id_servicio,
        empresa:
          servicio.nombre_empresa ||
          servicio.nombre_servicio ||
          'Proveedor Particular',
        tipo: servicio.tipo_servicio?.nombre || 'General',
        frecuencia,
        fecha: this.formatearFecha(fechaEsperada),
        estatus,
      };
    });
  }

  private calcularFrecuencia(totalHorarios: number): FrecuenciaServicio {
    if (totalHorarios > 1) {
      return 'RECURRENTE';
    }

    if (totalHorarios === 1) {
      return 'PROGRAMADO';
    }

    return 'UNICA_VEZ';
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }
}