import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PersonaBitacora = 'visitante' | 'empleado' | 'proveedor';

type MiBitacoraFilters = {
  residentUserId?: string;
  residentName?: string;
  search?: string;
  personType?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: 'asc' | 'desc';
  page: number;
  limit: number;
};

@Injectable()
export class BitacoraService {
  constructor(private prisma: PrismaService) {}

  private mapPersonType(input?: string): PersonaBitacora | undefined {
    if (!input) {
      return undefined;
    }

    const normalized = input.trim().toLowerCase();

    if (
      normalized !== 'visitante' &&
      normalized !== 'empleado' &&
      normalized !== 'proveedor'
    ) {
      throw new BadRequestException(
        'El tipo debe ser visitante, empleado o proveedor.',
      );
    }

    return normalized;
  }

  private resolveAccessMethod(
    codigoQr: string | null,
    comentarioAdmin: string | null,
  ): 'QR' | 'lista' | 'manual' {
    if (codigoQr) {
      return 'QR';
    }

    if (comentarioAdmin?.toLowerCase().includes('lista')) {
      return 'lista';
    }

    return 'manual';
  }

  private async resolveResidentScope(
    residentUserId?: string,
    residentName?: string,
  ) {
    if (!residentUserId && !residentName?.trim()) {
      throw new BadRequestException(
        'Se requiere residentUserId o residentName para consultar Mi bitacora de accesos.',
      );
    }

    if (residentUserId) {
      const residenteById = await this.prisma.residente.findFirst({
        where: {
          id_usuario: residentUserId,
        },
        select: {
          id_residente: true,
          id_vivienda: true,
          vivienda: {
            select: {
              numero_vivienda: true,
            },
          },
        },
      });

      if (!residenteById) {
        throw new ForbiddenException(
          'El usuario autenticado no pertenece al rol residente.',
        );
      }

      return residenteById;
    }

    const normalizedResidentName = residentName?.trim() ?? '';

    const residentsByName = await this.prisma.residente.findMany({
      where: {
        usuario: {
          persona: {
            nombre: {
              contains: normalizedResidentName,
              mode: 'insensitive',
            },
          },
        },
      },
      select: {
        id_residente: true,
        id_vivienda: true,
        vivienda: {
          select: {
            numero_vivienda: true,
          },
        },
        usuario: {
          select: {
            persona: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      take: 2,
    });

    if (residentsByName.length === 0) {
      throw new NotFoundException(
        'No se encontro un residente con ese nombre.',
      );
    }

    if (residentsByName.length > 1) {
      throw new BadRequestException(
        'El nombre del residente es ambiguo. Usa residentUserId para mayor precision.',
      );
    }

    return residentsByName[0];
  }

  private buildPersonTypeWhere(personType?: PersonaBitacora) {
    if (!personType) {
      return undefined;
    }

    if (personType === 'proveedor') {
      return {
        id_servicio: {
          not: null,
        },
      };
    }

    if (personType === 'empleado') {
      return {
        id_servicio: null,
        es_frecuente: true,
      };
    }

    return {
      id_servicio: null,
      es_frecuente: false,
    };
  }

  async obtenerMiBitacora(filters: MiBitacoraFilters) {
    const {
      residentUserId,
      residentName,
      search,
      personType,
      dateFrom,
      dateTo,
      sort,
      page,
      limit,
    } = filters;

    const residente = await this.resolveResidentScope(
      residentUserId,
      residentName,
    );

    const parsedPersonType = this.mapPersonType(personType);
    const orderDirection = sort === 'asc' ? 'asc' : 'desc';

    const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;
    const normalizedLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;

    const entradaRange: {
      gte?: Date;
      lte?: Date;
    } = {};

    if (dateFrom) {
      const parsedDateFrom = new Date(dateFrom);
      if (Number.isNaN(parsedDateFrom.getTime())) {
        throw new BadRequestException('dateFrom no tiene un formato valido.');
      }
      entradaRange.gte = parsedDateFrom;
    }

    if (dateTo) {
      const parsedDateTo = new Date(dateTo);
      if (Number.isNaN(parsedDateTo.getTime())) {
        throw new BadRequestException('dateTo no tiene un formato valido.');
      }
      entradaRange.lte = parsedDateTo;
    }

    if (
      entradaRange.gte &&
      entradaRange.lte &&
      entradaRange.gte > entradaRange.lte
    ) {
      throw new BadRequestException(
        'dateFrom no puede ser mayor que dateTo.',
      );
    }

    const visitorWhere: Record<string, unknown> = {
      residente: {
        id_vivienda: residente.id_vivienda,
      },
    };

    const personTypeWhere = this.buildPersonTypeWhere(parsedPersonType);
    if (personTypeWhere) {
      Object.assign(visitorWhere, personTypeWhere);
    }

    if (search?.trim()) {
      visitorWhere.nombre = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const where: Record<string, unknown> = {
      acceso: {
        visitante: visitorWhere,
      },
    };

    if (entradaRange.gte || entradaRange.lte) {
      where.fecha_hora_entrada = entradaRange;
    }

    const [rows, total, frecuencia] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,
        include: {
          guardia: {
            select: {
              id_guardia: true,
              nombre: true,
            },
          },
          acceso: {
            select: {
              codigo_qr: true,
              comentario_admin: true,
              visitante: {
                select: {
                  id_visitante: true,
                  nombre: true,
                  es_frecuente: true,
                  motivo: true,
                  id_servicio: true,
                },
              },
            },
          },
        },
        orderBy: {
          fecha_hora_entrada: orderDirection,
        },
        skip: (normalizedPage - 1) * normalizedLimit,
        take: normalizedLimit,
      }),
      this.prisma.bitacora.count({ where }),
      this.prisma.bitacora.groupBy({
        by: ['id_acceso'],
        where,
        _count: {
          id_bitacora: true,
        },
      }),
    ]);

    const data = rows.map((row) => {
      const visitante = row.acceso.visitante;
      const personTypeValue: PersonaBitacora = visitante.id_servicio
        ? 'proveedor'
        : visitante.es_frecuente
          ? 'empleado'
          : 'visitante';

      return {
        id_bitacora: row.id_bitacora,
        id_visitante: visitante.id_visitante,
        nombre_persona: visitante.nombre,
        tipo_persona: personTypeValue,
        fecha_hora_entrada: row.fecha_hora_entrada,
        fecha_hora_salida: row.fecha_hora_salida,
        metodo_acceso: this.resolveAccessMethod(
          row.acceso.codigo_qr,
          row.acceso.comentario_admin,
        ),
        guardia: {
          id_guardia: row.guardia.id_guardia,
          nombre: row.guardia.nombre,
        },
        es_frecuente: visitante.es_frecuente,
      };
    });

    return {
      data,
      meta: {
        total,
        page: normalizedPage,
        limit: normalizedLimit,
        totalPages: Math.max(1, Math.ceil(total / normalizedLimit)),
        sort: orderDirection,
      },
      frecuencia: {
        registros_totales: total,
        registros_frecuentes: data.filter((item) => item.es_frecuente).length,
        accesos_unicos: frecuencia.length,
      },
      vivienda: {
        id_vivienda: residente.id_vivienda,
        numero_vivienda: residente.vivienda.numero_vivienda,
      },
    };
  }

  async obtenerDetalleMiBitacora(
    idBitacora: string,
    residentUserId?: string,
    residentName?: string,
  ) {
    const residente = await this.resolveResidentScope(
      residentUserId,
      residentName,
    );

    const row = await this.prisma.bitacora.findUnique({
      where: {
        id_bitacora: idBitacora,
      },
      include: {
        guardia: {
          select: {
            id_guardia: true,
            nombre: true,
          },
        },
        acceso: {
          select: {
            codigo_qr: true,
            comentario_admin: true,
            visitante: {
              select: {
                id_residente: true,
                nombre: true,
                es_frecuente: true,
                motivo: true,
                url_imagen: true,
                id_servicio: true,
              },
            },
          },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('No se encontro el registro solicitado.');
    }

    const residenteDelRegistro = await this.prisma.residente.findUnique({
      where: {
        id_residente: row.acceso.visitante.id_residente,
      },
      select: {
        id_vivienda: true,
      },
    });

    if (!residenteDelRegistro || residenteDelRegistro.id_vivienda !== residente.id_vivienda) {
      throw new ForbiddenException('No tienes permiso para ver este registro.');
    }

    const personTypeValue: PersonaBitacora = row.acceso.visitante.id_servicio
      ? 'proveedor'
      : row.acceso.visitante.es_frecuente
        ? 'empleado'
        : 'visitante';

    return {
      id_bitacora: row.id_bitacora,
      nombre_persona: row.acceso.visitante.nombre,
      tipo_persona: personTypeValue,
      fecha_hora_entrada: row.fecha_hora_entrada,
      fecha_hora_salida: row.fecha_hora_salida,
      metodo_acceso: this.resolveAccessMethod(
        row.acceso.codigo_qr,
        row.acceso.comentario_admin,
      ),
      guardia: {
        id_guardia: row.guardia.id_guardia,
        nombre: row.guardia.nombre,
      },
      es_frecuente: row.acceso.visitante.es_frecuente,
      detalle: {
        foto_visitante: row.acceso.visitante.url_imagen,
        qr_utilizado: row.acceso.codigo_qr,
        notas_guardia_entrada: row.comentario,
        notas_guardia_salida: row.comentario_salida,
      },
    };
  }

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

  async actualizarFrecuenciaVisitante(
    idBitacora: string,
    esFrecuente: boolean,
    residentUserId?: string,
    residentName?: string,
  ) {
    const residente = await this.resolveResidentScope(
      residentUserId,
      residentName,
    );

    const bitacora = await this.prisma.bitacora.findUnique({
      where: { id_bitacora: idBitacora },
      include: {
        acceso: {
          select: {
            visitante: {
              select: {
                id_visitante: true,
                id_residente: true,
              },
            },
          },
        },
      },
    });

    if (!bitacora) {
      throw new NotFoundException('No se encontro el registro solicitado.');
    }

    const residenteDelRegistro = await this.prisma.residente.findUnique({
      where: { id_residente: bitacora.acceso.visitante.id_residente },
      select: { id_vivienda: true },
    });

    if (!residenteDelRegistro || residenteDelRegistro.id_vivienda !== residente.id_vivienda) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este registro.',
      );
    }

    const updatedVisitante = await this.prisma.visitante.update({
      where: { id_visitante: bitacora.acceso.visitante.id_visitante },
      data: { es_frecuente: esFrecuente },
      select: { id_visitante: true, es_frecuente: true },
    });

    return {
      id_visitante: updatedVisitante.id_visitante,
      es_frecuente: updatedVisitante.es_frecuente,
      message: esFrecuente
        ? 'Visitante marcado como frecuente'
        : 'Visitante removido de frecuentes',
    };
  }
}
