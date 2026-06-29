import apiClient from "@/api/axios";
import type { VisitanteFormValues } from "../schemas/visitante.schema";
import type { AccionQrVisitante } from "../types";

function normalizeTime(value: string) {
  const raw = value.trim();

  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const h24Match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (h24Match) {
    return `${String(Number(h24Match[1])).padStart(2, "0")}:${h24Match[2]}`;
  }

  return raw;
}

function buildLocalDateIso(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = normalizeTime(timeValue).split(":").map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError("invalid date");
  }

  return date.toISOString();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").trim();
}

export const crearVisitante = async (data: VisitanteFormValues) => {
  // 1. Unimos tu campo de fecha y hora para crear la fecha_inicio en formato ISO
  const fechaInicioISO = buildLocalDateIso(data.fecha_visita, data.hora_estimada);

  // 2. Calculamos la fecha_fin dándole 4 horas de margen a la visita (para el QR)
  const fechaFinISO = buildLocalDateIso(data.fecha_visita, data.hora_salida);

  const formDataToSend = new FormData();

  // 3. Mapeamos los campos del formulario al JSON  que espera el backend, usando FormData para incluir la foto
  // Dentro de tu visitante.api.ts
  const payload = {
    nombre: data.nombre_completo,
    fecha_inicio: fechaInicioISO,
    fecha_fin: fechaFinISO,
    tipo_visitante: data.tipo_visitante,
    telefono: data.telefono,
    tipo_vehiculo: data.vehiculo || "Particular",
    motivo: data.motivo_visita,
    es_frecuente: data.es_frecuente,
    // ✅ CORRECCIÓN: Ahora sí enviamos las notas al backend
    notas_adicionales: data.notas_adicionales, 
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

export const actualizarEstadoQrVisitantesMasivo = async (data: {
  ids_visitante: string[];
  accion: AccionQrVisitante;
  motivo?: string;
}) => {
  const response = await apiClient.patch("/visitante/qr-estado/masivo", data);
  return response.data;
};

export const actualizarVisitante = async (
  idVisitante: string,
  data: Partial<VisitanteFormValues>
) => {
  const formDataToSend = new FormData();

  // ✅ USAMOS LA FUNCIÓN SEGURA: Esto garantiza consistencia con la creación
  // Asegúrate de validar que existen los valores antes de construir
  if (data.fecha_visita && data.hora_estimada) {
    const fechaInicioISO = buildLocalDateIso(data.fecha_visita, data.hora_estimada);
    formDataToSend.append('fecha_inicio', fechaInicioISO);
  }

  if (data.fecha_visita && data.hora_salida) {
    const fechaFinISO = buildLocalDateIso(data.fecha_visita, data.hora_salida);
    formDataToSend.append('fecha_fin', fechaFinISO);
  }

  // Mapeo al payload
  const payload = {
    nombre: data.nombre_completo,
    tipo_visitante: data.tipo_visitante,
    telefono: data.telefono,
    motivo: data.motivo_visita,
    es_frecuente: data.es_frecuente,
    notas_adicionales: data.notas_adicionales,
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formDataToSend.append(key, String(value));
    }
  });

  if (data.foto) {
    formDataToSend.append("foto_visitante", data.foto);
  }

  const response = await apiClient.patch(`/visitante/${idVisitante}`, formDataToSend, {
    headers: { "Content-Type": undefined },
  });

  return response.data;
};
