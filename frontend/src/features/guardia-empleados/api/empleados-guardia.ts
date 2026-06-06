import apiClient from "@/api/axios";

export interface EmpleadoGuardia {
  id_visitante: string;
  id_servicio: string | null;
  nombre_completo: string;
  propiedad_asociada: string;
  id_vivienda: string | null;
  residente_asociado: string;
  tipo_empleado: string;
  dias_autorizados: string[];
  horarios_autorizados: string[];
  estado_acceso: "Activo" | "Inactivo";
  bloqueo_global: boolean;
}

export interface EmpleadosGuardiaRespuesta {
  success: boolean;
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  data: EmpleadoGuardia[];
}

export interface FiltrosEmpleadosGuardia {
  search?: string;
  page?: number;
  limit?: number;
  idVivienda?: string;
}

export interface ViviendaConEmpleados {
  id_vivienda: string;
  numero_vivienda: string;
}

export async function obtenerViviendasConEmpleados(): Promise<ViviendaConEmpleados[]> {
  const response = await apiClient.get<{ success: boolean; data: ViviendaConEmpleados[] }>(
    "/empleado/viviendas-con-empleados"
  );
  return response.data.data ?? [];
}

export async function obtenerEmpleadosGuardia(
  filtros: FiltrosEmpleadosGuardia = {}
): Promise<EmpleadosGuardiaRespuesta> {
  const response = await apiClient.get<EmpleadosGuardiaRespuesta>(
    "/empleado/lista-guardia",
    {
      params: {
        search: filtros.search?.trim() || undefined,
        page: filtros.page ?? 1,
        limit: filtros.limit ?? 8,
        idVivienda: filtros.idVivienda || undefined,
      },
    }
  );
  return response.data;
}
