import apiClient from "@/api/axios";

export type EstadoIncidencia = "PENDIENTE" | "EN_PROCESO" | "RESUELTA" | "CANCELADA";

export interface Evidencia {
  url_archivo: string;
  nombre_archivo: string;
}

export interface Incidente {
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
): Promise<Incidente[]> => {
  const response = await apiClient.get("/incidencias", {
    params: filtros,
  });
  const body = response.data;
  return Array.isArray(body) ? body : (body.data ?? []);
};

export const obtenerDetalleIncidencia = async (
  id: string
): Promise<Incidente> => {
  const response = await apiClient.get<Incidente>(`/incidencias/${id}`);
  return response.data;
};