import apiClient from "@/api/axios";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { IncidenciaFormData } from "../schema/incidenciaSchema";

const mapFormDataToBackend = (formData: IncidenciaFormData) => {
  const user = useAuth.getState().user;

  if (!user?.id) {
    throw new Error("No hay usuario autenticado para crear el reporte");
  }

  const isAnonymous = formData.usuario === "anonimo";

  const formDataToSend = new FormData();
  formDataToSend.append('id_usuario', user.id);
  formDataToSend.append('motivo', formData.motivo.substring(0, 100));
  formDataToSend.append('descripcion', formData.descripcion);
  formDataToSend.append('tipo', formData.tipoReporte);
  formDataToSend.append('latitud', formData.ubicacion.lat.toString());
  formDataToSend.append('longitud', formData.ubicacion.lng.toString());
  formDataToSend.append('es_anonimo', isAnonymous.toString());
  formDataToSend.append('resultado_esperado', formData.solucionEsperada);

  if (formData.imagen && formData.imagen.length > 0) {
    formData.imagen.forEach((file) => {
      formDataToSend.append('imagen', file);
    });
  }

  return formDataToSend;
};

export const submitIncidencia = async (
  formData: IncidenciaFormData,
): Promise<{ success: boolean; message: string }> => {
  const payload = mapFormDataToBackend(formData);
  const response = await apiClient.post("/reportes", payload, {
    headers: {
      'Content-Type': undefined,
    },
  });

  return response.data;
};
