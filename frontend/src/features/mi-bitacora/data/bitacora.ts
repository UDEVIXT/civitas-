import type {
  MiBitacoraDetalleResponse,
  MiBitacoraFilters,
  MiBitacoraResponse,
} from "../types";

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

  return payload;
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
