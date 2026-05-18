import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MisServiciosService {
  constructor(private prisma: PrismaService) {}

  async obtenerMisServicios(idUsuario: string) {
    // 1. Buscamos el id_residente ligado al usuario autenticado
    const residente = await this.prisma.residente.findFirst({
      where: { id_usuario: idUsuario },
    });

    if (!residente) {
      throw new NotFoundException('El usuario no está registrado como residente.');
    }

    // 2. Traemos los visitantes de ese residente que tengan un servicio colgado
    const visitantesConServicio = await this.prisma.visitante.findMany({
      where: {
        id_residente: residente.id_residente,
        id_servicio: { not: null },
      },
      select: {
        id_visitante: true,
        // Usamos la fecha de creación del acceso o del servicio como fallback si no hay accesos programados
        accesos: {
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
          select: {
            fecha_expiracion: true,
            estatus: true,
          },
        },
        servicio: {
          select: {
            nombre_empresa: true,
            nombre_servicio: true,
            activo: true,
            tipo_servicio: {
              select: {
                nombre: true,
              },
            },
            horarios: {
              select: {
                dia_semana: true,
              },
            },
          },
        },
      },
    });

    // 3. 🚨 EL BLINDAJE: Mapeamos los datos para transformarlos exactamente en el "ServicioMock" del frontend
    return visitantesConServicio.map((item) => {
      const servicioBase = item.servicio;
      const ultimoAcceso = item.accesos?.[0];

      // Lógica para determinar la Frecuencia (Mantenemos los enums del front)
      let frecuenciaCalculada: 'UNICA_VEZ' | 'RECURRENTE' | 'PROGRAMADO' = 'UNICA_VEZ';
      if (servicioBase?.horarios && servicioBase.horarios.length > 1) {
        frecuenciaCalculada = 'RECURRENTE';
      } else if (servicioBase?.horarios && servicioBase.horarios.length === 1) {
        frecuenciaCalculada = 'PROGRAMADO';
      }

      // Formateamos la fecha esperada a YYYY-MM-DD de forma segura
      const fechaEsperada = ultimoAcceso?.fecha_expiracion 
        ? new Date(ultimoAcceso.fecha_expiracion).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]; // Fallback por si no tiene accesos aún

      return {
        id: item.id_visitante,
        // Mapea a 'empresa' (CA003: Nombre del proveedor o empresa)
        empresa: servicioBase?.nombre_empresa || servicioBase?.nombre_servicio || 'Proveedor Particular',
        // Mapea a 'tipo' (Ej: Gas, Agua, Internet)
        tipo: servicioBase?.tipo_servicio?.nombre || 'General',
        // Mapea a 'frecuencia'
        frecuencia: frecuenciaCalculada,
        // Mapea a 'fecha'
        fecha: fechaEsperada,
        // Mapea a 'estatus' (Activo o Pendiente como muestra tu UI)
        estatus: servicioBase?.activo && ultimoAcceso?.estatus === 'Activo' ? 'Activo' : 'Pendiente',
      };
    });
  }
}