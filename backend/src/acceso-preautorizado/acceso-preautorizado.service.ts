import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAccesoPreautorizadoDto } from './dto/create-acceso-preautorizado.dto';
import { UpdateAccesoPreautorizadoDto } from './dto/update-acceso-preautorizado.dto';
import { PrismaService } from '../prisma/prisma.service';

type TipoAccesoManual = 'Visitante' | 'Proveedor' | 'Empleado';
type EstadoQrManual = 'Activo' | 'Expirado' | 'Desactivado';

@Injectable()
export class AccesoPreautorizadoService {
  constructor(private prisma: PrismaService) {}

  create(createAccesoPreautorizadoDto: CreateAccesoPreautorizadoDto) {
    return 'This action adds a new accesoPreautorizado';
  }

  async findAll() {
    try {
      const ahora = new Date();

      const accesos = await this.prisma.acceso.findMany({
        where: {
          codigo_qr: { not: null },
          id_visitante: { not: null },
          bitacora: {
            none: {
              id_guardia: { not: null },
            },
          },
          bitacora_qr_visitantes: {
            none: {
              accion: 'RECHAZADO',
            },
          },
        },
        include: {
          visitante: {
            include: {
              residente: {
                include: {
                  vivienda: true,
                  usuario: {
                    include: {
                      persona: true,
                    },
                  },
                },
              },
              servicio: {
                include: {
                  tipo_servicio: true,
                },
              },
            },
          },
        },
        orderBy: {
          fecha_creacion: 'desc',
        },
      });

      return accesos
        .filter((acceso) => acceso.visitante)
        .map((acceso) => {
          const visitante = acceso.visitante!;
          const servicio = visitante.servicio;
          const categoriaServicio = servicio?.tipo_servicio?.categoria;

          const tipo: TipoAccesoManual = visitante.id_servicio
            ? categoriaServicio === 'Empleado'
              ? 'Empleado'
              : 'Proveedor'
            : 'Visitante';

          const estadoQr: EstadoQrManual =
            acceso.estatus === 'Inactivo'
              ? 'Desactivado'
              : acceso.fecha_expiracion < ahora
                ? 'Expirado'
                : 'Activo';

          const informacionGeneral =
            visitante.notas_adicionales ||
            visitante.motivo ||
            servicio?.nombre_empresa ||
            servicio?.nombre_servicio ||
            servicio?.cargo ||
            null;

          return {
            id_acceso_preautorizado: acceso.id_acceso,
            nombre: visitante.nombre,
            informacion_general: informacionGeneral,
            propiedad:
              visitante.residente?.vivienda?.numero_vivienda || 'Sin asignar',
            nombre_residente:
              visitante.residente?.usuario?.persona?.nombre || 'Residente',
            fecha_llegada:
              acceso.fecha_visita_programada || acceso.fecha_creacion,
            fecha_salida:
              acceso.fecha_salida_programada || acceso.fecha_expiracion,
            fecha_expiracion: acceso.fecha_expiracion,
            tipo,
            estado_qr: estadoQr,
            tiene_nota: Boolean(informacionGeneral),
            id_usuario: acceso.id_usuario,
            id_acceso: acceso.id_acceso,
            createdAt: acceso.fecha_creacion,
            updatedAt: acceso.fecha_creacion,
          };
        })
        .sort((a, b) => {
          const prioridad: Record<EstadoQrManual, number> = {
            Activo: 0,
            Expirado: 1,
            Desactivado: 2,
          };

          const prioridadA = prioridad[a.estado_qr as EstadoQrManual];
          const prioridadB = prioridad[b.estado_qr as EstadoQrManual];

          if (prioridadA !== prioridadB) return prioridadA - prioridadB;

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
    } catch (error) {
      console.error('Error al obtener accesos preautorizados:', error);
      throw new InternalServerErrorException('Error al recuperar los registros de la base de datos.');
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} accesoPreautorizado`;
  }

  update(id: string, updateAccesoPreautorizadoDto: UpdateAccesoPreautorizadoDto) {
    return `This action updates a #${id} accesoPreautorizado`;
  }

  remove(id: string) {
    return `This action removes a #${id} accesoPreautorizado`;
  }
}
