/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpleadoService {
  constructor(private prisma: PrismaService) {}

  //HU-1.5.6: Administrador puede ver empleados domesticos dentro del residencial
  async obtenerEmpleadosActivos(filters: {
    search?: string;
    page: number;
    limit?: number;
    isActive?: boolean;
    byResidenteId?: number;
    byViviendaId?: number;
  }) {
    const { search, page, limit, isActive, byResidenteId, byViviendaId } =
      filters;

    const where: any = {
      servicio: {
        tipo_servicio: {
          categoria: 'Empleado',
        },
      },
    };

    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (byResidenteId) {
      where.id_residente = byResidenteId;
    }

    if (byViviendaId) {
      //Debería obtener la info de la vivienda, solo su campo "numero_vivienda",
      //el objetivo es obtener el id_residente y con esto hacer un filtro de id_residente a la tabla "Visitante", la cual tiene como FK id_residente
      where.residente = {
        id_vivienda: byViviendaId,
      };
    }

    if (isActive !== undefined) {
      where.servicio.activo = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.visitante.findMany({
        where,
        select: {
          nombre: true,
          telefono: true,
          url_imagen: true,
          servicio: {
            select: {
              activo: true,
              tipo_servicio: {
                select: {
                  nombre: true,
                  categoria: true,
                },
              },
            },
          },
          residente: {
            select: {
              vivienda: {
                select: {
                  numero_vivienda: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * (limit ?? 10),
        take: limit ?? 10,
      }),
      this.prisma.visitante.count({ where }),
    ]);

    return { data, total };
  }
}
