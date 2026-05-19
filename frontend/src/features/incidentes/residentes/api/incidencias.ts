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

export interface Evidencia {
  url_archivo: string;
  nombre_archivo: string;
}

export interface ReporteIncidencia {
  id_reporte: string;
  motivo: string;
  descripcion: string;
  estado: EstadoIncidencia;
  prioridad?: string;
  es_anonimo: boolean;
  token_seguimiento: string | null;
  resultado_esperado: string | null;
  resultado_solucion: string | null;
  createdAt: string;
  evidencias: Evidencia[];
}

export interface IncidenciasFiltros {
  usuarioId?: string;
  estado?: EstadoIncidencia;
  order?: "asc" | "desc";
  skip?: number;
  take?: number;
}

export const obtenerIncidencias = async (
  filtros: IncidenciasFiltros = {}
): Promise<ReporteIncidencia[]> => {
  const response = await apiClient.get<ReporteIncidencia[]>("/incidencias", {
    params: filtros,
  });
  return response.data;
};

export const obtenerDetalleIncidencia = async (
  id: string
): Promise<ReporteIncidencia> => {
  const response = await apiClient.get<ReporteIncidencia>(`/incidencias/${id}`);
  return response.data;
};