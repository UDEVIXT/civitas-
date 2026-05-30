import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateSolicitudCambioRolDto } from './dto/create-solicitud_cambio_rol.dto';
import { UpdateSolicitudCambioRolDto } from './dto/update-solicitud_cambio_rol.dto';

@Injectable()
export class SolicitudCambioRolService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createSolicitudCambioRolDto: CreateSolicitudCambioRolDto) {
    try {
      const nuevaSolicitud = await this.prisma.solicitud_cambio_rol.create({
        data: {
          id_usuario: createSolicitudCambioRolDto.id_usuario,
          rol_solicitado: createSolicitudCambioRolDto.rol_solicitado as any,
          razon: createSolicitudCambioRolDto.razon,
          estatus_solicitud: createSolicitudCambioRolDto.estatus_solicitud as any
        },
        include: {
          usuario: true,
        }
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
          to: nuevaSolicitud.usuario.correo,
          subject: '📍 Tu solicitud de cambio de rol ha sido recibida',
          template: './solicitud',
          context: {
            nombre: usuarioConNombre.persona.nombre,
            rol: nuevaSolicitud.rol_solicitado,
          },
        });
      } catch (mailError) {
        console.error('Error enviando correo:', mailError);
      }

      /*
      this.mailerService.sendMail({
        to: nuevaSolicitud.usuario.correo,
        subject: '📍 Tu solicitud de cambio de rol ha sido recibida',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Hola, ${nuevaSolicitud.usuario.nombre_usuario} 👋</h2>
            <p>Hemos recibido correctamente tu solicitud para cambiar tu rol al de <strong>${nuevaSolicitud.rol_solicitado}</strong>.</p>
            <p><strong>Razón expuesta:</strong> ${nuevaSolicitud.razon}</p>
            <p>Estatus actual: <strong>${nuevaSolicitud.estatus_solicitud}</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Este es un correo automático del sistema Civitas.</p>
          </div>
        `,
      }).catch(err => {
        console.error('Error enviando el correo:', err);
      });
      */

      return nuevaSolicitud;
    } catch (error) {
      console.error('Error al guardar la solicitud:', error);
      throw new InternalServerErrorException('No se pudo crear la solicitud de cambio de rol');
    }
  }

  async findAll() {
    return await this.prisma.solicitud_cambio_rol.findMany({
      include: { usuario: true }
    });
  }

  async findOne(id: string) {
    const solicitud = await this.prisma.solicitud_cambio_rol.findUnique({
      where: { id_solicitud: id },
      include: { usuario: true }
    });

    if (!solicitud) {
      throw new NotFoundException(`La solicitud con ID ${id} no existe`);
    }
    return solicitud;
  }

  async update(id: string, updateSolicitudCambioRolDto: UpdateSolicitudCambioRolDto) {
    try {
      return await this.prisma.solicitud_cambio_rol.update({
        where: { id_solicitud: id },
        data: {
          id_usuario: updateSolicitudCambioRolDto.id_usuario,
          rol_solicitado: updateSolicitudCambioRolDto.rol_solicitado as any,
          razon: updateSolicitudCambioRolDto.razon,
          estatus_solicitud: updateSolicitudCambioRolDto.estatus_solicitud as any
        },
      });
    } catch (error) {
      console.error(`Error al actualizar la solicitud ${id}:`, error);
      throw new InternalServerErrorException(`No se pudo actualizar la solicitud ${id}`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.solicitud_cambio_rol.delete({
        where: { id_solicitud: id },
      });
    } catch (error) {
      throw new InternalServerErrorException(`No se pudo eliminar la solicitud ${id}`);
    }
  }
}