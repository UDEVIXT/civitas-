import { z } from 'zod';

export const IncidenciaSchema = z.object({
    usuario: z.string().min(1, "Debes seleccionar un usuario"),
    tipoReporte: z.string().min(1, "Debes seleccionar un tipo de reporte"),
    motivo: z.string().min(1, "El motivo es requerido").max(100, "No puede exceder los 100 caracteres"),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    ubicacion: z.object({
        lat: z.number(),
        lng: z.number(),
        direccion: z.string().min(1, "Debes seleccionar una ubicación en el mapa"),
    }),
    solucionEsperada: z.string().min(10, "La solución esperada debe tener al menos 10 caracteres"),
    imagen: z.array(z.instanceof(File)).optional(),
});

export type IncidenciaFormData = z.infer<typeof IncidenciaSchema>;
