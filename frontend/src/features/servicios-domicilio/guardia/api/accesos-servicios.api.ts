import api from "@/api/axios";

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
    const { data } = await api.get("/accesos-servicios");
    return data;
  },

  obtenerDetalleServicio: async (codigoQr: string): Promise<DetalleServicio> => {
    const { data } = await api.get(`/accesos-servicios/escanear/${codigoQr}`);
    return data.data;
  },

  validarAcceso: async (codigoQr: string): Promise<void> => {
    await api.get(`/accesos-servicios/validar/${codigoQr}`);
  },

  denegarAcceso: async (codigoQr: string, motivo: string): Promise<void> => {
    await api.post('/bitacora/desactivar-qr', { codigo_qr: codigoQr, motivo });
  },

  registrarIngresoManual: async (datosManuales: { nombre: string; empresa: string; motivo: string; vivienda: string }): Promise<void> => {
    await api.post("/accesos-servicios/registro-manual", datosManuales);
  }
};
