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
  prioridad?: PrioridadIncidencia;
  es_anonimo: boolean;
  fecha_creacion: string;
  updatedAt: string;
  id_residente: string;
  historial: HistorialIncidencia[];
  ubicacion?: string;
  fotos?: string[];
  nombre_residente?: string;
}

export interface IncidenciasResponse {
  success: boolean;
  data: Incidente[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface IncidenciaDetalleResponse {
  success: boolean;
  data: Incidente;
}

export interface IncidenciasFiltros {
  page?: number;
  limit?: number;
  estado?: EstadoIncidencia;
  search?: string;
  fechaInicio?: string;
  fechaFin?: string;
  ordenarPor?: "reciente" | "antiguo";
  [key: string]: any;
}

export const obtenerIncidencias = async (
  filtros: IncidenciasFiltros = {}
): Promise<IncidenciasResponse> => {
  const response = await apiClient.get<IncidenciasResponse>("/incidencias", {
    params: filtros,
  });
  return response.data;
};

export const obtenerDetalleIncidencia = async (
  id: string
): Promise<IncidenciaDetalleResponse> => {
  const response = await apiClient.get<IncidenciaDetalleResponse>(
    `/incidencias/${id}`
  );
  return response.data;
};