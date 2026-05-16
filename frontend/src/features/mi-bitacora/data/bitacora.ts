import type {
  MiBitacoraDetalleResponse,
  MiBitacoraDetalle,
  MiBitacoraFilters,
  MiBitacoraResponse,
} from "../types";

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

function buildQuery(filters: MiBitacoraFilters) {
  const params = new URLSearchParams();

  if (filters.residentUserId?.trim()) {
    params.set("residentUserId", filters.residentUserId.trim());
  }

  if (filters.residentName?.trim()) {
    params.set("residentName", filters.residentName.trim());
  }

  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 10));
  params.set("sort", filters.sort ?? "desc");

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.personType) {
    params.set("personType", filters.personType);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  return params.toString();
}

export async function getMiBitacora(filters: MiBitacoraFilters) {
  const query = buildQuery(filters);
  const response = await fetch(`/api/mi-bitacora?${query}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as MiBitacoraResponse & {
    message?: string;
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? "No fue posible cargar la bitacora.");
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

  const response = await fetch(
    `/api/mi-bitacora/${idBitacora}?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as MiBitacoraDetalleResponse & {
    message?: string;
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? "No fue posible cargar el detalle.");
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

  const response = await fetch(
    `/api/mi-bitacora/${idBitacora}/frecuencia?${params.toString()}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ es_frecuente: esFrecuente }),
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as {
    success: boolean;
    message?: string;
    es_frecuente?: boolean;
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? "No fue posible actualizar la frecuencia.");
  }

  return payload;
}
