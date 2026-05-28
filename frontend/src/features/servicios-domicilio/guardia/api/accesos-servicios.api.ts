import api from "@/api/axios";

export interface ActividadReciente {
  id: string;
  nombre_repartidor: string;
  residente_vinculado: string;
  tiempo_transcurrido: string;
  estado: "ENTRADA" | "SALIDA";
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

  obtenerDetalleServicio: async (id: string): Promise<DetalleServicio> => {
    const { data } = await api.get("accesos-servicios/escanear/qr_Q3QfP--1jUIjQN7C1Bi8PC834rE0rUFIfCjsXJQ6JSM");
    return data.data;
  },

  validarAcceso: async (codigoQr: string): Promise<void> => {
    await api.get("/accesos-servicios/validar/qr_Q3QfP--1jUIjQN7C1Bi8PC834rE0rUFIfCjsXJQ6JSM");
  },

  denegarAcceso: async (codigoQr: string, motivo: string): Promise<void> => {
    await api.post("/accesos-servicios/denegar/qr_Q3QfP--1jUIjQN7C1Bi8PC834rE0rUFIfCjsXJQ6JSM",
      { motivo }
    );
  }
};
