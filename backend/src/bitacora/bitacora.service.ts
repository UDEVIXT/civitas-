import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BitacoraService {
  constructor(private prisma: PrismaService) {}

  // HU-1.9.1: Ver proveedores dentro del residencial
  async obtenerProveedoresActivos() {
    return this.prisma.bitacora.findMany({
      where: {
        fecha_hora_salida: null,
        acceso: {
          visitante: {
            id_servicio: { not: null },
          },
        },
      },
      include: {
        acceso: {
          select: {
            codigo_qr: true,
            visitante: {
              select: {
                nombre: true,
                motivo: true,
                servicio: {
                  select: {
                    nombre_empresa: true,
                    nombre_servicio: true,
                    placas: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        fecha_hora_entrada: 'desc',
      },
    });
  }

  // HU-1.9.1: Registrar salida y validar
  async registrarSalidaProveedor(
    id_bitacora: string,
    id_guardia: string,
    comentario_salida?: string,
  ) {
    const guardiaInfo = await this.prisma.guardia.findUnique({
      where: { id_guardia: id_guardia },
    });

    if (!guardiaInfo) {
      throw new NotFoundException('El guardia no existe en la base de datos.');
    }

    const registroActual = await this.prisma.bitacora.findUnique({
      where: { id_bitacora },
    });

    if (!registroActual) {
      throw new NotFoundException('No se encontró el registro de entrada.');
    }

    if (registroActual.fecha_hora_salida !== null) {
      throw new ConflictException(
        'Este proveedor ya tiene una salida registrada.',
      );
    }

    const textoSalida =
      comentario_salida || `Salida verificada por: ${guardiaInfo.nombre}`;

    const salidaRegistrada = await this.prisma.bitacora.update({
      where: { id_bitacora },
      data: {
        fecha_hora_salida: new Date(),
        comentario_salida: textoSalida,
      },
    });

    return salidaRegistrada;
  }
}
