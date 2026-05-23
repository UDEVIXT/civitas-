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
import { CreateEmpleadoDomesticoDto } from './dto/create-empleado-domestico.dto';
import { ArchivosService } from '../r2-module/archivos.service';

@Injectable()
export class EmpleadoService {
  constructor(
    private prisma: PrismaService,
    private readonly archivosService: ArchivosService,
  ) {}

  //HU-1.5.6: Administrador puede ver empleados domesticos dentro del residencial
  async obtenerEmpleados(
    filters: {
      search?: string;
      page: number;
      limit?: number;
      isActive?: boolean | undefined;
      byResidenteId?: string;
      byViviendaId?: string;
      idUsuarioActivo?: string;
    },
  ) {
    const { search, page, limit, isActive, byResidenteId, byViviendaId, idUsuarioActivo } = filters;

    // Filtro principal: solo servicios cuya categoría sea 'Empleado'
    const where: any = {
      servicio: {
        tipo_servicio: {
          categoria: 'Empleado',
        },
      },
    };

    // Si el caller es un residente, resolvemos su id_residente
    if (idUsuarioActivo) {
      const residente = await this.prisma.residente.findFirst({
        where: { id_usuario: idUsuarioActivo },
        select: { id_residente: true },
      });

      if (residente) where.id_residente = residente.id_residente;
    } else if (byResidenteId) {
      where.id_residente = byResidenteId;
    }

    if (search) {
      where.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (byResidenteId) where.id_residente = byResidenteId;

    if (byViviendaId) {
      where.residente = { id_vivienda: byViviendaId };
    }

    if (isActive !== undefined) {
      where.servicio = { ...(where.servicio || {}), activo: isActive };
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
              fecha_registro: true,
              horarios: {
                where: { activo: true },
                select: { dia_semana: true, hora_inicio: true, hora_fin: true },
              },
              tipo_servicio: { select: { nombre: true, categoria: true } },
            },
          },
          residente: {
            select: { vivienda: { select: { numero_vivienda: true } } },
          },
        },
        skip: (page - 1) * (limit ?? 10),
        take: limit ?? 10,
      }),
      this.prisma.visitante.count({ where }),
    ]);

    return {
      success: true,
      message: 'Empleados obtenidos correctamente',
      meta: {
        total,
        page,
        limit,
        total_pages: limit ? Math.ceil(total / limit) : 1,
      },
      data,
    };
  }

  async obtenerServicio(id_visitante: string) {
    const visitante = await this.prisma.visitante.findUnique({
      where: {
        id_visitante: id_visitante,
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
    const servicio = await this.prisma.servicio.findFirst({
      where: {
        id_servicio: visitante.id_servicio,
      },
      select: {
        id_servicio: true,
        rfc: true,
      },
    });

    if (!servicio) {
      throw new NotFoundException(
        `El empleado que deseas actualizar no está registrado.`,
      );
    }

    return {
      id_servicio: servicio.id_servicio,
      rfc: servicio.rfc,
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

         3. Si tiene un servicio, actualizamos el tipo y los horarios
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
                  // Formato ISO para el tipo @db.Time(6) de tu esquema
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
            // Soporta tanto 'url_imagen' como 'foto' que viene de tu modal
            url_imagen: data.url_imagen || data.foto,
            motivo: data.notas, // Si usas el campo motivo como notas/comentarios
          },
        });

        // 3. Si tiene un servicio asociado, actualizamos el Cargo y los Horarios Dinámicos
        if (visitante.id_servicio) {

          // Mapeamos los días del modal al formato ENUM de tu schema.prisma
          const mapeoDias: Record<string, any> = {
            'Lunes': 'LUNES',
            'Martes': 'MARTES',
            'Miércoles': 'MIERCOLES',
            'Jueves': 'JUEVES',
            'Viernes': 'VIERNES',
            'Sábado': 'SABADO',
            'Domingo': 'DOMINGO'
          };

          const diasSeleccionados: string[] = data.dias_autorizados || [];

          // Generamos el arreglo de horarios formateados para Prisma
          const nuevosHorarios = diasSeleccionados.map((dia: string) => {
            const diaEnum = mapeoDias[dia];
            if (!diaEnum) return null;

            return {
              dia_semana: diaEnum,
              // Formato @db.Time(6): Postgres espera objetos Date completos en JS
              hora_inicio: new Date(`1970-01-01T${data.hora_entrada || '08:00'}:00.000Z`),
              hora_fin: new Date(`1970-01-01T${data.hora_salida || '16:00'}:00.000Z`),
              activo: true,
            };
          }).filter(Boolean); // Limpiamos cualquier nulo por si acaso

          // Ejecutamos la actualización del Servicio y sus relaciones
          await tx.servicio.update({
            where: { id_servicio: visitante.id_servicio },
            data: {
              cargo: data.cargo, // Guarda "Nana", "Limpieza", etc.
              horarios: {
                // Borramos horarios actuales para evitar que se dupliquen al re-guardar
                deleteMany: {},
                // Insertamos los nuevos horarios calculados arriba
                create: nuevosHorarios as any,
              },
            },
          });
        }

        // 4. Actualizar bitácora o auditoría en la tabla Acceso
        await tx.acceso.updateMany({
          where: { id_visitante: id, estatus: 'Activo' },
          data: { comentario_admin: 'Información actualizada por residente desde el portal' },
        });

        return { success: true, statusCode: 200, message: 'Empleado actualizado con éxito' };
      });
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: 'No se pudo actualizar el registro debido a un error en el servidor.',
        error: error.message,
      });
    }
  }

  async eliminarEmpleado(id: string, motivo?: string) {
    try {
      const servicio = await this.obtenerServicio(id);

      const where = servicio.rfc
        ? { rfc: servicio.rfc }
        : { id_servicio: servicio.id_servicio };

      // Borrado lógico
      await this.prisma.servicio.updateMany({
        where,
        data: {
          activo: false,
          bloqueo_global: true,
        },
      });

      //Revocar su QR
      await this.prisma.acceso.updateMany({
        where: { id_visitante: servicio.id_visitante },
        data: {
          estatus: 'Inactivo',
          comentario_admin: motivo,
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
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al intentar dar de baja al empleado. Por favor, inténtelo de nuevo más tarde.',
      );
    }
  }

  async reactivarEmpleado(id: string) {
    try {
      const servicio = await this.obtenerServicio(id);

      const where = servicio.rfc
        ? { rfc: servicio.rfc }
        : { id_servicio: servicio.id_servicio };

      await this.prisma.servicio.updateMany({
        where,
        data: {
          activo: true,
          bloqueo_global: false,
        },
      });

      await this.prisma.acceso.updateMany({
        where: { id_visitante: servicio.id_visitante },
        data: { estatus: 'Activo' },
      });

      return {
        statusCode: 200,
        message: `El empleado ${servicio.nombre} ha sido reactivado exitosamente.`,
      };
    } catch {
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al intentar reactivar al empleado. Por favor, inténtelo de nuevo más tarde.',
      );
    }
  }

  async crearEmpleadoDomestico(
    dto: CreateEmpleadoDomesticoDto,
    idUsuario: string,
    file?: Express.Multer.File,
  ) {
    const rfc = dto.rfc.trim().toUpperCase();
    const telefono = dto.telefono?.trim() || undefined;

    const tipoServicio = await this.prisma.tipoServicio.findUnique({
      where: {
        id_tipo_servicio: dto.id_tipo_servicio,
      },
      select: {
        id_tipo_servicio: true,
        nombre: true,
        categoria: true,
      },
    });

    if (!tipoServicio) {
      throw new BadRequestException('El tipo de servicio seleccionado no existe.');
    }

    if (tipoServicio.categoria !== 'Empleado') {
      throw new BadRequestException(
        'Solo puedes registrar empleados con tipos de servicio de categoría Empleado.',
      );
    }

    const bloqueoGlobal = await this.prisma.servicio.findFirst({
      where: {
        rfc,
        bloqueo_global: true,
      },
      select: {
        id_servicio: true,
      },
    });

    if (bloqueoGlobal) {
      throw new ConflictException(
        'El empleado fue dado de baja globalmente por el administrador y no puede registrarse nuevamente.',
      );
    }

    const empleadoExistente = telefono
      ? await this.prisma.visitante.findFirst({
          where: {
            telefono,
            servicio: {
              rfc,
            },
          },
          select: {
            id_visitante: true,
            nombre: true,
            telefono: true,
            servicio: {
              select: {
                id_servicio: true,
                nombre_servicio: true,
                id_residente: true,
                id_vivienda: true,
              },
            },
          },
        })
      : await this.prisma.visitante.findFirst({
          where: {
            servicio: {
              rfc,
            },
          },
          select: {
            id_visitante: true,
            nombre: true,
            telefono: true,
            servicio: {
              select: {
                id_servicio: true,
                nombre_servicio: true,
                id_residente: true,
                id_vivienda: true,
              },
            },
          },
        });

    if (empleadoExistente && !dto.confirmar_reuso_rfc) {
      throw new ConflictException(
        telefono
          ? 'Ya existe un empleado registrado con ese RFC y teléfono. Confirma si deseas vincularlo también a esta vivienda.'
          : 'Ya existe un empleado registrado con ese RFC. Confirma si deseas vincularlo también a esta vivienda.',
      );
    }

    const residente = await this.prisma.residente.findFirst({
      where: {
        id_usuario: idUsuario,
      },

      include: {
        vivienda: true,
      },
    });

    if (!residente) {
      throw new BadRequestException('Residente no encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      const urlImagen = file
        ? await this.archivosService.subirImagen(file, '/empleados/')
        : dto.url_imagen;

      const servicio = await tx.servicio.create({
        data: {
          nombre_servicio: `${residente.vivienda.numero_vivienda}`,

          cargo: tipoServicio.nombre,

          id_tipo_servicio: dto.id_tipo_servicio,

          rfc,

          id_residente: residente.id_residente,
          id_vivienda: residente.id_vivienda,

          horarios: {
            create: dto.horarios.map((horario) => ({
              dia_semana: horario.dia_semana,
              // En crearEmpleadoDomestico (aprox línea 312)
              hora_inicio: new Date(`1970-01-01T${horario.hora_inicio}:00.000Z`),
              hora_fin: new Date(`1970-01-01T${horario.hora_fin}:00.000Z`),
            })),
          },
        },
      });

      const visitante = await tx.visitante.create({
        data: {
          nombre: dto.nombre_completo,

          telefono,

          url_imagen: urlImagen,

          es_frecuente: true,

          id_residente: residente.id_residente,

          id_servicio: servicio.id_servicio,
        },
      });

      return {
        message: 'Empleado doméstico registrado correctamente',
        servicio,
        visitante,
      };
    });
  }
}
