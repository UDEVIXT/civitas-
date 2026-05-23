import apiClient from "@/api/axios";
import type { VisitanteFormValues } from "../schemas/visitante.schema";

export const crearVisitante = async (data: VisitanteFormValues) => {
  // 1. Unimos tu campo de fecha y hora para crear la fecha_inicio en formato ISO
  const fechaInicio = new Date(`${data.fecha_visita}T${data.hora_estimada}:00`);
  const fechaInicioISO = fechaInicio.toISOString();

  // 2. Calculamos la fecha_fin dándole 4 horas de margen a la visita (para el QR)
  const fechaFin = new Date(`${data.fecha_visita}T${data.hora_salida}:00`);
  const fechaFinISO = fechaFin.toISOString();

  const formDataToSend = new FormData();

  // 3. Mapeamos los campos del formulario al JSON  que espera el backend, usando FormData para incluir la foto
  const payload = {
    nombre: data.nombre_completo,
    fecha_inicio: fechaInicioISO,
    fecha_fin: fechaFinISO,
    tipo_visitante: data.tipo_visitante,
    telefono: data.telefono,
    tipo_vehiculo: data.vehiculo || "Particular",
    motivo: data.motivo_visita,
    es_frecuente: data.es_frecuente,
  };

  // Agregamos cada campo del payload a FormData
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formDataToSend.append(key, String(value));
    }
  });

  // 4. Agregamos la foto si existe
  if (data.foto) {
    formDataToSend.append("foto_visitante", data.foto);
  }

  const response = await apiClient.post("/visitante", formDataToSend, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};

export const getVisitantes = async () => {
  const response = await apiClient.get("/visitante");
  return response.data;
};

export const generarQrVisitante = async (
  idVisitante: string,
  fechas?: { fecha_inicio?: string; fecha_fin?: string },
) => {
  const response = await apiClient.post(
    `/visitante/${idVisitante}/generar-qr`,
    fechas ?? {},
  );

  return response.data;
};
