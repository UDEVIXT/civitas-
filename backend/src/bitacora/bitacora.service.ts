import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BitacoraService {
  constructor(private prisma: PrismaService) {}

  // HU-1.9.1: Ver proveedores dentro del residencial
  async obtenerProveedoresActivos(filters: {
    search?: string;
    tipo?: string;
    page: number;
    limit: number;
  }) {
    const { search, tipo, page, limit } = filters;

    const where: any = {
      fecha_hora_salida: null,

      acceso: {
        visitante: {
          id_servicio: {
            not: null,
          },
        },
      },
    };

    // SEARCH
    if (search) {
      where.acceso.visitante.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // FILTRO TIPO
    if (tipo) {
      where.acceso.visitante.servicio = {
        tipo_servicio: {
          nombre: tipo,
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,

        include: {
          acceso: {
            select: {
              codigo_qr: true,

              visitante: {
                select: {
                  nombre: true,
                  motivo: true,

                  servicio: {
                    select: {
                      nombre_empresa: true,
                      nombre_servicio: true,
                      placas: true,

                      tipo_servicio: {
                        select: {
                          nombre: true,
                          categoria: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          fecha_hora_entrada: 'desc',
        },

        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.bitacora.count({
        where,
      }),
    ]);

    return {
      data,

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // HU-1.9.1: Registrar salida y validar
  async registrarSalidaProveedor(
    id_bitacora: string,
    id_guardia: string,
    comentario_salida?: string,
  ) {
    const guardiaInfo = await this.prisma.guardia.findUnique({
      where: { id_guardia: id_guardia },
    });

    if (!guardiaInfo) {
      throw new NotFoundException('El guardia no existe en la base de datos.');
    }

    const registroActual = await this.prisma.bitacora.findUnique({
      where: { id_bitacora },
    });

    if (!registroActual) {
      throw new NotFoundException('No se encontró el registro de entrada.');
    }

    if (registroActual.fecha_hora_salida !== null) {
      throw new ConflictException(
        'Este proveedor ya tiene una salida registrada.',
      );
    }

    const textoSalida =
      comentario_salida || `Salida verificada por: ${guardiaInfo.nombre}`;

    const salidaRegistrada = await this.prisma.bitacora.update({
      where: { id_bitacora },
      data: {
        fecha_hora_salida: new Date(),
        comentario_salida: textoSalida,
      },
    });

    return salidaRegistrada;
  }

  async obtenerHistorialBitacora(filters: {
    fechaInicio?: string;
    fechaFin?: string;
    nombre?: string;
    numeroVivienda?: string;
    tipoPersona?: 'Residente' | 'Visitante' | 'Servicio';
    page?: number;
    limit?: number;
  }) {
    const { fechaInicio, fechaFin, nombre, numeroVivienda, page = 1, limit = 10 } = filters;
    const where: Prisma.BitacoraWhereInput = {};

    // Filtros por fecha
    if (fechaInicio || fechaFin) {
      where.fecha_hora_entrada = {};
      if (fechaInicio) where.fecha_hora_entrada.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha_hora_entrada.lte = new Date(fechaFin);
    }

    // Búsqueda por nombre de visitante
    if (nombre) {
      where.acceso = {
        visitante: {
          nombre: { contains: nombre, mode: 'insensitive' },
        },
      };
    }

    // Filtro por propiedad (Vivienda)
    if (numeroVivienda) {
      where.acceso = {
        ...(where.acceso as any), // Preservar filtros previos si existen
        visitante: {
          ...(where.acceso as any)?.visitante,
          residente: {
            vivienda: {
              numero_vivienda: numeroVivienda,
            },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,
        include: {
          guardia: true,
          acceso: {
            include: {
              usuario: true, // Quién autorizó
              visitante: {
                include: {
                  residente: { include: { vivienda: true } },
                  servicio: { include: { tipo_servicio: true } },
                },
              },
            },
          },
        },
        orderBy: { fecha_hora_entrada: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bitacora.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
