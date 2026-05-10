import apiClient from "../api/axios";

// FILTROS
export interface BitacoraFiltro {
  search?: string;
  tipo?: string;
  residencia?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ordenar?: string;
  estado?: string;
  page?: string;
  limit?: string;
}

// REGISTRO
export interface BitacoraRegistro {
  id: string;

  nombre: string;

  tipo_persona: string;

  residente_asociado: {
    nombre: string;
    avatar_url: string | null;
  };

  fecha_entrada: string;

  fecha_salida: string | null;

  metodo_acceso: string;

  guardia_registro: string;

  estado: string;

  avatar_url: string | null;
}

// RESPONSE
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

class BitacoraService {
  async obtenerBitacoraHistorica(
    filtros: BitacoraFiltro = {},
  ): Promise<BitacoraResponse> {
    const response = await apiClient.get("/bitacora", {
      params: filtros,
    });

    return response.data;
  }
}

export const bitacoraService = new BitacoraService();