import apiClient from "@/api/axios";

export type EstadoIncidencia = "PENDIENTE" | "EN_PROCESO" | "RESUELTA" | "CANCELADA";

export type PrioridadIncidencia = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

export interface HistorialIncidencia {
  id_historial: string;
  estado_anterior: EstadoIncidencia;
  nuevo_estado: EstadoIncidencia;
  comentario?: string;
  fecha: string;
  actualizado_por?: string;
  id_incidencia: string;
}

export interface Incidente {
  id_incidencia: string;
  titulo: string;
  descripcion: string;
  estado: EstadoIncidencia;
  prioridad?: string;
  es_anonimo: boolean;
  fecha_creacion: string;
  updatedAt: string;
  id_residente: string;
  historial?: HistorialIncidencia[];
  _count?: { historial: number };
}

export interface IncidenciasFiltros {
  residenteId?: string;
  estado?: EstadoIncidencia;
  [key: string]: any;
}

export const obtenerIncidencias = async (
  filtros: IncidenciasFiltros = {}
): Promise<Incidente[]> => {
  const response = await apiClient.get<Incidente[]>("/incidencias", {
    params: filtros,
  });
  return response.data;
};