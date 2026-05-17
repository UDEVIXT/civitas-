import type {
  MiBitacoraDetalleResponse,
  MiBitacoraDetalle,
  MiBitacoraFilters,
  MiBitacoraResponse,
} from "../types";
import apiClient from "@/api/axios";

function mapDetalleResponse(payload: MiBitacoraDetalleResponse): MiBitacoraDetalle {
  const detail = payload.data as unknown as {
    id?: string;
    nombre?: string;
    tipo_persona?: "visitante" | "empleado" | "proveedor";
    fecha_entrada?: string;
    fecha_salida?: string | null;
    metodo_acceso?: "QR" | "lista" | "manual";
    guardia_registro?: string;
    avatar_url?: string | null;
    qr_utilizado?: string | null;
    notas?: string | null;
  };

  return {
    id_bitacora: detail.id ?? payload.data.id_bitacora,
    nombre_persona: payload.data.nombre_persona ?? detail.nombre ?? "",
    tipo_persona: payload.data.tipo_persona,
    fecha_hora_entrada: payload.data.fecha_hora_entrada ?? detail.fecha_entrada ?? "",
    fecha_hora_salida:
      payload.data.fecha_hora_salida ?? (detail.fecha_salida && detail.fecha_salida !== "-" ? detail.fecha_salida : null),
    metodo_acceso: payload.data.metodo_acceso ?? detail.metodo_acceso ?? "manual",
    guardia: payload.data.guardia ?? {
      id_guardia: "",
      nombre: detail.guardia_registro ?? "-",
    },
    es_frecuente: payload.data.es_frecuente ?? (detail.metodo_acceso === "lista"),
    detalle: {
      foto_visitante: payload.data.detalle?.foto_visitante ?? detail.avatar_url ?? null,
      qr_utilizado: payload.data.detalle?.qr_utilizado ?? detail.qr_utilizado ?? null,
      notas_guardia_entrada:
        payload.data.detalle?.notas_guardia_entrada ?? detail.notas ?? null,
      notas_guardia_salida: payload.data.detalle?.notas_guardia_salida ?? null,
    },
  };
}

function buildQueryObject(filters: MiBitacoraFilters) {
  const params: Record<string, string | number | undefined> = {};

  if (filters.residentUserId?.trim()) params.residentUserId = filters.residentUserId.trim();
  if (filters.residentName?.trim()) params.residentName = filters.residentName.trim();

  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 10;
  params.sort = filters.sort ?? "desc";

  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.personType) params.personType = filters.personType;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  return params;
}

export async function getMiBitacora(filters: MiBitacoraFilters) {
  const params = buildQueryObject(filters);

  const response = await apiClient.get<MiBitacoraResponse>("/bitacora/mi-bitacora", {
    params,
    // disable axios cache if needed via headers
    headers: { "Cache-Control": "no-store" },
  });

  const payload = response.data as MiBitacoraResponse & { message?: string };

  if (!payload || !payload.success) {
    throw new Error(payload?.message ?? "No fue posible cargar la bitacora.");
  }

  return payload;
}

export async function getMiBitacoraDetalle(
  idBitacora: string,
  residentUserId?: string,
  residentName?: string,
) {
  const params = new URLSearchParams();

  if (residentUserId?.trim()) {
    params.set("residentUserId", residentUserId.trim());
  }

  if (residentName?.trim()) {
    params.set("residentName", residentName.trim());
  }

  const query = new URLSearchParams();
  if (params.toString()) {
    // no-op, params already built above
  }

  const response = await apiClient.get<MiBitacoraDetalleResponse>(`/bitacora/${idBitacora}`, {
    params: Object.fromEntries(params.entries ? params.entries() : []),
    headers: { "Cache-Control": "no-store" },
  });

  const payload = response.data as MiBitacoraDetalleResponse & { message?: string };

  if (!payload || !payload.success) {
    throw new Error(payload?.message ?? "No fue posible cargar el detalle.");
  }

  return {
    ...payload,
    data: mapDetalleResponse(payload),
  };
}

export async function actualizarFrecuenciaVisitante(
  idBitacora: string,
  esFrecuente: boolean,
  residentUserId?: string,
  residentName?: string,
) {
  const params = new URLSearchParams();

  if (residentUserId?.trim()) {
    params.set("residentUserId", residentUserId.trim());
  }

  if (residentName?.trim()) {
    params.set("residentName", residentName.trim());
  }

  const paramsObj: Record<string, string> = {};
  if (residentUserId?.trim()) paramsObj.residentUserId = residentUserId.trim();
  if (residentName?.trim()) paramsObj.residentName = residentName.trim();

  const response = await apiClient.patch<{
    success: boolean;
    message?: string;
    es_frecuente?: boolean;
  }>(`/bitacora/${idBitacora}/frecuencia`, { es_frecuente: esFrecuente }, { params: paramsObj });

  const payload = response.data;

  if (!payload || !payload.success) {
    throw new Error(payload?.message ?? "No fue posible actualizar la frecuencia.");
  }

  return payload;
}
