import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
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
    const { search, tipo, residencia, fecha_inicio, fecha_fin, ordenar, estado, page, limit } = filters;

    // 1. CORRECCIÓN: Iniciar el where vacío para no excluir a los residentes con visitante en null
    const where: any = {};

    // FILTRO ESTADO
    if (estado === 'dentro') {
      where.fecha_hora_salida = null;
    } else if (estado === 'fuera') {
      where.fecha_hora_salida = { not: null };
    }

    // SEARCH
    if (search) {
      where.acceso = {
        ...where.acceso,
        OR: [
          // Busca en el nombre del visitante
          { visitante: { nombre: { contains: search, mode: 'insensitive' } } },
          // Busca en el nombre del residente directo
          { usuario: { persona: { nombre: { contains: search, mode: 'insensitive' } } } }
        ]
      };
    }

    // FILTRO TIPO
    if (tipo && tipo !== 'todos') {
      const tipoNormalizado = tipo.toLowerCase();
      switch (tipoNormalizado) {
        case 'proveedor':
          where.acceso = {
            ...where.acceso,
            visitante: {
              servicio: {
                tipo_servicio: {
                  OR: [
                    { categoria: { contains: 'proveedor', mode: 'insensitive' } },
                    { categoria: { contains: 'repartidor', mode: 'insensitive' } },
                    { categoria: { contains: 'mantenimiento', mode: 'insensitive' } },
                    { nombre: { contains: 'proveedor', mode: 'insensitive' } },
                    { nombre: { contains: 'repartidor', mode: 'insensitive' } },
                    { nombre: { contains: 'mantenimiento', mode: 'insensitive' } }
                  ]
                }
              }
            }
          };
          break;
        case 'empleado_domestico':
          where.acceso = {
            ...where.acceso,
            visitante: {
              servicio: {
                tipo_servicio: {
                  OR: [{ categoria: { contains: 'empleado', mode: 'insensitive' } }]
                }
              },
            },
          };
          break;
        case 'visitante':
          where.acceso = {
            ...where.acceso,
            visitante: { es_frecuente: false, id_servicio: null },
          };
          break;
        case 'residente':
          where.acceso = {
            ...where.acceso,
            id_visitante: null, // Busca los accesos directos sin visitante
          };
          break;
        default:
          where.acceso = {
            ...where.acceso,
            visitante: { servicio: { tipo_servicio: { categoria: tipo } } },
          };
          break;
      }
    }

    // FILTRO RESIDENCIA
    if (residencia) {
      where.acceso = {
        ...where.acceso,
        OR: [
          // Si es visitante, busca la vivienda del residente asociado
          { visitante: { residente: { vivienda: { numero_vivienda: { contains: residencia, mode: 'insensitive' } } } } },
          // Si es un acceso directo de residente, busca su propia vivienda
          { usuario: { residentes: { some: { vivienda: { numero_vivienda: { contains: residencia, mode: 'insensitive' } } } } } }
        ]
      };
    }

    // FILTRO FECHAS
    if (fecha_inicio || fecha_fin) {
      where.fecha_hora_entrada = {};
      if (fecha_inicio) where.fecha_hora_entrada.gte = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_hora_entrada.lte = new Date(fecha_fin);
    }

    // ORDENAMIENTO
    let orderBy: any = { fecha_hora_entrada: 'desc' };
    switch (ordenar) {
      case 'antiguo': orderBy = { fecha_hora_entrada: 'asc' }; break;
      case 'nombre': orderBy = { acceso: { visitante: { nombre: 'asc' } } }; break;
      case 'tipo': orderBy = { acceso: { visitante: { servicio: { tipo_servicio: { nombre: 'asc' } } } } }; break;
    }

    const [data, total] = await Promise.all([
      this.prisma.bitacora.findMany({
        where,
        include: {
          acceso: {
            select: {
              codigo_qr: true,
              fecha_expiracion: true,
              // 2. CORRECCIÓN: Extraer los datos del usuario para pintar el nombre del residente
              usuario: {
                select: {
                  persona: { select: { nombre: true } },
                  residentes: {
                    select: {
                      vivienda: { select: { numero_vivienda: true } }
                    }
                  }
                }
              },
              visitante: {
                select: {
                  nombre: true,
                  motivo: true,
                  es_frecuente: true,
                  id_servicio: true,
                  residente: { select: { vivienda: { select: { numero_vivienda: true } } } },
                  servicio: {
                    select: {
                      nombre_empresa: true,
                      nombre_servicio: true,
                      cargo: true,
                      placas: true,
                      tipo_servicio: { select: { nombre: true, categoria: true } },
                    },
                  },
                },
              },
            },
          },
          guardia: { select: { nombre: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.bitacora.count({ where }),
    ]);

    const ahora = new Date();
    const registros = data.map((item) => {
      const expiracion = item.acceso.fecha_expiracion;
      const tiempoExcedido = item.fecha_hora_salida === null && expiracion && new Date(expiracion) < ahora;

      // 3. CORRECCIÓN: Lógica con encadenamiento opcional para evitar el error TS(18047)
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

      return {
        id: item.id_bitacora,
        // Si no hay visitante, tomamos el nombre del residente
        nombre: isResidenteDirecto ? item.acceso.usuario?.persona?.nombre : visitante.nombre,
        empresa: visitante?.servicio?.nombre_empresa ?? 'N/A',
        servicio_nombre: visitante?.servicio?.nombre_servicio ?? 'N/A',
        cargo_empleado: visitante?.servicio?.cargo ?? 'Sin cargo',
        placas: visitante?.servicio?.placas ?? 'Sin placas',
        motivo: visitante?.motivo ?? 'Sin motivo especificado',

        tipo_persona: isResidenteDirecto 
          ? 'residente' 
          : (visitante.es_frecuente ? 'empleado_domestico' : (visitante.servicio?.tipo_servicio?.categoria ?? 'visitante')),

        residente_asociado: {
          // Si es residente directo, buscamos su propia vivienda en el arreglo. 
          // Si es visitante, buscamos la vivienda del residente al que visita.
          nombre: isResidenteDirecto 
            ? (item.acceso.usuario?.residentes?.[0]?.vivienda?.numero_vivienda ?? 'Sin asignar') 
            : (visitante?.residente?.vivienda?.numero_vivienda ?? '-'),
          avatar_url: null,
        },
        fecha_entrada: item.fecha_hora_entrada,
        fecha_salida: item.fecha_hora_salida,
        metodo_acceso: metodoAccesoCalculado,
        guardia_registro: item.guardia.nombre,
        estado: item.fecha_hora_salida === null ? (tiempoExcedido ? 'excedido' : 'dentro') : 'fuera',
        avatar_url: null,
      };
    });

    return {
      data: registros,
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
        where: { id_usuario: id_guardia },
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
      throw new InternalServerErrorException(
        'Error interno del servidor al registrar salida.',
      );
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
                    select: { nombre_empresa: true, nombre_servicio: true, cargo: true, placas: true, tipo_servicio: true },
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

      // 4. CORRECCIÓN: Tratamiento seguro para nulos
      const visitante = registro.acceso.visitante;
      const isResidenteDirecto = !visitante; // Evaluamos si es un residente sin visitante

      let tipoPersona: string;
      if (isResidenteDirecto) {
        tipoPersona = 'residente';
      } else if (visitante.id_servicio) {
        tipoPersona = 'proveedor';
      } else if (visitante.es_frecuente) {
        tipoPersona = 'empleado_domestico';
      } else {
        tipoPersona = 'visitante';
      }

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
        nombre: isResidenteDirecto ? registro.acceso.usuario?.persona?.nombre : visitante.nombre,
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
        avatar_url: isResidenteDirecto ? registro.acceso.usuario?.persona?.url_imagen : (visitante?.url_imagen || null),
        empresa: visitante?.servicio?.nombre_empresa || undefined,
        motivo: visitante?.motivo || undefined,
        servicio_nombre: visitante?.servicio?.nombre_servicio || undefined,
        cargo_empleado: visitante?.servicio?.cargo || undefined,
        placas: visitante?.servicio?.placas || undefined,
        qr_utilizado: registro.acceso.codigo_qr || null,
        notas: registro.comentario ?? 'Sin comentarios',
        hora_validacion: registro.fecha_hora_entrada,
      };
    }
}
