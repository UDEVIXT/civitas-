import apiClient from "@/api/axios"; // Ajusta la ruta a tu cliente Axios
import type { VisitanteFormValues } from "../schemas/visitante.schema";

export const crearVisitante = async (data: VisitanteFormValues) => {
  // 1. Transformamos la fecha y hora a formato ISO
  const fechaInicioISO = new Date(`${data.fecha_visita}T${data.hora_estimada}:00.000Z`).toISOString();
  
  // Como es un solo acceso, la fecha_fin es la misma o le sumamos un par de horas
  const fechaFin = new Date(`${data.fecha_visita}T${data.hora_estimada}:00.000Z`);
  fechaFin.setHours(fechaFin.getHours() + 4); // Le damos 4 horas de validez al QR
  const fechaFinISO = fechaFin.toISOString();

  // 2. Preparamos el FormData (porque el back usa @UseInterceptors(FileInterceptor('foto_visitante')))
  const formData = new FormData();
  formData.append("nombre", data.nombre_completo);
  formData.append("fecha_inicio", fechaInicioISO);
  formData.append("fecha_fin", fechaFinISO);
  formData.append("tipo_visitante", data.motivo_visita); // En el backend motivo = tipo_visitante
  formData.append("telefono", data.telefono);
  formData.append("tipo_vehiculo", data.tipo_visitante); // En tu front el select dice 'tipo_visitante'
  formData.append("es_frecuente", String(data.es_frecuente));

  // OJO: Si implementas la subida real de fotos desde un input type="file", 
  // aquí iría: formData.append("foto_visitante", tuArchivoFisico);
  // Por ahora, como es URL, Joan tendrá que adaptarlo en el back o ignorarlo si está en null

  const response = await apiClient.post("/api/visitante", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};