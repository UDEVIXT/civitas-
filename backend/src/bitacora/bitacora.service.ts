import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

@Injectable()
export class BitacoraService {
  constructor(private prisma: PrismaService) {}

  private esEmpleadoDomestico(visitante: {
    id_servicio?: string | null;
    servicio?: {
      tipo_servicio?: {
        categoria?: string | null;
      } | null;
    } | null;
  } | null) {
    return (
      Boolean(visitante?.id_servicio) &&
      visitante?.servicio?.tipo_servicio?.categoria === 'Empleado'
    );
  }

  private obtenerTipoPersona(
    visitante: {
      id_servicio?: string | null;
      servicio?: {
        tipo_servicio?: {
          categoria?: string | null;
        } | null;
      } | null;
    } | null,
    isResidenteDirecto = false,
  ) {
    if (isResidenteDirecto) return 'residente';
    if (this.esEmpleadoDomestico(visitante)) return 'empleado_domestico';
    if (visitante?.id_servicio) return 'proveedor';
    return 'visitante';
  }

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
      id_guardia: { not: null },
    };
    const accesoFiltros: any[] = []; // <-- ARREGLO: Aquí apilaremos los filtros sin sobrescribirlos

    // FILTRO ESTADO
    if (estado === 'dentro') {
      where.fecha_hora_salida = null;
    } else if (estado === 'fuera') {
      where.fecha_hora_salida = { not: null };
    }

    const filtroFechaRechazo: any = {};

    // FILTRO FECHAS
    if (fecha_inicio || fecha_fin) {
      where.fecha_hora_entrada = {};
      if (fecha_inicio) {
        const inicio = new Date(fecha_inicio);
        where.fecha_hora_entrada.gte = inicio;
        filtroFechaRechazo.gte = inicio;
      }
      if (fecha_fin) {
        const fin = new Date(fecha_fin);
        where.fecha_hora_entrada.lte = fin;
        filtroFechaRechazo.lte = fin;
      }
    }

    // SEARCH (Búsqueda por Nombre)
    if (search) {
      accesoFiltros.push({
        visitante: { nombre: { contains: search, mode: 'insensitive' } },
      });
    }

    // FILTRO RESIDENCIA (Búsqueda por Propiedad)
    if (residencia) {
      accesoFiltros.push({
        visitante: {
          residente: {
            vivienda: {
              numero_vivienda: {
                startsWith: residencia,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }

    // FILTRO TIPO
    if (tipo && tipo !== 'todos') {
      const tipoNormalizado = tipo.toLowerCase();
      switch (tipoNormalizado) {
        case 'proveedor':
          accesoFiltros.push({
            visitante: {
              id_servicio: { not: null },
              NOT: {
                servicio: {
                  tipo_servicio: {
                    categoria: 'Empleado',
                  },
                },
              },
            },
          });
          break;
        case 'empleado_domestico':
          accesoFiltros.push({
            visitante: {
              id_servicio: { not: null },
              servicio: {
                tipo_servicio: {
                  categoria: 'Empleado',
                },
              },
            },
          });
          break;
        case 'visitante':
          accesoFiltros.push({
            visitante: { id_servicio: null },
          });
          break;
        case 'residente':
          accesoFiltros.push({
            id_visitante: null,
          });
          break;
      }
    }

    // Si recolectamos filtros de acceso, los unimos todos con un AND seguro
    if (accesoFiltros.length > 0) {
      where.acceso = { AND: accesoFiltros };
    }

    // ORDENAMIENTO
    let orderBy: any = { fecha_hora_entrada: 'desc' };
    switch (ordenar) {
      case 'antiguo':
        orderBy = { fecha_hora_entrada: 'asc' };
        break;
      case 'nombre':
        orderBy = { acceso: { visitante: { nombre: 'asc' } } };
        break;
      case 'tipo':
        orderBy = {
          acceso: {
            visitante: { servicio: { tipo_servicio: { nombre: 'asc' } } },
          },
        };
        break;
    }

    const incluirRechazados = !estado || estado === 'todos';

    const [data, rechazos] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,
        include: {
          acceso: {
            select: {
              codigo_qr: true,
              fecha_expiracion: true,
              usuario: {
                select: {
                  persona: { select: { nombre: true } },
                  residentes: {
                    select: {
                      vivienda: { select: { numero_vivienda: true } },
                    },
                  },
                },
              },
              visitante: {
                select: {
                  nombre: true,
                  motivo: true,
                  es_frecuente: true,
                  id_servicio: true,
                  residente: {
                    select: { vivienda: { select: { numero_vivienda: true } } },
                  },
                  servicio: {
                    select: {
                      nombre_empresa: true,
                      nombre_servicio: true,
                      cargo: true,
                      placas: true,
                      tipo_servicio: {
                        select: { nombre: true, categoria: true },
                      },
                    },
                  },
                },
              },
            },
          },
          guardia: { select: { nombre: true } },
          guardia_salida: { select: { nombre: true } },
        },
        orderBy,
      }),
      incluirRechazados
        ? this.prisma.bitacoraQrVisitante.findMany({
            where: {
              accion: 'RECHAZADO',
              ...(Object.keys(filtroFechaRechazo).length > 0 && {
                fecha_hora: filtroFechaRechazo,
              }),
              acceso:
                accesoFiltros.length > 0 ? { AND: accesoFiltros } : undefined,
            },
            include: {
              usuario: {
                select: {
                  persona: { select: { nombre: true } },
                  guardias: { select: { nombre: true } },
                },
              },
              acceso: {
                select: {
                  codigo_qr: true,
                  fecha_expiracion: true,
                  usuario: {
                    select: {
                      persona: { select: { nombre: true } },
                      residentes: {
                        select: {
                          vivienda: {
                            select: { numero_vivienda: true },
                          },
                        },
                      },
                    },
                  },
                  visitante: {
                    select: {
                      nombre: true,
                      motivo: true,
                      es_frecuente: true,
                      id_servicio: true,
                      residente: {
                        select: {
                          vivienda: {
                            select: { numero_vivienda: true },
                          },
                        },
                      },
                      servicio: {
                        select: {
                          nombre_empresa: true,
                          nombre_servicio: true,
                          cargo: true,
                          placas: true,
                          tipo_servicio: {
                            select: { nombre: true, categoria: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { fecha_hora: ordenar === 'antiguo' ? 'asc' : 'desc' },
          })
        : Promise.resolve([]),
    ]);

    const ahora = new Date();
    const registrosAceptados = data.map((item) => {
      const expiracion = item.acceso.fecha_expiracion;
      const tiempoExcedido =
        item.fecha_hora_salida === null &&
        expiracion &&
        new Date(expiracion) < ahora;

      const visitante = item.acceso.visitante;
      const isResidenteDirecto = !visitante;

      let metodoAccesoCalculado: string;
      if (isResidenteDirecto) {
        metodoAccesoCalculado = item.acceso.codigo_qr ? 'QR' : 'Manual';
      } else if (visitante.es_frecuente) {
        metodoAccesoCalculado = 'Lista';
      } else if (item.acceso.codigo_qr) {
        metodoAccesoCalculado = 'QR';
      } else {
        metodoAccesoCalculado = 'Manual';
      }

      let residenteNombre: string;
      if (isResidenteDirecto) {
        residenteNombre =
          item.acceso.usuario?.residentes?.[0]?.vivienda?.numero_vivienda ??
          'Sin asignar';
      } else {
        residenteNombre =
          visitante?.residente?.vivienda?.numero_vivienda ?? '-';
      }

      return {
        id: item.id_bitacora,
        nombre: isResidenteDirecto
          ? item.acceso.usuario?.persona?.nombre
          : visitante.nombre,
        empresa: visitante?.servicio?.nombre_empresa ?? 'N/A',
        servicio_nombre: visitante?.servicio?.nombre_servicio ?? 'N/A',
        cargo_empleado: visitante?.servicio?.cargo ?? 'Sin cargo',
        placas: visitante?.servicio?.placas ?? 'Sin placas',
        motivo: visitante?.motivo ?? 'Sin motivo especificado',
        comentario_salida: item.comentario_salida ?? '',

        tipo_persona: this.obtenerTipoPersona(visitante, isResidenteDirecto),

        residente_asociado: {
          // Si es residente directo, buscamos su propia vivienda en el arreglo.
          // Si es visitante, buscamos la vivienda del residente al que visita.
          nombre: residenteNombre,
          avatar_url: null,
        },
        fecha_entrada: item.fecha_hora_entrada,
        fecha_salida: item.fecha_hora_salida,
        metodo_acceso: metodoAccesoCalculado,
        guardia_registro: item.guardia?.nombre ?? 'N/A',
        guardia_salida: item.guardia_salida?.nombre ?? 'Pendiente',
        estado:
          item.fecha_hora_salida === null
            ? tiempoExcedido
              ? 'excedido'
              : 'dentro'
            : 'fuera',
        avatar_url: null,
      };
    });

    const registrosRechazados = rechazos.map((item) => {
      const visitante = item.acceso.visitante;
      const isResidenteDirecto = !visitante;
      const residenteNombre = isResidenteDirecto
        ? (item.acceso.usuario?.residentes?.[0]?.vivienda?.numero_vivienda ??
          'Sin asignar')
        : (visitante?.residente?.vivienda?.numero_vivienda ?? '-');

      return {
        id: `rechazo_${item.id_bitacora_qr}`,
        nombre: isResidenteDirecto
          ? item.acceso.usuario?.persona?.nombre
          : visitante?.nombre,
        empresa: visitante?.servicio?.nombre_empresa ?? 'N/A',
        servicio_nombre: visitante?.servicio?.nombre_servicio ?? 'N/A',
        cargo_empleado: visitante?.servicio?.cargo ?? 'Sin cargo',
        placas: visitante?.servicio?.placas ?? 'Sin placas',
        motivo: visitante?.motivo ?? 'Sin motivo especificado',
        motivo_rechazo: item.motivo ?? 'Sin motivo registrado',
        comentario_salida: '',
        tipo_persona: this.obtenerTipoPersona(visitante, isResidenteDirecto),
        residente_asociado: {
          nombre: residenteNombre,
          avatar_url: null,
        },
        fecha_entrada: null,
        fecha_salida: null,
        fecha_rechazo: item.fecha_hora,
        metodo_acceso: item.acceso.codigo_qr ? 'QR' : 'Manual',
        guardia_registro:
          item.usuario.guardias?.nombre ??
          item.usuario.persona?.nombre ??
          'N/A',
        guardia_salida: 'N/A',
        estado: 'rechazado',
        avatar_url: null,
      };
    });

    const registros = [...registrosAceptados, ...registrosRechazados].sort(
      (a: any, b: any) => {
        const fechaA = new Date(
          a.fecha_entrada ?? a.fecha_rechazo ?? 0,
        ).getTime();
        const fechaB = new Date(
          b.fecha_entrada ?? b.fecha_rechazo ?? 0,
        ).getTime();

        return ordenar === 'antiguo' ? fechaA - fechaB : fechaB - fechaA;
      },
    );
    const total = registros.length;
    const paginados = registros.slice((page - 1) * limit, page * limit);

    return {
      data: paginados,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  // HU-1.9.1: Registrar salida (Individual o Masiva)
  async registrarSalida(
    id_bitacora: string | string[],
    id_guardia: string,
    comentario_salida?: string,
  ) {
    try {
      const guardiaInfo = await this.prisma.guardia.findFirst({
        where: {
          id_usuario: id_guardia,
        },
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
          id_bitacora: {
            in: ids,
          },
          fecha_hora_salida: null,
        },
        data: {
          fecha_hora_salida: new Date(),
          comentario_salida: textoSalida,
          id_guardia_salida: guardiaInfo.id_guardia,
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
        guardia_salida: guardiaInfo.nombre,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno del servidor al registrar salida.',
      );
    }
  }

  async actualizarFrecuenciaVisitante(
    idBitacora: string,
    esFrecuente: boolean,
    requestedBy?: { username?: string; role?: string },
  ) {
    const registro = await this.prisma.bitacora.findUnique({
      where: { id_bitacora: idBitacora },
      include: {
        acceso: {
          include: {
            visitante: {
              include: {
                residente: {
                  include: {
                    usuario: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado.');
    }

    // NUEVO: Aislamiento estricto para evitar TS18047
    if (!registro.acceso.visitante) {
      throw new ConflictException(
        'No se puede actualizar la frecuencia: este registro pertenece a un residente directo.',
      );
    }

    if (requestedBy?.role === 'Residente') {
      const residentUsername = requestedBy.username ?? '';
      const ownerUsername =
        registro.acceso.visitante.residente?.usuario?.nombre_usuario ?? '';

      if (!residentUsername || residentUsername !== ownerUsername) {
        throw new ForbiddenException(
          'No tienes permiso para modificar este registro.',
        );
      }
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
              nombre_usuario: residentUserId,
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
      where.acceso.visitante.NOT = {
        servicio: {
          tipo_servicio: {
            categoria: 'Empleado',
          },
        },
      };
    } else if (personType === 'empleado') {
      where.acceso.visitante.id_servicio = { not: null };
      where.acceso.visitante.servicio = {
        tipo_servicio: {
          categoria: 'Empleado',
        },
      };
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
    // Transform to include tipo_persona
    const registros = data
      .map((bitacora) => {
        const visitante = bitacora.acceso.visitante;

        // NUEVO: Validación explícita para satisfacer al compilador de TypeScript
        if (!visitante) return null;

        let tipoPersona: 'visitante' | 'empleado' | 'proveedor';

        if (this.esEmpleadoDomestico(visitante)) {
          tipoPersona = 'empleado';
        } else if (visitante.id_servicio) {
          tipoPersona = 'proveedor';
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
          metodo_acceso: visitante.es_frecuente
            ? 'lista'
            : bitacora.acceso.codigo_qr
              ? 'QR'
              : 'manual',
          guardia: bitacora.guardia
            ? {
                id_guardia: bitacora.guardia.id_guardia,
                nombre: bitacora.guardia.nombre,
              }
            : null,
          es_frecuente: visitante.es_frecuente,
        };
      })
      .filter((item) => item !== null); // NUEVO: Filtramos los valores nulos del arreglo resultante

    return {
      data: registros,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Detalle de registro en bitácora a partir de su ID

  async obtenerDetalleRegistro(
    id: string,
    requestedBy?: { username?: string; role?: string },
  ) {
    if (id.startsWith('rechazo_')) {
      const idRechazo = id.replace('rechazo_', '');
      const rechazo = await this.prisma.bitacoraQrVisitante.findUnique({
        where: { id_bitacora_qr: idRechazo },
        include: {
          usuario: {
            include: {
              persona: true,
              guardias: true,
            },
          },
          acceso: {
            include: {
              usuario: {
                include: { persona: true },
              },
              visitante: {
                include: {
                  residente: {
                    include: {
                      usuario: true,
                    },
                  },
                  servicio: {
                    select: {
                      nombre_empresa: true,
                      nombre_servicio: true,
                      cargo: true,
                      placas: true,
                      tipo_servicio: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!rechazo || rechazo.accion !== 'RECHAZADO') {
        throw new NotFoundException('Registro de rechazo no encontrado');
      }

      if (requestedBy?.role === 'Residente') {
        const residentUsername = requestedBy.username ?? '';
        const ownerUsername = rechazo.acceso.visitante
          ? (rechazo.acceso.visitante.residente?.usuario?.nombre_usuario ?? '')
          : (rechazo.acceso.usuario?.nombre_usuario ?? '');

        if (!residentUsername || residentUsername !== ownerUsername) {
          throw new ForbiddenException(
            'No tienes permiso para ver este registro.',
          );
        }
      }

      const visitante = rechazo.acceso.visitante;
      const isResidenteDirecto = !visitante;
      const tipoPersona = this.obtenerTipoPersona(visitante, isResidenteDirecto);

      return {
        id,
        nombre: isResidenteDirecto
          ? rechazo.acceso.usuario?.persona?.nombre
          : visitante?.nombre,
        tipo_persona: tipoPersona,
        residente_asociado: {
          nombre: rechazo.acceso.usuario?.persona?.nombre || '-',
          avatar_url: rechazo.acceso.usuario?.persona?.url_imagen || null,
        },
        fecha_entrada: null,
        fecha_salida: null,
        fecha_rechazo: rechazo.fecha_hora,
        metodo_acceso: rechazo.acceso.codigo_qr ? 'QR' : 'manual',
        guardia_registro:
          rechazo.usuario.guardias?.nombre ??
          rechazo.usuario.persona?.nombre ??
          'No registrado',
        estado: 'rechazado',
        avatar_url: isResidenteDirecto
          ? rechazo.acceso.usuario?.persona?.url_imagen
          : visitante?.url_imagen || null,
        empresa: visitante?.servicio?.nombre_empresa || undefined,
        motivo: visitante?.motivo || undefined,
        motivo_rechazo: rechazo.motivo || 'Sin motivo registrado',
        servicio_nombre: visitante?.servicio?.nombre_servicio || undefined,
        cargo_empleado: visitante?.servicio?.cargo || undefined,
        placas: visitante?.servicio?.placas || undefined,
        qr_utilizado: rechazo.acceso.codigo_qr || null,
        notas: rechazo.motivo || 'Sin motivo registrado',
        comentario_salida: null,
        hora_validacion: null,
      };
    }

    const registro = await this.prisma.bitacora.findUnique({
      where: { id_bitacora: id },
      include: {
        acceso: {
          include: {
            visitante: {
              include: {
                residente: {
                  include: {
                    usuario: true,
                  },
                },
                servicio: {
                  select: {
                    nombre_empresa: true,
                    nombre_servicio: true,
                    cargo: true,
                    placas: true,
                    tipo_servicio: true,
                  },
                },
              },
            },
            usuario: {
              include: { persona: true },
            },
          },
        },
        guardia: true,
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro no encontrado');
    }

    if (requestedBy?.role === 'Residente') {
      const residentUsername = requestedBy.username ?? '';
      const ownerUsername = registro.acceso.visitante
        ? (registro.acceso.visitante.residente?.usuario?.nombre_usuario ?? '')
        : (registro.acceso.usuario?.nombre_usuario ?? '');

      if (!residentUsername || residentUsername !== ownerUsername) {
        throw new ForbiddenException(
          'No tienes permiso para ver este registro.',
        );
      }
    }

    // 4. CORRECCIÓN: Tratamiento seguro para nulos
    const visitante = registro.acceso.visitante;
    const isResidenteDirecto = !visitante; // Evaluamos si es un residente sin visitante
    const isProveedor =
      !!visitante?.id_servicio && !this.esEmpleadoDomestico(visitante);
    if (isProveedor) {
      const empresa = visitante?.servicio?.nombre_empresa;
      const servicio = visitante?.servicio?.nombre_servicio;

      if (!empresa || !servicio) {
        return {
          id: registro.id_bitacora,
          bloqueado: true,
          motivo_bloqueo: 'CA003',
          mensaje:
            'Proveedor con información incompleta (empresa o servicio faltante).',
          estado: 'bloqueado_datos_incompletos',
        };
      }
    }

    const tipoPersona = this.obtenerTipoPersona(visitante, isResidenteDirecto);

    let metodoAcceso: string;
    if (isResidenteDirecto) {
      metodoAcceso = registro.acceso.codigo_qr ? 'QR' : 'manual';
    } else if (visitante.es_frecuente) {
      metodoAcceso = 'lista';
    } else if (registro.acceso.codigo_qr) {
      metodoAcceso = 'QR';
    } else {
      metodoAcceso = 'manual';
    }

    const estado = registro.fecha_hora_salida ? 'salida' : 'entrada';

    return {
      id: registro.id_bitacora,
      // Usamos el nombre del residente si visitante es null
      nombre: isResidenteDirecto
        ? registro.acceso.usuario?.persona?.nombre
        : visitante.nombre,
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
      // Usamos ?. (optional chaining) para evitar el error en TypeScript
      avatar_url: isResidenteDirecto
        ? registro.acceso.usuario?.persona?.url_imagen
        : visitante?.url_imagen || null,
      empresa: visitante?.servicio?.nombre_empresa || undefined,
      motivo: visitante?.motivo || undefined,
      servicio_nombre: visitante?.servicio?.nombre_servicio || undefined,
      cargo_empleado: visitante?.servicio?.cargo || undefined,
      placas: visitante?.servicio?.placas || undefined,
      qr_utilizado: registro.acceso.codigo_qr || null,
      notas: registro.comentario ?? 'Sin comentarios',
      comentario_salida: registro.comentario_salida || null,
      hora_validacion: registro.fecha_hora_entrada,
    };
  }

  // Devuelve los nombres de usuario de los residentes asociados a una lista
  // de `id_bitacora`. Esto se usa para notificar sólo a los residentes
  // cuyos registros se vieron afectados por una operación (por ejemplo,
  // registrar salida).
  async getResidentUsernamesForRegistroIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    const registros = (await this.prisma.bitacora.findMany({
      where: { id_bitacora: { in: ids } },
      select: {
        id_bitacora: true,
        acceso: {
          select: {
            visitante: {
              select: {
                residente: {
                  select: { usuario: { select: { nombre_usuario: true } } },
                },
              },
            },
            usuario: { select: { nombre_usuario: true } },
          },
        },
      },
    })) as Array<{
      id_bitacora: string;
      acceso: {
        visitante?: {
          residente?: { usuario?: { nombre_usuario?: string } };
        };
        usuario?: { nombre_usuario?: string } | null;
      };
    }>;

    const usernames = new Set<string>();
    for (const r of registros) {
      const visitante = r.acceso?.visitante;
      if (
        visitante &&
        visitante.residente &&
        visitante.residente.usuario &&
        visitante.residente.usuario.nombre_usuario
      ) {
        usernames.add(visitante.residente.usuario.nombre_usuario);
      } else if (
        r.acceso &&
        r.acceso.usuario &&
        r.acceso.usuario.nombre_usuario
      ) {
        usernames.add(r.acceso.usuario.nombre_usuario);
      }
    }

    return Array.from(usernames);
  }

  async desactivarQr(codigo_qr: string, id_usuario: string, motivo: string) {
    const accesoActual = await this.prisma.acceso.findUnique({
      where: { codigo_qr: codigo_qr },
      include: {
        bitacora: {
          orderBy: {
            fecha_hora_entrada: 'desc',
          },
          take: 1,
        },
      },
    });

    // NTH001: Si el código QR escaneado no existe en el sistema
    if (!accesoActual) {
      throw new NotFoundException('El código de acceso escaneado no existe.');
    }

    /*const ultimoMovimiento = accesoActual.bitacora[0];
    if (ultimoMovimiento && !ultimoMovimiento.fecha_hora_salida) {
      throw new BadRequestException(
        'No se puede desactivar el código QR porque el visitante se encuentra actualmente dentro del residencial. Registre su salida primero.',
      );
    }*/

    // CA004: Si el QR ya expiró o fue desactivado previamente
    if (accesoActual.estatus === 'Inactivo') {
      throw new BadRequestException(
        'Este código QR ya se encuentra desactivado.',
      );
    }

    // CA008: Validar obligatoriamente el motivo para cumplir las políticas del residencial
    if (!motivo || motivo.trim().length === 0) {
      throw new BadRequestException(
        'La política del residencial exige capturar un motivo para desactivar el QR.',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // CA006: Transacción segura
      const accesoActualizado = await tx.acceso.update({
        where: { id_acceso: accesoActual.id_acceso },
        data: { estatus: 'Inactivo' },
      });

      // CA007: Creamos el registro en el historial de desactivaciones con relaciones limpias
      const historial = await tx.bitacoraDesactivacionQr.create({
        data: {
          id_acceso: accesoActual.id_acceso,
          id_usuario,
          motivo: motivo.trim(),
        },
      });

      return {
        acceso: accesoActualizado,
        historial,
      };
    });
  }
}
