import apiClient from "@/api/axios";
import type {
  EmpleadoDomesticoResponse,
  FiltroEmpleado,
} from "@/features/empleados-domesticos/types"; 

// NUEVA FUNCIÓN: Solo para que el residente vea a sus propios empleados
export const obtenerMisEmpleados = async (
  filtros?: FiltroEmpleado,
  search?: string,
  page?: number,
) => {
  //Cambiamos "/empleado" por "/mi-empleado"
  const response = await apiClient.get<EmpleadoDomesticoResponse>("/mi-empleado", {
    params: {
      page: page || 1,
      search: search ? search.trim() : undefined,
      ...filtros,
    },
  });
  return response.data;
};

// 
export const actualizarEmpleadoResidente = async (id: string, data: any) => {
  try {
    const response = await apiClient.put(`/mi-empleado/${id.trim()}`, {
      accion: "actualizacion_residente", 
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        foto: data.foto, 
        cargo: data.cargo,
        hora_entrada: data.hora_entrada,
        hora_salida: data.hora_salida,
        dias_autorizados: data.dias_autorizados,
        notas: data.notas,
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

