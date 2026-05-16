import { create } from 'zustand';
import { IncidenciaFormData } from '../schema/incidenciaSchema';

interface FormState {
    formData: Partial<IncidenciaFormData>;
    errors: Record<string, string>;
    isSubmitting: boolean;
    isDirty: boolean;
    
    // Actions
    setFormData: (data: Partial<IncidenciaFormData>) => void;
    setField: (field: keyof IncidenciaFormData, value: any) => void;
    setErrors: (errors: Record<string, string>) => void;
    clearErrors: () => void;
    setFieldError: (field: string, error: string) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    resetForm: () => void;
    validateForm: () => boolean;
}

const initialFormData: Partial<IncidenciaFormData> = {
    usuario: '',
    tipoReporte: '',
    motivo: '',
    descripcion: '',
    ubicacion: undefined,
    solucionEsperada: '',
    imagen: [],
};

export const useIncidenciaForm = create<FormState>((set, get) => ({
    formData: initialFormData,
    errors: {},
    isSubmitting: false,
    isDirty: false,

    setFormData: (data) => set((state) => ({ 
        formData: { ...state.formData, ...data },
        isDirty: true 
    })),

    setField: (field, value) => set((state) => ({ 
        formData: { ...state.formData, [field]: value },
        isDirty: true 
    })),

    setErrors: (errors) => set({ errors }),

    clearErrors: () => set({ errors: {} }),

    setFieldError: (field, error) => set((state) => ({ 
        errors: { ...state.errors, [field]: error }
    })),

    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

    resetForm: () => set({
        formData: initialFormData,
        errors: {},
        isSubmitting: false,
        isDirty: false
    }),

    validateForm: () => {
        const { formData } = get();
        const errors: Record<string, string> = {};

        // Validaciones
        if (!formData.usuario || formData.usuario === '') {
            errors.usuario = "Falta seleccionar el usuario para este reporte";
        }

        if (!formData.tipoReporte || formData.tipoReporte === '') {
            errors.tipoReporte = "Indica el tipo de reporte que vas a realizar";
        }

        if (!formData.motivo || formData.motivo.trim().length === 0) {
            errors.motivo = "Es necesario que indiques el motivo";
        }

        if (!formData.descripcion || formData.descripcion.trim().length === 0) {
            errors.descripcion = "La descripción no puede quedar vacía";
        }

        if (!formData.ubicacion || 
            !formData.ubicacion.lat || 
            !formData.ubicacion.lng || 
            !formData.ubicacion.direccion || 
            formData.ubicacion.direccion.trim() === '') {
            errors.ubicacion = "Selecciona una ubicación válida en el mapa";
        }

        if (!formData.solucionEsperada || formData.solucionEsperada.trim().length === 0) {
            errors.solucionEsperada = "Por favor, dinos qué solución esperas";
        }

        console.log('VALIDATION ERRORS FOUND:', errors);
        set({ errors });
        const isValid = Object.keys(errors).length === 0;
        
        setTimeout(() => {
            set({ errors });
        }, 0);
        
        console.log('VALIDATION RESULT:', isValid);
        return isValid;
    },
}));
