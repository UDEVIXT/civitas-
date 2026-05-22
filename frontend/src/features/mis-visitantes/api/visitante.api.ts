import apiClient from "@/api/axios"; // Ajusta la ruta si tu instancia de axios está en otro lado
import type { VisitanteFormValues } from "../schemas/visitante.schema";

export const crearVisitante = async (data: VisitanteFormValues) => {
  // 1. Unimos tu campo de fecha y hora para crear la fecha_inicio en formato ISO
  const fechaInicio = new Date(`${data.fecha_visita}T${data.hora_estimada}:00`);
  const fechaInicioISO = fechaInicio.toISOString();

  // 2. Calculamos la fecha_fin dándole 4 horas de margen a la visita (para el QR)
  const fechaFin = new Date(fechaInicio);
  fechaFin.setHours(fechaFin.getHours() + 4);
  const fechaFinISO = fechaFin.toISOString();

  // 3. Mapeamos tus campos del formulario al JSON exacto que espera Joan
  const payload = {
    nombre: data.nombre_completo,
    fecha_inicio: fechaInicioISO,
    fecha_fin: fechaFinISO,
    tipo_visitante: data.motivo_visita,   // Usamos tu campo motivo
    telefono: data.telefono,
    tipo_vehiculo: data.tipo_visitante,   // Usamos tu campo donde dice ej. Camioneta
    es_frecuente: data.es_frecuente
  };

  // 4. Hacemos la petición POST al endpoint de Joan
  // Nota: Joan preparó el backend para fotos (@UseInterceptors), pero como te
  // dijo que la foto "solo falta que se guarde", enviar este JSON funcionará perfecto.
  const response = await apiClient.post("/visitante", payload);
  
  return response.data;
};