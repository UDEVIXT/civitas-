export interface BitacoraFiltro {
  search?: string;
  tipo?: "visitante" | "residente" | "empleado_domestico" | "proveedor";
  residencia?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ordenar?: "reciente" | "antiguo";
  page?: string;
  limit?: string;
}

export interface BitacoraRegistro {
  id: string;
  nombre: string;
  tipo_persona: string;
  empresa?: string;
  motivo?: string;
  residente_asociado: {
    nombre: string;
    avatar_url: string | null;
  };
  fecha_entrada: string | null;
  fecha_salida: string | null;
  metodo_acceso: string;
  guardia_registro: string;
  estado: string;
  avatar_url: string | null;
  fecha_rechazo?: string | null;
  motivo_rechazo?: string | null;
}

export interface BitacoraDetalle extends BitacoraRegistro {
  qr_utilizado: string | null;
  qr_validado?: boolean;
  notas: string | null;
  notas_guardia?: string;
  hora_validacion: string | null;
  foto_visitante?: string;
  servicio_nombre?: string;
  cargo_empleado?: string;
  placas?: string;
  motivo?: string;
  documento?: string;
  telefono?: string;
  empresa?: string;
  guardia_salida?: string;
  informacion_adicional?: string;
  residente_asociado: {
    nombre: string;
    avatar_url: string | null;
    apartamento?: string;
    torre?: string;
  };
}

export interface BitacoraResponse {
  success: boolean;
  data: BitacoraRegistro[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BitacoraDetalleResponse {
  success: boolean;
  data: BitacoraDetalle;
}

import apiClient from "@/api/axios";

export async function obtenerBitacoraHistorica(
  filtros: BitacoraFiltro = {},
): Promise<BitacoraResponse> {
  const response = await apiClient.get("/bitacora", {
    params: filtros,
  });
  return response.data;
}

export async function obtenerDetalleRegistro(
  id: string,
): Promise<BitacoraDetalleResponse> {
  const response = await apiClient.get(`/bitacora/${id}`);
  return response.data;
}
