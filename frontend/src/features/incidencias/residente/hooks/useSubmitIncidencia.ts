import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncidenciaFormData } from '../schema/incidenciaSchema';
import { useIncidenciaForm } from './useIncidenciaForm';

interface SubmitResponse {
    success: boolean;
    message: string;
    data?: any;
}

const mapFormDataToBackend = (formData: IncidenciaFormData) => {
    const isAnonymous = formData.usuario === 'anonimo';
    
    return {
        id_usuario: isAnonymous ? null : formData.usuario,
        motivo: formData.motivo.substring(0, 100), // Limitar a 100 caracteres como en el backend
        descripcion: formData.descripcion,
        tipo: formData.tipoReporte as 'queja' | 'sugerencia' | 'incidente',
        latitud: formData.ubicacion.lat,
        longitud: formData.ubicacion.lng,
        es_anonimo: isAnonymous,
        resultado_esperado: formData.solucionEsperada,
        evidencias: formData.evidencia?.map(file => ({
          nombre_archivo: file.name,
        })) || []
    };
};

const submitIncidencia = async (formData: IncidenciaFormData): Promise<SubmitResponse> => {
    try {
      const backendData = mapFormDataToBackend(formData);
      const submitData = new FormData();
      
      submitData.append('data', JSON.stringify(backendData));
      
      if (formData.evidencia && formData.evidencia.length > 0) {
          formData.evidencia.forEach((file, index) => {
              submitData.append(`evidencia_${index}`, file);
          });
      }
      
      const response = await fetch('/api/reportes', {
          method: 'POST',
          body: submitData,
      });
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el reporte');
      }
      
      const result = await response.json();
      
      return {
          success: true,
          message: "Reporte creado exitosamente",
          data: result
      };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error desconocido al crear el reporte",
            data: null
        };
    }
  };

  export const useSubmitIncidencia = () => {
      const queryClient = useQueryClient();
      const { resetForm, setIsSubmitting } = useIncidenciaForm();

      return useMutation({
          mutationFn: submitIncidencia,
          onMutate: () => {
              setIsSubmitting(true);
          },
          onSuccess: (data) => {
              if (data.success) {
                console.log('Reporte creado exitosamente:', data);
                resetForm();

                queryClient.invalidateQueries({ queryKey: ['reportes'] });
                queryClient.invalidateQueries({ queryKey: ['incidencias'] });
                
                if (typeof window !== 'undefined') {
                  alert(data.message);
                }
              } else {
                  console.error('Error en la respuesta:', data.message);
                  if (typeof window !== 'undefined') {
                    alert(data.message);
                  }
              }
          },
          onError: (error) => {
              console.error('Error al enviar el reporte:', error);
              if (typeof window !== 'undefined') {
                alert('Error al crear el reporte. Por favor intenta nuevamente.');
              }
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
      });
};
