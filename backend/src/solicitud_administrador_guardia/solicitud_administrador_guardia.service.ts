import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ArchivosService } from '../r2-module/archivos.service';
import { CreateSolicitudAdministradorGuardiaDto } from './dto/create-solicitud_administrador_guardia.dto';
import { UpdateSolicitudAdministradorGuardiaDto } from './dto/update-solicitud_administrador_guardia.dto';

const PREFIJO_FOLIO: Record<string, string> = {
  Guardia: 'GRD',
  Administrador: 'ADM',
};

@Injectable()
export class SolicitudAdministradorGuardiaService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly archivosService: ArchivosService,
  ) {}

  // Folio legible (ej. GRD-0001) que sirve como "número de empleado" sin
  // exponer el UUID interno. No depende de la cantidad de filas existentes
  // (evita reusar folios si una solicitud se borra) sino del último folio
  // emitido para ese rol.
  private async generarNumeroEmpleado(tx: any, rol: string): Promise<string> {
    const prefijo = PREFIJO_FOLIO[rol] ?? 'EMP';

    const ultima = await tx.solicitud_administrador_guardia.findFirst({
      where: { numero_empleado: { startsWith: `${prefijo}-` } },
      orderBy: { numero_empleado: 'desc' },
      select: { numero_empleado: true },
    });

    const siguienteConsecutivo = ultima?.numero_empleado
      ? parseInt(ultima.numero_empleado.split('-')[1], 10) + 1
      : 1;

    return `${prefijo}-${String(siguienteConsecutivo).padStart(4, '0')}`;
  }

  private async crearSolicitudConFolio(
    createDto: CreateSolicitudAdministradorGuardiaDto,
    intentosRestantes = 3,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const numero_empleado = await this.generarNumeroEmpleado(tx, createDto.rol_solicitado);

        return tx.solicitud_administrador_guardia.create({
          data: {
            id_usuario: createDto.id_usuario,
            rol_solicitado: createDto.rol_solicitado as any,
            nombre: createDto.nombre,
            genero: createDto.genero,
            fecha_nacimiento: new Date(createDto.fecha_nacimiento),
            telefono: createDto.telefono,
            correo: createDto.correo,
            estatus_solicitud: createDto.estatus_solicitud as any,
            numero_empleado,
            credencial_frente_key: createDto.credencial_frente_key,
            credencial_reverso_key: createDto.credencial_reverso_key,
          },
          include: {
            usuario: true,
          },
        });
      });
    } catch (error: any) {
      // Folio tomado por otra solicitud concurrente del mismo rol: se reintenta con el siguiente.
      if (error?.code === 'P2002' && intentosRestantes > 0) {
        return this.crearSolicitudConFolio(createDto, intentosRestantes - 1);
      }
      throw error;
    }
  }

  async create(createDto: CreateSolicitudAdministradorGuardiaDto) {
    if (createDto.rol_solicitado.toUpperCase() === 'RESIDENTE') {
      throw new BadRequestException('No está permitido crear una solicitud para el rol de Residente.');
    }

    const solicitudExistente = await this.prisma.solicitud_administrador_guardia.findUnique({
      where: {
        id_usuario: createDto.id_usuario,
      },
    });

    if (solicitudExistente) {
      throw new BadRequestException('Este usuario ya tiene una solicitud registrada en el sistema.');
    }

    try {
      const nuevaSolicitud = await this.crearSolicitudConFolio(createDto);

      const fechaLocal = nuevaSolicitud.createdAt.toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        dateStyle: 'short',
        timeStyle: 'medium'
      });

      const usuarioConNombre = await this.prisma.usuario.findUnique({
        where: { 
          id_usuario: nuevaSolicitud.usuario.id_usuario
        },
        select: {
          id_usuario: true,
          nombre_usuario: true,
          persona: {
            select: {
              nombre: true
            }
          }
        }
      });

    if (!usuarioConNombre) {
      throw new NotFoundException('El usuario no fue encontrado');
    }

      try {
        await this.mailerService.sendMail({
          to: nuevaSolicitud.correo,
          subject:  `📍 Tu solicitud para ser ${nuevaSolicitud.rol_solicitado} ha sido recibida`,
          template: './solicitud',
          context: {
            nombre: nuevaSolicitud.nombre,
            rol: nuevaSolicitud.rol_solicitado,
          },
        });
      } catch (mailError) {
        console.error('Error enviando correo:', mailError);
      }

      return nuevaSolicitud;
    } catch (error) {
      console.error('Error al guardar la solicitud:', error);
      throw new InternalServerErrorException('No se pudo crear la solicitud de cambio de rol');
    }
  }

  async findAll() {
    try {
      return await this.prisma.solicitud_administrador_guardia.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          usuario: true,
        }
      });
    } catch (error) {
      console.error('Error al obtener las solicitudes:', error);
      throw new InternalServerErrorException('Error al obtener el listado de solicitudes');
    }
  }

  async findOne(id: string) {
    const solicitud = await this.prisma.solicitud_administrador_guardia.findUnique({
      where: { id_solicitud: id },
      include: { usuario: true }
    });

    if (!solicitud) {
      throw new NotFoundException(`La solicitud con ID ${id} no existe`);
    }
    return solicitud;
  }

  // El rol asignado siempre proviene de la solicitud guardada en BD, nunca de un valor externo.
  async aprobar(id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const solicitud = await tx.solicitud_administrador_guardia.findUnique({
          where: { id_solicitud: id },
        });

        if (!solicitud) {
          throw new NotFoundException(`La solicitud con ID ${id} no existe`);
        }

        if (solicitud.estatus_solicitud !== 'Pendiente') {
          throw new ConflictException('Esta solicitud ya fue procesada anteriormente.');
        }

        if (solicitud.rol_solicitado === 'Guardia') {
          await tx.guardia.upsert({
            where: { id_usuario: solicitud.id_usuario },
            create: {
              id_usuario: solicitud.id_usuario,
              nombre: solicitud.nombre,
              numero_empleado: solicitud.numero_empleado,
            },
            update: { numero_empleado: solicitud.numero_empleado },
          });
        } else if (solicitud.rol_solicitado === 'Administrador') {
          await tx.administrador.upsert({
            where: { id_usuario: solicitud.id_usuario },
            create: {
              id_usuario: solicitud.id_usuario,
              nombre: solicitud.nombre,
              numero_empleado: solicitud.numero_empleado,
            },
            update: { numero_empleado: solicitud.numero_empleado },
          });
        }

        await tx.usuario.update({
          where: { id_usuario: solicitud.id_usuario },
          data: { estado: 'ACTIVO' },
        });

        return tx.solicitud_administrador_guardia.update({
          where: { id_solicitud: id },
          data: { estatus_solicitud: 'Aceptada' },
          include: { usuario: true },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al aprobar la solicitud ${id}:`, error);
      throw new InternalServerErrorException('No se pudo aprobar la solicitud. Intenta nuevamente.');
    }
  }

  // Al rechazar, la cuenta queda suspendida en vez de eliminarse, sin acceso privilegiado.
  async rechazar(id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const solicitud = await tx.solicitud_administrador_guardia.findUnique({
          where: { id_solicitud: id },
        });

        if (!solicitud) {
          throw new NotFoundException(`La solicitud con ID ${id} no existe`);
        }

        if (solicitud.estatus_solicitud !== 'Pendiente') {
          throw new ConflictException('Esta solicitud ya fue procesada anteriormente.');
        }

        await tx.usuario.update({
          where: { id_usuario: solicitud.id_usuario },
          data: { estado: 'SUSPENDIDO' },
        });

        return tx.solicitud_administrador_guardia.update({
          where: { id_solicitud: id },
          data: { estatus_solicitud: 'Rechazada' },
          include: { usuario: true },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error al rechazar la solicitud ${id}:`, error);
      throw new InternalServerErrorException('No se pudo rechazar la solicitud. Intenta nuevamente.');
    }
  }

  // Sirve la imagen de credencial INE de forma protegida: la key real en R2
  // nunca se expone al cliente, solo se hace streaming a través de este
  // endpoint, ya gateado por @Roles('Administrador') en el controller.
  async obtenerImagenCredencial(id: string, lado: 'frente' | 'reverso', res: Response) {
    const solicitud = await this.prisma.solicitud_administrador_guardia.findUnique({
      where: { id_solicitud: id },
      select: { credencial_frente_key: true, credencial_reverso_key: true },
    });

    if (!solicitud) {
      throw new NotFoundException(`La solicitud con ID ${id} no existe`);
    }

    const key = lado === 'frente' ? solicitud.credencial_frente_key : solicitud.credencial_reverso_key;

    if (!key) {
      throw new NotFoundException('Esta solicitud no tiene una imagen de credencial registrada.');
    }

    const archivo = await this.archivosService.obtenerArchivoPrivado(key);
    res.set('Content-Type', archivo.contentType || 'image/jpeg');
    res.set('Cache-Control', 'private, max-age=300');
    archivo.body.pipe(res);
  }

  // Procesa cada solicitud de forma independiente para que una ya resuelta no bloquee al resto del lote.
  async aprobarMasivo(ids: string[]) {
    const fallidas: { id: string; motivo: string }[] = [];
    let aprobadas = 0;

    for (const id of ids) {
      try {
        await this.aprobar(id);
        aprobadas += 1;
      } catch (error) {
        const motivo =
          error instanceof ConflictException || error instanceof NotFoundException
            ? error.message
            : 'No se pudo procesar la solicitud.';
        fallidas.push({ id, motivo });
      }
    }

    return {
      total: ids.length,
      aprobadas,
      fallidas,
    };
  }

  async update(id: string, updateSolicitudAdministradorGuardiaDto: UpdateSolicitudAdministradorGuardiaDto) {
    try {
      return await this.prisma.solicitud_administrador_guardia.update({
        where: { id_solicitud: id },
        data: {
          id_usuario: updateSolicitudAdministradorGuardiaDto.id_usuario,
          rol_solicitado: updateSolicitudAdministradorGuardiaDto.rol_solicitado as any,
          estatus_solicitud: updateSolicitudAdministradorGuardiaDto.estatus_solicitud as any
        },
      });
    } catch (error) {
      console.error(`Error al actualizar la solicitud ${id}:`, error);
      throw new InternalServerErrorException(`No se pudo actualizar la solicitud ${id}`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.solicitud_administrador_guardia.delete({
        where: { id_solicitud: id },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo eliminar la solicitud ${id}`);
    }
  }
}