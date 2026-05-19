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

  private readonly dayOrder = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO',
  ];

  private readonly dayLabel: Record<string, string> = {
    LUNES: 'Lun',
    MARTES: 'Mar',
    MIERCOLES: 'Mie',
    JUEVES: 'Jue',
    VIERNES: 'Vie',
    SABADO: 'Sab',
    DOMINGO: 'Dom',
  };

  private parseTime(value: Date | string) {
    if (value instanceof Date) {
      return { hours: value.getUTCHours(), minutes: value.getUTCMinutes() };
    }

    if (typeof value === 'string' && value.includes('T')) {
      const date = new Date(value);
      return { hours: date.getUTCHours(), minutes: date.getUTCMinutes() };
    }

    const [hours, minutes] = String(value).split(':');
    return { hours: Number(hours), minutes: Number(minutes) };
  }

  private formatTime(value: Date | string) {
    const { hours, minutes } = this.parseTime(value);
    const period = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours % 12 || 12;
    if (minutes === 0) {
      return `${hours12}${period}`;
    }

    const padded = String(minutes).padStart(2, '0');
    return `${hours12}:${padded}${period}`;
  }

  private buildHorarioTexto(
    horarios: Array<{
      dia_semana: string;
      hora_inicio: Date | string;
      hora_fin: Date | string;
    }>,
  ) {
    if (!horarios.length) {
      return '';
    }
    const byDay = new Map<string, typeof horarios>();
    for (const horario of horarios) {
      const current = byDay.get(horario.dia_semana) ?? [];
      current.push(horario);
      byDay.set(horario.dia_semana, current);
    }

    const orderedDays = this.dayOrder.filter((day) => byDay.has(day));
    const firstDay = orderedDays[0];
    const lastDay = orderedDays[orderedDays.length - 1];

    const parts: string[] = [];

    const buildRangeForDay = (day: string) => {
      const dayHorarios = byDay.get(day) ?? [];
      if (!dayHorarios.length) {
        return null;
      }

      const toMinutes = (value: Date | string) => {
        const { hours, minutes } = this.parseTime(value);
        return hours * 60 + minutes;
      };

      const sortedByStart = dayHorarios
        .slice()
        .sort((a, b) => toMinutes(a.hora_inicio) - toMinutes(b.hora_inicio));
      const sortedByEnd = dayHorarios
        .slice()
        .sort((a, b) => toMinutes(a.hora_fin) - toMinutes(b.hora_fin));

      const start = sortedByStart[0];
      const end = sortedByEnd[sortedByEnd.length - 1];

      return `${this.dayLabel[day] ?? day}: ${this.formatTime(
        start.hora_inicio,
      )} - ${this.formatTime(end.hora_fin)}`;
    };

    if (firstDay) {
      const firstText = buildRangeForDay(firstDay);
      if (firstText) {
        parts.push(firstText);
      }
    }

    if (lastDay && lastDay !== firstDay) {
      const lastText = buildRangeForDay(lastDay);
      if (lastText) {
        parts.push(lastText);
      }
    }

    return parts.join(' | ');
  }

  //HU-1.5.6: Administrador puede ver empleados domesticos dentro del residencial
 // HU-1.5.6: Administrador puede ver empleados domesticos dentro del residencial
 // HU-1.5.6: El endpoint ahora traerá cualquier visitante con servicio asociado
  // HU-1.5.6: El endpoint ahora traerá cualquier visitante con servicio asociado
  async obtenerEmpleados(filters: {
    search?: string;
    page: number;
    limit?: number;
    isActive?: boolean;
    byUsuarioId?: string;
    byViviendaId?: string;
  }) {
    const {
      search,
      page,
      limit,
      isActive,
      byUsuarioId,
      byViviendaId,
    } = filters;

    const where: any = {
      servicio: {},
    };

    // 🔎 Buscar por nombre
    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // 👤 Filtrar por usuario (CORRECTO)
    if (byUsuarioId) {
      where.residente = {
        usuario: {
          id_usuario: byUsuarioId,
        },
      };
    }

    // 🏠 Filtrar por vivienda (CORRECTO)
    if (byViviendaId) {
      where.residente = {
        vivienda: {
          id_vivienda: byViviendaId,
        },
      };
    }

    // ⚡ Filtrar por estado del servicio (CORRECTO)
    if (isActive !== undefined) {
      where.servicio = {
        activo: isActive,
      };
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
              id_servicio: true,
              nombre_servicio: true,
              activo: true,
              cargo: true,
              nombre_empresa: true,
              placas: true,

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
              id_residente: true,
              id_usuario: true,

              vivienda: {
                select: {
                  id_vivienda: true,
                  numero_vivienda: true,
                },
              },

              usuario: {
                select: {
                  id_usuario: true,
                  nombre_usuario: true,
                  correo: true,
                },
              },
            },
          },
        },

        skip: (page - 1) * (limit ?? 10),
        take: limit ?? 10,
      }),

      this.prisma.visitante.count({
        where,
      }),
    ]);

    const dataWithHorario = data.map((item) => {
      if (!item.servicio) return item;

      const horario_texto = this.buildHorarioTexto(
        item.servicio.horarios ?? [],
      );

      return {
        ...item,
        servicio: {
          ...item.servicio,
          horario_texto,
        },
      };
    });

    return {
      success: true,
      meta: {
        total,
        page,
        limit: limit ?? 10,
        total_pages: limit ? Math.ceil(total / limit) : 1,
      },
      data: dataWithHorario,
    };
  }

  async obtenerServicio(id_visitante: string) {
    const visitante = await this.prisma.visitante.findUnique({
      where: {
        id_visitante,
      },

      select: {
        nombre: true,
        id_visitante: true,
        id_servicio: true,
      },
    });

    // Error 404
    if (!visitante) {
      throw new NotFoundException(
        "No se encontró ningún empleado con el ID proporcionado.",
      );
    }

    // Error 400
    if (!visitante.id_servicio) {
      throw new BadRequestException(
        "El registro de ${visitante.nombre} no está configurado como un empleado de servicio.",
      );
    }

    // Buscar servicio asociado
    const servicio = await this.prisma.servicio.findFirst({
      where: {
        id_servicio: visitante.id_servicio,
      },

      select: {
        id_servicio: true,
      },
    });

    if (!servicio) {
      throw new NotFoundException(
        "El empleado que deseas actualizar no está registrado.",
      );
    }

    return {
      id_servicio: servicio.id_servicio,
      id_visitante: visitante.id_visitante,
      nombre: visitante.nombre,
    };
  }


  /*
  async actualizarEmpleado(id: string, data: any) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Buscamos el registro para obtener la conexión con la tabla Servicio
        const visitante = await tx.visitante.findUnique({
          where: { id_visitante: id },
          select: { id_servicio: true },
        });

        if (!visitante) throw new NotFoundException('Empleado no encontrado');

        // 2. Actualizamos los datos personales en la tabla Visitante
        await tx.visitante.update({
          where: { id_visitante: id },
          data: {
            nombre: data.nombre,
            telefono: data.telefono,
            url_imagen: data.url_imagen,
          },
        });

        // 3. Si tiene un servicio, actualizamos el tipo y los horarios
        if (visitante.id_servicio) {
          await tx.servicio.update({
            where: { id_servicio: visitante.id_servicio },
            data: {
              id_tipo_servicio: data.id_tipo_servicio,
              horarios: {
                // Borramos horarios actuales para evitar duplicados (CA005)
                deleteMany: {},
                create: data.horarios.map((h: any) => ({
                  dia_semana: h.dia_semana,
                  // Guardamos como Date completo para preservar UTC y que el front maneje la zona
                  hora_inicio: new Date(`1970-01-01T${h.hora_inicio}:00.000Z`),
                  hora_fin: new Date(`1970-01-01T${h.hora_fin}:00.000Z`),
                  activo: true,
                })),
              },
            },
          });
        }

        // 4. Actualizar bitácora en la tabla Acceso (CA007/008)
        await tx.acceso.updateMany({
          where: { id_visitante: id, estatus: 'Activo' },
          data: { comentario_admin: 'Información actualizada por residente' },
        });

        return { statusCode: 200, message: 'Empleado actualizado con éxito' };
      });
    } catch (error: any) {
      console.error('Error en actualizarEmpleado:', error);
      throw new InternalServerErrorException({
        message: 'No se pudo actualizar el registro',
        error: error.message,
      });
    }
  }
*/

async actualizarEmpleado(id: string, data: any) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Buscamos el registro para obtener la conexión con la tabla Servicio
        const visitante = await tx.visitante.findUnique({
          where: { id_visitante: id },
          select: { id_servicio: true },
        });

        if (!visitante) throw new NotFoundException('Empleado no encontrado');

        // 2. Actualizamos los datos personales en la tabla Visitante
        await tx.visitante.update({
          where: { id_visitante: id },
          data: {
            nombre: data.nombre,
            telefono: data.telefono,
            // Soporta tanto url_imagen como foto que viene de tu modal
            url_imagen: data.url_imagen || data.foto,
          },
        });

        // 3. Si tiene un servicio, procesamos el cargo y construimos el array de horarios dinámicamente
        if (visitante.id_servicio) {
          
          // Diccionario para traducir los días del checkbox al ENUM de Postgres
          const mapeoDias: Record<string, string> = {
            'Lunes': 'LUNES',
            'Martes': 'MARTES',
            'Miércoles': 'MIERCOLES',
            'Jueves': 'JUEVES',
            'Viernes': 'VIERNES',
            'Sábado': 'SABADO',
            'Domingo': 'DOMINGO'
          };

          // Si el front manda el array directo en data.dias_autorizados
          const diasSeleccionados: string[] = data.dias_autorizados || [];

          // Construimos el arreglo mapeado que Prisma necesita para HorarioAccesoServicios
          const nuevosHorarios = diasSeleccionados.map((dia: string) => {
            const diaEnum = mapeoDias[dia];
            if (!diaEnum) return null;

            // Extraemos las horas usando los nombres planos de tu modal
            const entrada = data.hora_entrada || '08:00';
            const salida = data.hora_salida || '16:00';

            return {
              dia_semana: diaEnum,
              // Convertimos a Date para el tipo @db.Time(6) de PostgreSQL
              hora_inicio: new Date(`1970-01-01T${entrada}:00.000Z`),
              hora_fin: new Date(`1970-01-01T${salida}:00.000Z`),
              activo: true,
            };
          }).filter(Boolean); // Limpiamos elementos nulos

          await tx.servicio.update({
            where: { id_servicio: visitante.id_servicio },
            data: {
              cargo: data.cargo, // Guardamos el rol seleccionado ("Limpieza", "Nana", etc.)
              horarios: {
                // Borramos los horarios viejos para evitar que se amontonen o dupliquen
                deleteMany: {},
                // Insertamos el bloque de nuevos días autorizados
                create: nuevosHorarios as any,
              },
            },
          });
        }

        // 4. Actualizar bitácora en la tabla Acceso
        await tx.acceso.updateMany({
          where: { id_visitante: id, estatus: 'Activo' },
          data: { comentario_admin: 'Información actualizada por residente' },
        });

        return { success: true, statusCode: 200, message: 'Empleado actualizado con éxito' };
      });
    } catch (error: any) {
      console.error('Error en actualizarEmpleado:', error);
      throw new InternalServerErrorException({
        message: 'No se pudo actualizar el registro',
        error: error.message,
      });
    }
  }

  
  async eliminarEmpleado(id: string, motivo?: string, id_residente?: string) {
    try {
      const servicio = await this.obtenerServicio(id);

      let nombreAutor = 'Residente';
      if (id_residente) {
        const residente = await this.prisma.residente.findUnique({
          where: { id_residente },
          include: { usuario: { include: { persona: true } } }
        });
        if (residente?.usuario?.persona?.nombre) {
          nombreAutor = residente.usuario.persona.nombre;
        }
      }

      const fechaActual = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
      const comentarioEstructurado = `Baja por: ${nombreAutor} el ${fechaActual}. Motivo: ${motivo || 'No especificado'}`;

      // Borrado lógico
      await this.prisma.servicio.update({
        where: { id_servicio: servicio.id_servicio },
        data: {
          activo: false,
        },
      });

      //Revocar su QR
      await this.prisma.acceso.updateMany({
        where: { id_visitante: servicio.id_visitante },
        data: {
          estatus: 'Inactivo',
          comentario_admin: comentarioEstructurado,
        },
      });

      return {
        statusCode: 200,
        message: `El empleado ${servicio.nombre} ha sido dado de baja exitosamente.`,
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

  async reactivarEmpleado(id: string, id_residente?: string) {
    try {
      const servicio = await this.obtenerServicio(id);

      let nombreAutor = 'Residente';
      if (id_residente) {
        const residente = await this.prisma.residente.findUnique({
          where: { id_residente },
          include: { usuario: { include: { persona: true } } }
        });
        if (residente?.usuario?.persona?.nombre) {
          nombreAutor = residente.usuario.persona.nombre;
        }
      }

      const fechaActual = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
      const comentarioEstructurado = `Reactivado por: ${nombreAutor} el ${fechaActual}.`;

      await this.prisma.servicio.update({
        where: { id_servicio: servicio.id_servicio },
        data: {
          activo: true,
        },
      });

      await this.prisma.acceso.updateMany({
        where: { id_visitante: servicio.id_visitante },
        data: { 
          estatus: 'Activo',
          comentario_admin: comentarioEstructurado
        },
      });

      return {
        statusCode: 200,
        message: `El empleado ${servicio.nombre} ha sido reactivado exitosamente.`,
      };
    } catch (error) {
      console.error('Error en reactivarEmpleado:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al intentar reactivar al empleado. Por favor, inténtelo de nuevo más tarde.',
      );
    }
  }
}
