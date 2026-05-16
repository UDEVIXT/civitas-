import apiClient from "@/api/axios";

import type {
  EmpleadoDomesticoResponse,
  FiltroEmpleado,
} from "@/features/empleados-domesticos/types";

export const actualizarEmpleadoResidente = async (id: string, data: any) => {
  try {
    const response = await apiClient.put(`/empleado/${id}`, {
      accion: "actualizacion_residente", // Etiqueta para el backend
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        url_imagen: data.foto,
        cargo: data.cargo,
        // Mandamos las horas por separado como se configuró en el modal
        hora_entrada: data.hora_entrada,
        hora_salida: data.hora_salida,
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al actualizar los datos.",
    };
  }
};

export const cambiarEstadoEmpleado = async (
  id: string,
  accion: "baja" | "reactivacion",
  motivo?: string,
) => {
  const response = await apiClient.put(`/empleado/${id}`, {
    accion,
    data: {
      motivo,
    },
  });

  return { success: true, data: response.data };
};

export const obtenerEmpleadosDomesticos = async (
  filtros?: FiltroEmpleado,
  search?: string,
  page?: number,
) => {
  const response = await apiClient.get<EmpleadoDomesticoResponse>("/empleado-general/mis-empleados", {
    params: {
      page: page || 1,
      search: search ? search.trim() : undefined,
      ...filtros,
    },
  });
  console.log("Response from API:", response.data);
  return response.data;
};