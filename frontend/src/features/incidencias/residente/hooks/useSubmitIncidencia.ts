import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitIncidencia } from '../api/incidencia';
import { useIncidenciaForm } from './useIncidenciaForm';
import { toast } from "sonner"

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
                resetForm();

                queryClient.invalidateQueries({ queryKey: ['reportes'] });
                queryClient.invalidateQueries({ queryKey: ['incidencias'] });

                toast.success("Reporte creado exitosamente");
            }
        },
        onError: (error: any) => {
            console.error('Error al enviar:', error);
            toast.error(error.response?.data?.message || 'Error al crear el reporte');
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });
};
