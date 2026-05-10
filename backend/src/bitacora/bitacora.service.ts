import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BitacoraService {
  constructor(private prisma: PrismaService) {}

  // Ver bitacora con filtros de búsqueda, tipo, residencia, fecha, ordenamiento y paginación
  async obtenerBitacora(filters: {
    search?: string;
    tipo?: string;
    residencia?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    ordenar?: string;
    estado?: 'dentro' | 'fuera' | 'todos';
    page: number;
    limit: number;
  }) {
    const {
      search,
      tipo,
      residencia,
      fecha_inicio,
      fecha_fin,
      ordenar,
      estado,
      page,
      limit,
    } = filters;

    const where: any = {
      acceso: {
        visitante: {},
      },
    };

    // FILTRO ESTADO
    if (estado === 'dentro') {
      where.fecha_hora_salida = null;
    } else if (estado === 'fuera') {
      where.fecha_hora_salida = {
        not: null,
      };
    }

    // SEARCH
    if (search) {
      where.acceso = {
        ...where.acceso,

        visitante: {
          ...where.acceso?.visitante,

          nombre: {
            contains: search,
            mode: 'insensitive',
          },
        },
      };
    }

    // FILTRO TIPO
    if (tipo) {
      where.acceso = {
        ...where.acceso,

        visitante: {
          ...where.acceso?.visitante,

          servicio: {
            tipo_servicio: {
              categoria: tipo,
            },
          },
        },
      };
    }

    // FILTRO RESIDENCIA
    if (residencia) {
      where.acceso = {
        ...where.acceso,

        visitante: {
          ...where.acceso?.visitante,

          residente: {
            vivienda: {
              numero_vivienda: {
                contains: residencia,
                mode: 'insensitive',
              },
            },
          },
        },
      };
    }

    // FILTRO FECHAS
    if (fecha_inicio || fecha_fin) {
      where.fecha_hora_entrada = {};

      if (fecha_inicio) {
        where.fecha_hora_entrada.gte = new Date(fecha_inicio);
      }

      if (fecha_fin) {
        where.fecha_hora_entrada.lte = new Date(fecha_fin);
      }
    }

    // ORDENAMIENTO
    let orderBy: any = {
      fecha_hora_entrada: 'desc',
    };

    switch (ordenar) {
      case 'antiguo':
        orderBy = {
          fecha_hora_entrada: 'asc',
        };
        break;

      case 'nombre':
        orderBy = {
          acceso: {
            visitante: {
              nombre: 'asc',
            },
          },
        };
        break;

      case 'tipo':
        orderBy = {
          acceso: {
            visitante: {
              servicio: {
                tipo_servicio: {
                  nombre: 'asc',
                },
              },
            },
          },
        };
        break;
    }

    const [data, total] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,

        include: {
          acceso: {
            select: {
              codigo_qr: true,
              fecha_expiracion: true,

              visitante: {
                select: {
                  nombre: true,
                  motivo: true,
                  es_frecuente: true,
                  id_servicio: true,

                  residente: {
                    select: {
                      vivienda: {
                        select: {
                          numero_vivienda: true,
                        },
                      },
                    },
                  },

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

          guardia: {
            select: {
              nombre: true,
            },
          },
        },

        orderBy,

        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.bitacora.count({
        where,
      }),
    ]);

    const ahora = new Date();
    const registros = data.map((item) => {
      const expiracion = item.acceso.fecha_expiracion;

      const tiempoExcedido =
        item.fecha_hora_salida === null &&
        expiracion &&
        new Date(expiracion) < ahora;

      return {
        id: item.id_bitacora,

        nombre: item.acceso.visitante.nombre,

        tipo_persona:
          item.acceso.visitante.servicio?.tipo_servicio?.categoria ??
          'Visitante',

        residente_asociado: {
          nombre:
            item.acceso.visitante.residente?.vivienda?.numero_vivienda ?? '',

          avatar_url: null,
        },

        fecha_entrada: item.fecha_hora_entrada,

        fecha_salida: item.fecha_hora_salida,

        metodo_acceso: 'QR',

        guardia_registro: item.guardia.nombre,

        estado:
          item.fecha_hora_salida === null
            ? tiempoExcedido
              ? 'excedido'
              : 'dentro'
            : 'fuera',

        avatar_url: null,
      };
    });
    return {
      data: registros,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  // HU-1.9.1: Registrar salida (Individual o Masiva)
  async registrarSalida(
    id_bitacora: string | string[],
    id_guardia: string,
    comentario_salida?: string,
  ) {
    try {
      const guardiaInfo = await this.prisma.guardia.findUnique({
        where: { id_guardia: id_guardia },
      });

      if (!guardiaInfo) {
        throw new NotFoundException('El guardia no existe.');
      }

      const ids = Array.isArray(id_bitacora) ? id_bitacora : [id_bitacora];

      const auditoria = ` (Registrado por: ${guardiaInfo.nombre})`;
      const textoSalida = comentario_salida
        ? `${comentario_salida}${auditoria}`
        : `Salida verificada por: ${guardiaInfo.nombre}`;

      const resultado = await this.prisma.bitacora.updateMany({
        where: {
          id_bitacora: { in: ids },
          fecha_hora_salida: null,
        },
        data: {
          fecha_hora_salida: new Date(),
          comentario_salida: textoSalida,
        },
      });

      if (resultado.count === 0) {
        throw new ConflictException(
          'No se encontraron registros pendientes de salida, o ya han sido registrados previamente.',
        );
      }

      return {
        mensaje: `Se registraron ${resultado.count} salidas exitosamente.`,
        cantidad: resultado.count,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('Error interno del servidor al registrar salida.');
    }
  }

  async obtenerDetalleRegistro(id: string) {
    const registro = await this.prisma.bitacora.findUnique({
      where: { id_bitacora: id },
      include: {
        acceso: {
          include: {
            visitante: {
              include: {
                servicio: {
                  include: {
                    tipo_servicio: true,
                  },
                },
              },
            },
            usuario: {
              include: {
                persona: true,
              },
            },
          },
        },
        guardia: true,
      },
    });

    if (!registro) {
      throw new Error('Registro no encontrado');
    }

    const visitante = registro.acceso.visitante;

    let tipoPersona: string;
    if (visitante.id_servicio) {
      tipoPersona = 'proveedor';
    } else if (visitante.es_frecuente) {
      tipoPersona = 'empleado_domestico';
    } else {
      tipoPersona = 'visitante';
    }

    let metodoAcceso: string;
    if (visitante.es_frecuente) metodoAcceso = 'lista';
    else if (registro.acceso.codigo_qr) metodoAcceso = 'QR';
    else metodoAcceso = 'manual';

    const estado = registro.fecha_hora_salida ? 'salida' : 'entrada';

    return {
      id: registro.id_bitacora,
      nombre: visitante.nombre,
      tipo_persona: tipoPersona,
      residente_asociado: {
        nombre: registro.acceso.usuario?.persona?.nombre || '-',
        avatar_url: registro.acceso.usuario?.persona?.url_imagen || null,
      },
      fecha_entrada: registro.fecha_hora_entrada,
      fecha_salida: registro.fecha_hora_salida || '-',
      metodo_acceso: metodoAcceso,
      guardia_registro: registro.guardia?.nombre || 'No registrado',
      estado,
      avatar_url: visitante.url_imagen || null,
      qr_utilizado: registro.acceso.codigo_qr || null,
      notas: registro.comentario_salida || null,
      hora_validacion: registro.fecha_hora_entrada,
    };
  }
}
