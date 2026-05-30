import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateSolicitudAdministradorGuardiaDto } from './dto/create-solicitud_administrador_guardia.dto';
import { UpdateSolicitudAdministradorGuardiaDto } from './dto/update-solicitud_administrador_guardia.dto';

@Injectable()
export class SolicitudAdministradorGuardiaService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

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
      const nuevaSolicitud = await this.prisma.solicitud_administrador_guardia.create({
        data: {
          id_usuario: createDto.id_usuario,
          rol_solicitado: createDto.rol_solicitado as any,
          nombre: createDto.nombre,
          genero: createDto.genero,
          fecha_nacimiento: new Date(createDto.fecha_nacimiento), 
          telefono: createDto.telefono,
          correo: createDto.correo,
          estatus_solicitud: createDto.estatus_solicitud as any
        },
        include: {
          usuario: true, 
        }
      });

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