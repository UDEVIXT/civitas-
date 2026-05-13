import apiClient from "@/api/axios";

import type {
  EmpleadoDomesticoResponse,
  FiltroEmpleado,
} from "@/features/empleados-domesticos/types";

export const obtenerEmpleadosDomesticos = async (
  filtros?: FiltroEmpleado,
  search?: string,
  page?: number,
) => {
  const response = await apiClient.get<EmpleadoDomesticoResponse>("/empleado", {
    params: {
      page: page || 1,
      search: search ? search.trim() : undefined,
      ...filtros,
    },
  });
  console.log("Response from API:", response.data);
  return response.data;
};

export const activarEmpleadoDomestico = async (id: string, motivo?: string) => {
  try {
    await apiClient.put(`/empleado/${id}`, {
      data: {
        motivo: motivo,
        activo: true,
      },
    });
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Error al reincorporar el empleado doméstico.",
    };
  }
};

export const eliminarEmpleadoDomestico = async (
  id: string,
  motivo?: string,
) => {
  try {
    await apiClient.put(`/empleado/${id}`, {
      data: {
        motivo: motivo,
        activo: false,
      },
    });
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Error al eliminar el empleado doméstico.",
    };
  }
};
