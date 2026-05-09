import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BitacoraFiltroDto,
  TipoPersona,
  Ordenamiento,
} from './dto/bitacora-filtro.dto';

@Injectable()
export class BitacoraGuardiaService {
  constructor(private prisma: PrismaService) {}

  async obtenerBitacoraHistorica(filtros: BitacoraFiltroDto) {
    const {
      search,
      tipo,
      residencia,
      fecha_inicio,
      fecha_fin,
      ordenar = Ordenamiento.RECIENTE,
      page = '1',
      limit = '10',
    } = filtros;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (fecha_inicio || fecha_fin) {
      where.fecha_hora_entrada = {};
      if (fecha_inicio) {
        where.fecha_hora_entrada.gte = new Date(fecha_inicio);
      }
      if (fecha_fin) {
        where.fecha_hora_entrada.lte = new Date(fecha_fin);
      }
    }

    if (tipo) {
      where.acceso = {
        visitante: {},
      };

      switch (tipo) {
        case TipoPersona.PROVEEDOR:
          where.acceso.visitante.id_servicio = { not: null };
          break;
        case TipoPersona.VISITANTE:
          where.acceso.visitante.id_servicio = null;
          where.acceso.visitante.es_frecuente = false;
          break;
        case TipoPersona.EMPLEADO_DOMESTICO:
          where.acceso.visitante.es_frecuente = true;
          where.acceso.visitante.id_servicio = null;
          break;
      }
    }

    if (residencia) {
      where.acceso = {
        ...where.acceso,
        visitante: {
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

    if (search) {
      where.OR = [
        {
          acceso: {
            visitante: {
              nombre: {
                contains: search,
              },
            },
          },
        },
        {
          acceso: {
            visitante: {
              residente: {
                usuario: {
                  persona: {
                    nombre: {
                      contains: search,
                    },
                  },
                },
              },
            },
          },
        },
        {
          acceso: {
            usuario: {
              persona: {
                nombre: {
                  contains: search,
                },
              },
            },
          },
        },
        {
          guardia: {
            nombre: {
              contains: search,
            },
          },
        },
      ];
    }

    const orderBy: any = {
      fecha_hora_entrada: ordenar === Ordenamiento.RECIENTE ? 'desc' : 'asc',
    };

    const [data, total] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,
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
        orderBy,
        skip,
        take: limitNum,
      }),
      this.prisma.bitacora.count({ where }),
    ]);

    const transformados = data.map((registro) => {
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
      if (registro.acceso.codigo_qr) metodoAcceso = 'QR';
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
      };
    });

    return {
      data: transformados,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    };
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
    if (registro.acceso.codigo_qr) metodoAcceso = 'QR';
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
