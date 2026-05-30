import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta según tu ruta
import { TipoReporte } from '@prisma/client';

@Injectable()
export class IncidenciasService {
  constructor(private prisma: PrismaService) {}

  async obtenerIncidentesPaginados(query: { page?: string; limit?: string; estado?: any; prioridad?: any }) {
    try {
      const page = Math.max(1, parseInt(query.page || '1', 10));
      const limit = Math.max(1, parseInt(query.limit || '10', 10));
      const skip = (page - 1) * limit;

      const whereClause: any = {
        tipo: TipoReporte.INCIDENCIA,
      };

      if (query.estado) whereClause.estado = query.estado;
      if (query.prioridad) whereClause.prioridad = query.prioridad;

      const totalRegistros = await this.prisma.reporte.count({ where: whereClause });
      const totalPaginas = Math.ceil(totalRegistros / limit) || 1;

      if (page > totalPaginas) {
        return {
          success: true,
          message: "No hay más registros disponibles.",
          data: [],
          pagination: { totalRegistros, totalPaginas, paginaActual: page, registrosPorPagina: limit }
        };
      }

      // CONSULTA OPTIMIZADA PARA TU FRONTEND
      const incidentesRaw = await this.prisma.reporte.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          evidencias: true, // Requerido: Fotos adjuntas
          usuario: {
            include: {
              persona: true // Requerido: Nombre del residente que reportó
            }
          }
        }
      });

      // MAPEO Y AJUSTES DE DATOS PARA EL FRONTEND
      const incidentesFormateados = incidentesRaw.map(incidente => {
        // Validar si es anónimo para proteger los datos del residente
        const residenteInfo = incidente.es_anonimo 
          ? { nombre: "Anónimo" } 
          : { 
              nombre: incidente.usuario?.persona?.nombre || "Usuario no encontrado",
              correo: incidente.usuario?.correo 
            };

        return {
          id_reporte: incidente.id_reporte,
          titulo_o_tipo: incidente.motivo, // Requerido: Tu campo 'motivo' sirve como título
          descripcion: incidente.descripcion, // Requerido: Descripción
          fecha_hora: incidente.createdAt, // Requerido: Fecha y hora
          estado: incidente.estado, // Requerido: Estado actual
          prioridad: incidente.prioridad, // Requerido: Prioridad asignada
          es_anonimo: incidente.es_anonimo,
          
          // Requerido: Ubicación (Convertimos Decimal de Prisma a Number de JS)
          ubicacion: {
            latitud: Number(incidente.latitud),
            longitud: Number(incidente.longitud)
          },
          
          // Requerido: Fotos adjuntas mapeadas limpiamente
          fotos: incidente.evidencias.map(e => ({
            id: e.id_evidencia,
            nombre: e.nombre_archivo,
            url: e.url_archivo
          })),
          
          // Requerido: Datos del creador respetando el anonimato
          reportado_por: residenteInfo
        };
      });

      return {
        success: true,
        data: incidentesFormateados,
        pagination: {
          totalRegistros,
          totalPaginas,
          paginaActual: page,
          registrosPorPagina: limit,
          hasMore: page < totalPaginas,
        },
      };

    } catch (error) {
      console.error('Error en IncidenciasService:', error);
      throw new InternalServerErrorException(
        'No se pudo cargar esta página de registros. Por favor, inténtelo de nuevo.'
      );
    }
  }
}