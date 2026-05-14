import apiClient from "@/api/axios";

import type { ViviendaResponse } from "@/features/empleados-domesticos/types";

export function obtenerViviendas() {
  return apiClient.get<ViviendaResponse[]>("/vivienda").then((res) => res.data);
}
