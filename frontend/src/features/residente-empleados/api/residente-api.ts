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
  const response = await apiClient.get<EmpleadoDomesticoResponse>(
    "/mi-empleado",
    {
      params: {
        page: page || 1,
        search: search ? search.trim() : undefined,
        ...filtros,
      },
    },
  );
  return response.data;
};

export const toggleEmpleadoActivo = async (
  empleado: {
    id_visitante: string;
    servicio?: {
      activo?: boolean;
    };
  },
  motivo?: string,
) => {
  try {
    if (!empleado?.id_visitante) {
      throw new Error("Empleado inválido: falta id_visitante");
    }

    // 🔥 IMPORTANTE: fallback seguro
    const estaActivo = Boolean(empleado?.servicio?.activo);

    const payload = {
      activo: !estaActivo, // 👈 toggle real (más limpio)
      ...(estaActivo && {
        motivo: motivo || "Baja realizada desde el panel",
      }),
    };

    const response = await apiClient.put(
      `/mi-empleado/${empleado.id_visitante}`,
      payload,
    );

    return response.data;
  } catch (error: any) {
    console.error("Error al cambiar estado del empleado:", error);

    if (error.isAxiosError && !error.response) {
      throw new Error("Error de conexión: No se pudo conectar con el servidor. Revisa tu red.");
    }

    throw (
      error?.response?.data || {
        message: "No se pudo actualizar el estado del empleado",
      }
    );
  }
};

// Se modificó la función para que reciba directamente el FormData desde el hook y soporte la foto
export const actualizarEmpleadoResidente = async (id: string, formData: FormData) => {
  try {
    const response = await apiClient.put(`/mi-empleado/${id.trim()}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Error al actualizar los datos.",
    };
  }
};

export interface HorarioEmpleadoDomestico {
  dia_semana:
    | "LUNES"
    | "MARTES"
    | "MIERCOLES"
    | "JUEVES"
    | "VIERNES"
    | "SABADO"
    | "DOMINGO";
  hora_inicio: string;
  hora_fin: string;
}

export interface CrearEmpleadoDomesticoRequest {
  nombre_completo: string;
  rfc: string;
  id_tipo_servicio: string;
  confirmar_reuso_rfc?: boolean;
  telefono?: string;
  url_imagen?: string;
  horarios: HorarioEmpleadoDomestico[];
}

export const crearEmpleadoDomestico = async (
  data: CrearEmpleadoDomesticoRequest | FormData,
) => {
  const response = await apiClient.post("/empleado/empleado-domestico", data,{
    // Se fuerza la cabecera para que Axios y el backend entiendan que viaja un archivo
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
