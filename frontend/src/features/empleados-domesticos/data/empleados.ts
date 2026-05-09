import type { EmpleadoDomestico } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type EmpleadosQuery = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
  byResidenteId?: number;
  byViviendaId?: number;
};

type ApiEmpleado = {
  id_visitante: string;
  nombre: string;
  telefono: string | null;
  servicio?: {
    activo: boolean;
    horario_texto?: string;
  } | null;
  residente?: {
    vivienda?: {
      numero_vivienda?: string | number | null;
    } | null;
  } | null;
};

type ApiResponse = {
  data: ApiEmpleado[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type EmpleadosMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type EmpleadosResponse = {
  data: EmpleadoDomestico[];
  meta: EmpleadosMeta;
};

function buildQueryParams(query?: EmpleadosQuery) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.limit) {
    params.set("limit", String(query.limit));
  }
  if (query.isActive !== undefined) {
    params.set("isActive", String(query.isActive));
  }
  if (query.byResidenteId) {
    params.set("byResidenteId", String(query.byResidenteId));
  }
  if (query.byViviendaId) {
    params.set("byViviendaId", String(query.byViviendaId));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function mapEmpleado(apiEmpleado: ApiEmpleado): EmpleadoDomestico {
  const destino =
    apiEmpleado.residente?.vivienda?.numero_vivienda !== undefined &&
    apiEmpleado.residente?.vivienda?.numero_vivienda !== null
      ? `${apiEmpleado.residente.vivienda.numero_vivienda}`
      : "Sin vivienda";

  return {
    id: apiEmpleado.id_visitante,
    nombre: apiEmpleado.nombre,
    telefono: apiEmpleado.telefono ?? "Sin telefono",
    estado: apiEmpleado.servicio?.activo ? "Activo" : "Inactivo",
    destino,
    horarioAutorizado: apiEmpleado.servicio?.horario_texto ?? "Sin horario",
  };
}

export async function getEmpleadosDomesticos(
  query?: EmpleadosQuery,
): Promise<EmpleadosResponse> {
  const queryString = buildQueryParams(query);
  const response = await fetch(`${API_BASE_URL}/empleado${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los empleados.");
  }

  const payload = (await response.json()) as ApiResponse;
  const data = (payload.data ?? []).map(mapEmpleado);
  const meta: EmpleadosMeta = payload.meta ?? {
    total: data.length,
    page: query?.page ?? 1,
    limit: query?.limit ?? data.length,
    totalPages: 1,
  };

  return { data, meta };
}

export async function deleteEmpleadoDomestico(id: string) {
  const response = await fetch(`${API_BASE_URL}/empleado/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo dar de baja al empleado.");
  }

  return response.json();
}

export async function updateEmpleadoDomestico(
  id: string,
  payload: { activo: boolean; motivo?: string },
) {
  const response = await fetch(`${API_BASE_URL}/empleado/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar el empleado.");
  }

  return response.json();
}
