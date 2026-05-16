import apiClient from "@/api/axios";


export const getEmpleadosResidente = async (residenteId: string, search: string = "") => {
  try {
    console.log("📡 [API CLIENT] Enviando GET a /mi-empleado. Params ->", { byResidenteId: residenteId, search });
    
    const response = await apiClient.get('mi-empleado', { // 💡 Consejo: Quítale el '/' inicial si ves que falla
      params: {
        byResidenteId: residenteId,
        search: search || undefined,
        limit: 10,
      },
    });

    console.log("✅ [API CLIENT] Respuesta exitosa del servidor:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ [API CLIENT] Error en la petición Axios:", error.response || error);
    throw error;
  }
};

export const actualizarEmpleadoResidente = async (id: string, data: any) => {
  try {
    // Forzamos el uso de tu ruta limpia sin espacios accidentales
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

