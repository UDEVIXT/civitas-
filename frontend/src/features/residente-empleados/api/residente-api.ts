import apiClient from "@/api/axios";

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

export const obtenerMisEmpleados = async (
  search?: string,
  page = 1,
  limit = 7,
  isActive = true,
) => {
  const response = await apiClient.get(
    "/empleado-general/mis-empleados",
    {
      params: {
        search,
        page,
        limit,
        isActive,
      },
    }
  );

  return response.data;
};