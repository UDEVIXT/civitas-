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
  const raw: any[] = Array.isArray(body) ? body : (body.data ?? []);
  return raw.map((item) => ({
    id_reporte: item.id_reporte,
    motivo: item.motivo ?? item.titulo_o_tipo ?? "",
    descripcion: item.descripcion ?? "",
    estado: item.estado,
    prioridad: item.prioridad ?? undefined,
    es_anonimo: item.es_anonimo ?? false,
    token_seguimiento: item.token_seguimiento ?? null,
    resultado_esperado: item.resultado_esperado ?? null,
    resultado_solucion: item.resultado_solucion ?? null,
    createdAt: item.createdAt ?? item.fecha_hora ?? item.fecha_creacion ?? "",
    evidencias: item.evidencias ?? (item.fotos ?? []).map((f: any) => ({
      url_archivo: f.url ?? f.url_archivo ?? "",
      nombre_archivo: f.nombre ?? f.nombre_archivo ?? "",
    })),
  }));
};

export const obtenerDetalleIncidencia = async (
  id: string
): Promise<Incidente> => {
  const response = await apiClient.get<Incidente>(`/incidencias/${id}`);
  return response.data;
};