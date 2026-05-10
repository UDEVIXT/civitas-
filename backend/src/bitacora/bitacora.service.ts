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
      page,
      limit,
    } = filters;

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
      case 'antiguos':
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

  async actualizarFrecuenciaVisitante(idBitacora: string, esFrecuente: boolean) {
    const registro = await this.prisma.bitacora.findUnique({
      where: { id_bitacora: idBitacora },
      include: {
        acceso: {
          include: {
            visitante: true,
          },
        },
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado.');
    }

    await this.prisma.visitante.update({
      where: { id_visitante: registro.acceso.visitante.id_visitante },
      data: { es_frecuente: esFrecuente },
    });

    return {
      id_bitacora: registro.id_bitacora,
      es_frecuente: esFrecuente,
    };
  }

  // Obtener bitácora de un residente específico con filtros
  async obtenerMiBitacora(filters: {
    residentUserId?: string;
    search?: string;
    personType?: 'visitante' | 'empleado' | 'proveedor';
    dateFrom?: string;
    dateTo?: string;
    sort?: 'asc' | 'desc';
    page: number;
    limit: number;
  }) {
    const {
      residentUserId,
      search,
      personType,
      dateFrom,
      dateTo,
      sort = 'desc',
      page,
      limit,
    } = filters;

    const where: any = {
      acceso: {
        visitante: {
          residente: {
            usuario: {
              id_usuario: residentUserId,
            },
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
    if (personType === 'visitante') {
      where.acceso.visitante.id_servicio = null;
    } else if (personType === 'proveedor') {
      where.acceso.visitante.id_servicio = { not: null };
    } else if (personType === 'empleado') {
      where.acceso.visitante.es_frecuente = true;
    }

    // FILTRO FECHAS
    if (dateFrom || dateTo) {
      where.fecha_hora_entrada = {};
      if (dateFrom) {
        where.fecha_hora_entrada.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.fecha_hora_entrada.lte = new Date(dateTo);
      }
    }

    const orderBy: any = {
      fecha_hora_entrada: sort === 'asc' ? 'asc' : 'desc',
    };

    const [bitacoras, total] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,
        include: {
          acceso: {
            select: {
              codigo_qr: true,
              visitante: {
                select: {
                  nombre: true,
                  es_frecuente: true,
                  id_servicio: true,
                  url_imagen: true,
                  servicio: {
                    select: {
                      tipo_servicio: {
                        select: {
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
              id_guardia: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bitacora.count({ where }),
    ]);

    // Transform to include tipo_persona
    const data = bitacoras.map((bitacora) => {
      const visitante = bitacora.acceso.visitante;
      let tipoPersona: 'visitante' | 'empleado' | 'proveedor';

      if (visitante.id_servicio) {
        tipoPersona = 'proveedor';
      } else if (visitante.es_frecuente) {
        tipoPersona = 'empleado';
      } else {
        tipoPersona = 'visitante';
      }

      return {
        id_bitacora: bitacora.id_bitacora,
        id_visitante: visitante.nombre, // placeholder for frontend mapping
        nombre_persona: visitante.nombre,
        tipo_persona: tipoPersona,
        fecha_hora_entrada: bitacora.fecha_hora_entrada.toISOString(),
        fecha_hora_salida: bitacora.fecha_hora_salida?.toISOString() || null,
        metodo_acceso: visitante.es_frecuente ? 'lista' : (bitacora.acceso.codigo_qr ? 'QR' : 'manual'),
        guardia: {
          id_guardia: bitacora.guardia.id_guardia,
          nombre: bitacora.guardia.nombre,
        },
        es_frecuente: visitante.es_frecuente,
      };
    });

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

  // Detalle de registro en bitácora a partir de su ID
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
      tipoPersona = 'empleado';
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
