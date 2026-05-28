import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}