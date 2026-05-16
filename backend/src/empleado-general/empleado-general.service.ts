import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpleadoGeneralService {
  constructor(private prisma: PrismaService) {}

  async obtenerMisEmpleados(
    userId: string,
    filters: {
      search?: string;
      page: number;
      limit?: number;
      isActive?: boolean;
    },
  ) {
    const { search, page, limit = 7, isActive } = filters;

    // Buscar el residente asociado al usuario autenticado
    const residente = await this.prisma.residente.findFirst({
      where: {
        id_usuario: userId,
      },
      select: {
        id_residente: true,
      },
    });

    if (!residente) {
      throw new NotFoundException('Residente no encontrado');
    }

    // Filtros principales
    const where: any = {
      id_residente: residente.id_residente,

      servicio: {
        tipo_servicio: {
          categoria: 'Empleado',
        },
      },
    };

    // Filtro por nombre
    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filtro por estado activo/inactivo
    if (isActive !== undefined) {
      where.servicio = {
        ...where.servicio,
        activo: isActive,
      };
    }

    // Consultas
    const [data, total] = await Promise.all([
      this.prisma.visitante.findMany({
        where,

        select: {
          id_visitante: true,
          nombre: true,
          telefono: true,
          url_imagen: true,

          servicio: {
            select: {
              activo: true,
              fecha_registro: true,

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

        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.visitante.count({
        where,
      }),
    ]);

    return {
      success: true,
      message: 'Empleados obtenidos correctamente',

      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },

      data,
    };
  }
}