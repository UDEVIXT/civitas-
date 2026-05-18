import apiClient from "@/api/axios";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { IncidenciaFormData } from "../schema/incidenciaSchema";

const mapFormDataToBackend = (formData: IncidenciaFormData) => {
  const user = useAuth.getState().user;

  if (!user?.id) {
    throw new Error("No hay usuario autenticado para crear el reporte");
  }

  const isAnonymous = formData.usuario === "anonimo";

  return {
    id_usuario: user.id,
    motivo: formData.motivo.substring(0, 100),
    descripcion: formData.descripcion,
    tipo: formData.tipoReporte,
    latitud: formData.ubicacion.lat,
    longitud: formData.ubicacion.lng,
    es_anonimo: isAnonymous,
    resultado_esperado: formData.solucionEsperada,
    imagenes:
      formData.imagen?.map((file) => ({
        nombre_archivo: file.name,
      })) || [],
  };
};

export const submitIncidencia = async (
  formData: IncidenciaFormData,
): Promise<{ success: boolean; message: string }> => {
  const payload = mapFormDataToBackend(formData);
  const response = await apiClient.post("/reportes", payload);

  return response.data;
};
