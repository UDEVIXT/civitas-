// bitacora.service.ts

import apiClient from "../api/axios";

// DETALLE
export interface BitacoraDetalleResponse {
  success: boolean;

  data: {
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

    qr_utilizado: string;

    notas: string;

    hora_validacion: string;
  };
}

class BitacoraService {
  async obtenerBitacoraHistorica(filtros = {}) {
    const response = await apiClient.get("/bitacora", {
      params: filtros,
    });

    return response.data;
  }

  async obtenerDetalleRegistro(id: string): Promise<BitacoraDetalleResponse> {
    const response = await apiClient.get(`/bitacora/${id}`);

    return response.data;
  }

  async registrarSalida(id_bitacora: string, notas?: string) {
    // TODO: Reemplazar este ID con el ID real del guardia que tiene la sesión iniciada
    const id_guardia = "30e0c5c3-5f4f-4d65-9d2c-1b22a5de333c"; 
    const response = await apiClient.patch('/bitacora/registrar-salida', {
      id_bitacora,
      id_guardia,
      notas,
    });
    return response.data;
  }
}

export const bitacoraService = new BitacoraService();