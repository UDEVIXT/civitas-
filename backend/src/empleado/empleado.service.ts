/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
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
      where.residente = {
        id_vivienda: byViviendaId,
      };
    }

    if (isActive !== undefined) {
      where.servicio.activo = isActive;
    } else {
      where.servicio.activo = true;
    }

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

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
      data,
    };
  }

  async eliminarEmpleado(id: string) {
    try {
      const visitante = await this.prisma.visitante.findUnique({
        where: {
          id_visitante: id,
        },
        select: {
          nombre: true,
          id_servicio: true,
        },
      });

      // Error 404
      if (!visitante) {
        throw new NotFoundException(
          `No se encontró ningún empleado con el ID proporcionado.`,
        );
      }

      // Error 400
      if (!visitante.id_servicio) {
        throw new BadRequestException(
          `El registro de ${visitante.nombre} no está configurado como un empleado de servicio.`,
        );
      }

      //Verificar que el servicio asociado al empleado esté activo antes de intentar darlo de baja
      const servicio = await this.prisma.servicio.findUnique({
        where: {
          id_servicio: visitante.id_servicio,
          activo: true,
        },
        select: {
          activo: true,
        },
      });

      if (!servicio) {
        throw new NotFoundException(
          `El empleado que deseas dar de baja no está registrado.`,
        );
      }
      console.log('Servicio encontrado:', servicio);

      // Borrado lógico
      await this.prisma.servicio.update({
        where: { id_servicio: visitante.id_servicio },
        data: { activo: false },
      });

      return {
        statusCode: 200,
        message: `El empleado ${visitante.nombre} ha sido dado de baja exitosamente.`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Error 500: Error inesperado
      console.error('Error en eliminarEmpleado:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al intentar dar de baja al empleado. Por favor, inténtelo de nuevo más tarde.',
      );
    }
  }
}
