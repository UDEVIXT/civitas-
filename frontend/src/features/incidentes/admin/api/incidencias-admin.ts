import apiClient from "@/api/axios";

export type EstadoIncidencia = "PENDIENTE" | "EN_PROCESO" | "RESUELTA" | "CANCELADA";
export type PrioridadIncidencia = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

// Tipos basados en lo que devuelve el backend
export interface BackendIncidente {
  id_reporte: string;
  titulo_o_tipo: string;
  descripcion: string;
  fecha_hora: string;
  estado: "PENDIENTE" | "EN_PROCESO" | "RESUELTA" | "CANCELADA";
  prioridad?: string;
  es_anonimo: boolean;
  ubicacion: {
    latitud: number;
    longitud: number;
  };
  fotos: Array<{
    id: string;
    nombre: string;
    url: string;
  }>;
  reportado_por: {
    nombre: string;
    correo?: string;
  };
}

export interface BackendResponse {
  success: boolean;
  data: BackendIncidente[];
  pagination: {
    totalRegistros: number;
    totalPaginas: number;
    paginaActual: number;
    registrosPorPagina: number;
    hasMore: boolean;
  };
}

// Tipos que tu componente espera (compatibles con los existentes)
export interface IncidenteAdmin {
  id_incidencia: string;
  titulo: string;
  descripcion: string;
  estado: EstadoIncidencia;
  prioridad?: PrioridadIncidencia;
  es_anonimo: boolean;
  fecha_creacion: string;
  updatedAt: string;
  id_residente: string;
  historial: any[];
  ubicacion: string;
  fotos: string[];
  nombre_residente?: string;
}

export interface IncidenciasAdminFiltros {
  page?: number;
  limit?: number;
  estado?: string;
  prioridad?: string;
  busqueda?: string;
}

// Mapeo de prioridades del backend al frontend
const mapearPrioridad = (prioridad?: string): "BAJA" | "MEDIA" | "ALTA" | "CRITICA" | undefined => {
  if (!prioridad) return undefined;
  
  const prioridadUpper = prioridad.toUpperCase();
  switch (prioridadUpper) {
    case "BAJA": return "BAJA";
    case "MEDIA": return "MEDIA";
    case "ALTA": return "ALTA";
    case "CRITICA":
    case "CRÍTICA": return "CRITICA";
    default: return undefined;
  }
};

// Transformar datos del backend al formato del frontend
export const transformarIncidente = (backend: BackendIncidente): IncidenteAdmin => {
  return {
    id_incidencia: backend.id_reporte,
    titulo: backend.titulo_o_tipo,
    descripcion: backend.descripcion,
    estado: backend.estado,
    prioridad: mapearPrioridad(backend.prioridad),
    es_anonimo: backend.es_anonimo,
    fecha_creacion: backend.fecha_hora,
    updatedAt: backend.fecha_hora, // El backend no devuelve updatedAt, usamos createdAt
    id_residente: backend.es_anonimo ? "anonimo" : backend.reportado_por.correo || "desconocido",
    historial: [], // El backend no devuelve historial en este endpoint
    ubicacion: `${backend.ubicacion.latitud}, ${backend.ubicacion.longitud}`, // Convertir coordenadas a string
    fotos: backend.fotos.map(f => f.url), // Extraer solo las URLs
    nombre_residente: backend.es_anonimo ? undefined : backend.reportado_por.nombre,
  };
};

export const obtenerIncidenciasAdmin = async (
  filtros: IncidenciasAdminFiltros = {}
): Promise<{ incidentes: IncidenteAdmin[]; total: number; totalPages: number }> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.page) params.append('page', filtros.page.toString());
    if (filtros.limit) params.append('limit', filtros.limit.toString());
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    
    const response = await apiClient.get<BackendResponse>(`/incidencias?${params.toString()}`);
    
    if (!response.data.success) {
      throw new Error('Error al obtener incidencias');
    }
    
    const incidentesTransformados = response.data.data.map(transformarIncidente);
    
    return {
      incidentes: incidentesTransformados,
      total: response.data.pagination.totalRegistros,
      totalPages: response.data.pagination.totalPaginas,
    };
  } catch (error) {
    console.error('Error en obtenerIncidenciasAdmin:', error);
    throw error;
  }
};
