import apiClient from "@/api/axios";

export interface BitacoraFiltroAdmin {
  page?: string | number;
  limit?: string | number;
  search?: string;
  tipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  [key: string]: any;
}

export interface BitacoraRegistroAdmin {
  id: string;
  nombre: string;
  tipo_persona: string;
  qr_utilizado: string;
  residente_asociado?: { nombre: string; avatar_url?: string; vivienda?: string };
  fecha_entrada: string;
  fecha_salida?: string;
  metodo_acceso: string;
  guardia_registro: string;
  estado: string;
  avatar_url?: string;
  notas_guardia?: string;
  notas?: string;
}

export interface BitacoraResponseAdmin {
  success: boolean;
  data: BitacoraRegistroAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BitacoraDetalleResponseAdmin {
  success: boolean;
  data: BitacoraRegistroAdmin;
}

export const obtenerBitacoraAdmin = async (
  filtros: BitacoraFiltroAdmin,
): Promise<BitacoraResponseAdmin> => {
  const response = await apiClient.get<BitacoraResponseAdmin>("/bitacora", {
    params: filtros,
  });
  return response.data;
};

export const obtenerDetalleRegistroAdmin = async (
  id: string,
): Promise<BitacoraDetalleResponseAdmin> => {
  const response = await apiClient.get<BitacoraDetalleResponseAdmin>(
    `/bitacora/${id}`,
  );
  return response.data;
};
