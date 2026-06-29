/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArchivosService } from '../r2-module/archivos.service';

@Injectable()
export class EmpleadoService {
  constructor(
  private prisma: PrismaService,
  private readonly archivosService: ArchivosService,
) {}

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

  const toMinutes = (value: Date | string) => {
    const { hours, minutes } = this.parseTime(value);
    return hours * 60 + minutes;
  };

  const parts: string[] = [];

  for (const day of this.dayOrder) {
    const dayHorarios = byDay.get(day) ?? [];

    if (!dayHorarios.length) {
      continue;
    }

    const sorted = dayHorarios
      .slice()
      .sort((a, b) => toMinutes(a.hora_inicio) - toMinutes(b.hora_inicio));

    const ranges = sorted.map((horario) => {
      return `${this.formatTime(horario.hora_inicio)} - ${this.formatTime(
        horario.hora_fin,
      )}`;
    });

    parts.push(`${this.dayLabel[day] ?? day}: ${ranges.join(', ')}`);
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

    // FORZAR INNER JOIN (equivalente a SQL JOIN)
    const where: any = {
      servicio: {
        isNot: null,
      },
    };

    // 🔎 Buscar por nombre
    if (search) {
      where.nombre = {
        contains: search,
        mode: "insensitive",
      };
    }

    // 👤 Filtrar por usuario
    if (byUsuarioId) {
      where.residente = {
        usuario: {
          id_usuario: byUsuarioId,
        },
      };
    }

    // 🏠 Filtrar por vivienda
    if (byViviendaId) {
      where.residente = {
        vivienda: {
          id_vivienda: byViviendaId,
        },
      };
    }

    //Filtrar por estado del servicio (NO sobrescribir el where completo)
    if (isActive !== undefined) {
      where.servicio = {
        ...where.servicio,
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
          notas_adicionales: true,

          servicio: {
            select: {
              id_servicio: true,
              nombre_servicio: true,
              activo: true,
              bloqueo_global: true,
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

          accesos: {
            select: {
              codigo_qr: true,
              fecha_creacion: true,
            },
            orderBy: { fecha_creacion: 'desc' },
            take: 1,
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
      const horario_texto = this.buildHorarioTexto(
        item.servicio?.horarios ?? [],
      );
      const ultimoAcceso = item.accesos?.[0] ?? null;

      return {
        ...item,
        codigo_qr: ultimoAcceso?.codigo_qr ?? null,
        servicio: item.servicio
          ? {
              ...item.servicio,
              horario_texto,
            }
          : null,
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
        bloqueo_global: true,
      },
    });

    if (!servicio) {
      throw new NotFoundException(
        "El empleado que deseas actualizar no está registrado.",
      );
    }

    return {
      id_servicio: servicio.id_servicio,
      bloqueo_global: servicio.bloqueo_global,
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

async actualizarEmpleado(
  id: string,
  data: any,
  file?: Express.Multer.File,
) {
  console.log('BODY QUE LLEGA AL BACKEND:', data);
  console.log('FILE QUE LLEGA AL SERVICE:', file?.originalname);

  let urlImagen: string | undefined = undefined;

  // 1. Subir imagen FUERA de la transacción
  if (file) {
    console.log('🟡 Subiendo imagen fuera de la transacción...');

    urlImagen = await this.archivosService.subirImagen(
      file,
      'empleados-domesticos',
    );

    console.log('🟢 URL IMAGEN SUBIDA:', urlImagen);
  }

  try {
    return await this.prisma.$transaction(async (tx) => {
      // 2. Buscar visitante
      const visitante = await tx.visitante.findUnique({
        where: { id_visitante: id },
        select: { id_servicio: true },
      });

      if (!visitante) {
        throw new NotFoundException('Empleado no encontrado');
      }

      // 3. Armar datos de visitante
      const datosVisitante: any = {
        nombre: data.nombre,
        telefono: data.telefono,
        notas_adicionales: data.notas_adicionales,
      };

      if (urlImagen) {
        datosVisitante.url_imagen = urlImagen;
      }

      console.log('🟡 DATOS VISITANTE PARA UPDATE:', datosVisitante);

      // 4. Guardar cambios en Visitante
      const visitanteActualizado = await tx.visitante.update({
        where: { id_visitante: id },
        data: datosVisitante,
        select: {
          id_visitante: true,
          nombre: true,
          telefono: true,
          url_imagen: true,
          notas_adicionales: true,
        },
      });

      console.log('🟢 VISITANTE ACTUALIZADO:', visitanteActualizado);

      // 5. Actualizar servicio y horarios
if (visitante.id_servicio) {
  const mapeoDias: Record<string, string> = {
    Lunes: 'LUNES',
    Martes: 'MARTES',
    Miércoles: 'MIERCOLES',
    Miercoles: 'MIERCOLES',
    Jueves: 'JUEVES',
    Viernes: 'VIERNES',
    Sábado: 'SABADO',
    Sabado: 'SABADO',
    Domingo: 'DOMINGO',

    LUNES: 'LUNES',
    MARTES: 'MARTES',
    MIERCOLES: 'MIERCOLES',
    JUEVES: 'JUEVES',
    VIERNES: 'VIERNES',
    SABADO: 'SABADO',
    DOMINGO: 'DOMINGO',
  };

  const toTimeDate = (value: string) => {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Hora inválida');
    }

    const cleanValue = value.substring(0, 5);

    if (!/^\d{2}:\d{2}$/.test(cleanValue)) {
      throw new BadRequestException(`Formato de hora inválido: ${value}`);
    }

    return new Date(`1970-01-01T${cleanValue}:00.000Z`);
  };

  let nuevosHorarios: any[] = [];

  if (Array.isArray(data.horarios) && data.horarios.length > 0) {
    nuevosHorarios = data.horarios
      .filter((horario: any) => horario.activo)
      .map((horario: any) => {
        const diaEnum =
          mapeoDias[horario.dia] || mapeoDias[horario.dia_semana];

        if (!diaEnum) {
          throw new BadRequestException(
            `Día no válido en horario: ${horario.dia || horario.dia_semana}`,
          );
        }

        if (!horario.hora_entrada || !horario.hora_salida) {
          throw new BadRequestException(
            `El horario de ${horario.dia || horario.dia_semana} está incompleto`,
          );
        }

        if (horario.hora_entrada >= horario.hora_salida) {
          throw new BadRequestException(
            `La hora de salida debe ser mayor a la hora de entrada en ${horario.dia || horario.dia_semana}`,
          );
        }

        return {
          dia_semana: diaEnum,
          hora_inicio: toTimeDate(horario.hora_entrada),
          hora_fin: toTimeDate(horario.hora_salida),
          activo: true,
        };
      });
  } else {
    const diasSeleccionados: string[] = data.dias_autorizados || [];

    nuevosHorarios = diasSeleccionados
      .map((dia: string) => {
        const diaEnum = mapeoDias[dia];
        if (!diaEnum) return null;

        const entrada = data.hora_entrada || '08:00';
        const salida = data.hora_salida || '16:00';

        return {
          dia_semana: diaEnum,
          hora_inicio: toTimeDate(entrada),
          hora_fin: toTimeDate(salida),
          activo: true,
        };
      })
      .filter(Boolean);
  }

  if (!nuevosHorarios.length) {
    throw new BadRequestException(
      'Debes autorizar al menos un día de acceso',
    );
  }

  await tx.servicio.update({
    where: { id_servicio: visitante.id_servicio },
    data: {
      cargo: data.cargo,
      horarios: {
        deleteMany: {},
        create: nuevosHorarios as any,
      },
    },
  });
}

      // 6. Actualizar acceso
      await tx.acceso.updateMany({
        where: { id_visitante: id, estatus: 'Activo' },
        data: {
          comentario_admin: 'Información actualizada por residente',
        },
      });

      return {
        success: true,
        statusCode: 200,
        message: 'Empleado actualizado con éxito',
        data: visitanteActualizado,
      };
    });
  } catch (error: any) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    console.error('Error en actualizarEmpleado:', error);

    throw new InternalServerErrorException({
      message: 'No se pudo actualizar el registro',
      error: error.message,
    });
  }
}

  async eliminarEmpleado(
    id: string,
    motivo?: string,
    id_residente?: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const servicio = await this.obtenerServicio(id);

        let nombreAutor = 'Residente';

        if (id_residente) {
          const residente = await tx.residente.findUnique({
            where: { id_residente },
            include: {
              usuario: {
                include: {
                  persona: true,
                },
              },
            },
          });

          if (residente?.usuario?.persona?.nombre) {
            nombreAutor = residente.usuario.persona.nombre;
          }
        }

        const fechaActual = new Date().toLocaleString('es-MX', {
          timeZone: 'America/Mexico_City',
        });

        const comentarioEstructurado =
          `Baja por: ${nombreAutor} el ${fechaActual}. ` +
          `Motivo: ${motivo || 'No especificado'}`;

        // Desactivar servicio
        await tx.servicio.update({
          where: {
            id_servicio: servicio.id_servicio,
          },
          data: {
            activo: false,
          },
        });

        // Obtener accesos activos
        const accesos = await tx.acceso.findMany({
          where: {
            id_visitante: servicio.id_visitante,
            estatus: 'Activo',
          },
        });

        // Revocar accesos
        await tx.acceso.updateMany({
          where: {
            id_visitante: servicio.id_visitante,
          },
          data: {
            estatus: 'Inactivo',
            comentario_admin: comentarioEstructurado,
          },
        });

        // Registrar salida en bitácora
        for (const acceso of accesos) {
          await tx.bitacora.create({
            data: {
              id_acceso: acceso.id_acceso,
              fecha_hora_entrada: acceso.fecha_creacion,
              fecha_hora_salida: new Date(),
              comentario: acceso.comentario_admin,
              comentario_salida: comentarioEstructurado,
              estado: false,
            },
          });
        }

        return {
          statusCode: 200,
          message: `El empleado ${servicio.nombre} ha sido dado de baja exitosamente.`,
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Error en eliminarEmpleado:', error);

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al intentar dar de baja al empleado.',
      );
    }
  }

  async reactivarEmpleado(id: string, id_residente?: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const servicio = await this.obtenerServicio(id);

        if (servicio.bloqueo_global) {
          throw new ConflictException(
            'El empleado fue dado de baja globalmente por el administrador y solo él puede reincorporarlo.',
          );
        }

        let nombreAutor = 'Residente';

        if (id_residente) {
          const residente = await tx.residente.findUnique({
            where: { id_residente },
            include: {
              usuario: {
                include: {
                  persona: true,
                },
              },
            },
          });

          if (residente?.usuario?.persona?.nombre) {
            nombreAutor = residente.usuario.persona.nombre;
          }
        }

        const fechaActual = new Date().toLocaleString('es-MX', {
          timeZone: 'America/Mexico_City',
        });

        const comentarioEstructurado =
          `Reactivado por: ${nombreAutor} el ${fechaActual}.`;

        // Reactivar servicio
        await tx.servicio.update({
          where: {
            id_servicio: servicio.id_servicio,
          },
          data: {
            activo: true,
          },
        });

        // Obtener accesos asociados
        const accesos = await tx.acceso.findMany({
          where: {
            id_visitante: servicio.id_visitante,
          },
        });

        // Reactivar accesos
        await tx.acceso.updateMany({
          where: {
            id_visitante: servicio.id_visitante,
          },
          data: {
            estatus: 'Activo',
            comentario_admin: comentarioEstructurado,
          },
        });

        // Registrar movimiento en bitácora
        if (accesos.length > 0) {
          await tx.bitacora.createMany({
            data: accesos.map((acceso) => ({
              id_acceso: acceso.id_acceso,
              fecha_hora_entrada: new Date(),
              comentario: comentarioEstructurado,
              estado: true,
            })),
          });
        }

        return {
          statusCode: 200,
          message: `El empleado ${servicio.nombre} ha sido reactivado exitosamente.`,
        };
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      console.error('Error en reactivarEmpleado:', error);

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al intentar reactivar al empleado. Por favor, inténtelo de nuevo más tarde.',
      );
    }
  }
}
