import apiClient from "@/api/axios";
import type { VisitanteFormValues } from "../schemas/visitante.schema";
import type { AccionQrVisitante } from "../types";

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
  console.log("Respuesta del backend al generar QR:", response.data);
  return response.data;
};

export const actualizarEstadoQrVisitante = async (
  idVisitante: string,
  data: { accion: AccionQrVisitante; motivo?: string },
) => {
  const response = await apiClient.patch(
    `/visitante/${idVisitante}/qr-estado`,
    data,
  );
  return response.data;
};

export const actualizarVisitante = async (
  idVisitante: string,
  data: VisitanteFormValues
) => {
  const formDataToSend = new FormData();

  // 1. Reconstrucción de fechas (si aplican)
  if (data.fecha_visita && data.hora_estimada) {
    const fechaInicio = new Date(`${data.fecha_visita}T${data.hora_estimada}:00`);
    formDataToSend.append('fecha_inicio', fechaInicio.toISOString());
  }

  if (data.fecha_visita && data.hora_salida) {
    const fechaFin = new Date(`${data.fecha_visita}T${data.hora_salida}:00`);
    formDataToSend.append('fecha_fin', fechaFin.toISOString());
  }

  // 2. Empaquetado de datos de texto y booleanos
  if (data.nombre_completo) formDataToSend.append('nombre', data.nombre_completo);
  if (data.tipo_visitante) formDataToSend.append('tipo_visitante', data.tipo_visitante);
  if (data.telefono) formDataToSend.append('telefono', data.telefono);
  if (data.vehiculo) formDataToSend.append('tipo_vehiculo', data.vehiculo);
  if (data.motivo_visita) formDataToSend.append('motivo', data.motivo_visita);
  if (data.es_frecuente !== undefined) formDataToSend.append('es_frecuente', String(data.es_frecuente));

  // 3. Empaquetado de archivo multimedia
  if (data.foto) {
    formDataToSend.append("foto_visitante", data.foto);
  }

  const response = await apiClient.patch(`/visitante/${idVisitante}`, formDataToSend, {
    headers: {
      "Content-Type": undefined, // Necesario para que Axios genere el boundary de FormData
    },
  });

  return response.data;
};
