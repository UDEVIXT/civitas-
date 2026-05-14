import apiClient from "@/api/axios";

import type { ResidenteResponse } from "@/features/empleados-domesticos/types";

export function obtenerResidentes() {
  return apiClient
    .get<ResidenteResponse[]>("/residente")
    .then((res) => res.data);
}
