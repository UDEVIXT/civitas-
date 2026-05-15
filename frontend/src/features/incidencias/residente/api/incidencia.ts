import apiClient from "@/api/axios";
import { IncidenciaFormData } from '../schema/incidenciaSchema';

const mapFormDataToBackend = (formData: IncidenciaFormData) => {
    const isAnonymous = formData.usuario === 'anonimo';
    return {
        id_usuario: "550e8400-e29b-41d4-a716-446655440000",
        motivo: formData.motivo.substring(0, 100),
        descripcion: formData.descripcion,
        tipo: formData.tipoReporte,
        latitud: formData.ubicacion.lat,
        longitud: formData.ubicacion.lng,
        es_anonimo: isAnonymous,
        evidencias: formData.evidencia?.map(file => ({
          nombre_archivo: file.name,
        })) || []
    };
};

export const submitIncidencia = async (formData: IncidenciaFormData): Promise<{ success: boolean; message: string }> => {
    const payload = mapFormDataToBackend(formData);
    const response = await apiClient.post("/reportes", payload);

    return response.data;
};