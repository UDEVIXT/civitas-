import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class PerfilService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerMiPerfil(id_usuario: string) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: {
          id_usuario,
        },
        select: {
          id_usuario: true,
          nombre_usuario: true,
          correo: true,
          rol: true,
          persona: {
            select: {
              nombre: true,
              telefono: true,
              url_imagen: true,
            },
          },
        },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      const nombreCompleto = usuario.persona.nombre.trim();
      const partesNombre = nombreCompleto.split(/\s+/);

      const nombre = partesNombre[0] ?? '';
      const apellidos = partesNombre.slice(1).join(' ');

      return {
        id: usuario.id_usuario,

        // Para el formulario
        nombre,
        apellidos,

        // Para la tarjeta lateral
        nombreUsuario: usuario.nombre_usuario,

        telefono: usuario.persona.telefono ?? '',
        correo: usuario.correo,
        rol: usuario.rol.toLowerCase(),
        fechaRegistro: null,
        urlImagen: usuario.persona.url_imagen ?? null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error en obtenerMiPerfil:', error);

      throw new InternalServerErrorException(
        'Ocurrió un error al obtener el perfil.',
      );
    }
  }

    async actualizarMiPerfil(id_usuario: string, data: UpdatePerfilDto) {
    try {
      const nombre = data.nombre?.trim();
      const apellidos = data.apellidos?.trim() ?? '';
      const telefono = data.telefono?.trim();

      if (!nombre) {
        throw new BadRequestException('El nombre es obligatorio.');
      }

      if (!telefono) {
        throw new BadRequestException('El teléfono es obligatorio.');
      }

      const usuario = await this.prisma.usuario.findUnique({
        where: {
          id_usuario,
        },
        select: {
          id_usuario: true,
          nombre_usuario: true,
          correo: true,
          rol: true,
          id_persona: true,
          persona: {
            select: {
              url_imagen: true,
            },
          },
        },
      });

      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      const nombreCompleto = `${nombre} ${apellidos}`.trim();

      await this.prisma.persona.update({
        where: {
          id_persona: usuario.id_persona,
        },
        data: {
          nombre: nombreCompleto,
          telefono,
        },
      });

      return {
        id: usuario.id_usuario,
        nombre,
        apellidos,
        nombreUsuario: usuario.nombre_usuario,
        telefono,
        correo: usuario.correo,
        rol: usuario.rol.toLowerCase(),
        fechaRegistro: null,
        urlImagen: usuario.persona.url_imagen ?? null,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Error en actualizarMiPerfil:', error);

      throw new InternalServerErrorException(
        'Ocurrió un error al actualizar el perfil.',
      );
    }
  }

}