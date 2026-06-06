import api from "@/api/axios";

export interface ActividadReciente {
  id: string;
  nombre_repartidor: string;
  residente_vinculado: string;
  tiempo_transcurrido: string;
  estado: "AUTORIZADO" | "RECHAZADO";
}

export interface DetalleServicio {
  id_acceso: string;
  id_servicio: string | null;
  id_visitante: string | null;
  nombre_repartidor: string;
  empresa: string;
  residente_vinculado: string;
  vivienda: string;
  tipo_servicio: string;
  fecha_expiracion: string;
  estado: string;
  motivo_invalido: string;
  detalles_adicionales: {
    placas?: string;
    motivo?: string;
  };
}

export const accesosServiciosApi = {
  obtenerActividadReciente: async (): Promise<ActividadReciente[]> => {
    const { data } = await api.get("/accesos-servicios");
    return data;
  },

  obtenerDetalleServicio: async (codigoQr: string): Promise<DetalleServicio> => {
    //console.log('Código QR enviado al backend para obtener detalles:', codigoQr);
      const { data } = await api.get(`/accesos-servicios/escanear/${codigoQr}`); 
      return data.data;
  },

  validarAcceso: async (codigoQr: string): Promise<void> => {
    const urlCodificada = encodeURIComponent(codigoQr);
    await api.get(`/accesos-servicios/validar/${urlCodificada}`);
  },

  denegarAcceso: async (codigoQr: string, motivo: string): Promise<void> => {
    await api.patch("/bitacora/desactivar-qr", { codigo_qr: codigoQr, motivo });
  },

  registrarIngresoManual: async (datosManuales: {
    nombre: string;
    empresa: string;
    motivo: string;
    vivienda: string;
  }): Promise<void> => {
    await api.post("/accesos-servicios/registro-manual", datosManuales);
  },
};
