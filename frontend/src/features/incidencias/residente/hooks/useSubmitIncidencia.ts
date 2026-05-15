import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitIncidencia } from '../api/incidencia';
import { useIncidenciaForm } from './useIncidenciaForm';
import { useToast } from "@/hooks/use-toast";

export const useSubmitIncidencia = () => {
    const queryClient = useQueryClient();
    const { resetForm, setIsSubmitting } = useIncidenciaForm();
    const { toast } = useToast();

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

                toast({
                    title: "Éxito",
                    description: "Reporte enviado con éxito",
                });
            }
        },
        onError: (error: any) => {
            console.error('Error al enviar:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || 'Error al crear el reporte',
                variant: "destructive",
            });
        },
        onSettled: () => {
            setIsSubmitting(false);
        },
    });
};
