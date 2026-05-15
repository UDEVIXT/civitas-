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