import { api } from "@/lib/api";

export interface ActividadReciente {
  id: string;
  nombre_repartidor: string;
  residente_vinculado: string;
  tiempo_transcurrido: string;
  estado: "AUTORIZADO" | "RECHAZADO";
}

export interface DetalleServicio {
  id: string;
  nombre_repartidor: string;
  empresa: string;
  residente_vinculado: string;
  vivienda: string;
  fecha_programada: string;
  tipo_servicio: string;
}

export const accesosServiciosApi = {
  obtenerActividadReciente: async (): Promise<ActividadReciente[]> => {
    const { data } = await api.get("/accesos-servicios/actividad-reciente");
    return data.data;
  },

  obtenerDetalleServicio: async (id: string): Promise<DetalleServicio> => {
    const { data } = await api.get(`/accesos-servicios/${id}`);
    return data.data;
  },

  validarAcceso: async (id: string): Promise<void> => {
    await api.post(`/accesos-servicios/${id}/validar`);
  },

  denegarAcceso: async (id: string, motivo: string): Promise<void> => {
    await api.post(`/accesos-servicios/${id}/denegar`, { motivo });
  }
};
