/**
 * Aquí cumplimos estrictamente con el CA002 (datos obligatorios) y el CA008 (mensajes de error si está incompleto o inválido).
 */

import * as z from "zod";

// Fecha actual para validación de que no agenden en el pasado
const hoy = new Date().toISOString().split("T")[0];

export const visitanteSchema = z.object({
  nombre_completo: z.string()
    .trim()
    .min(1, "El nombre completo es obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras en el nombre"),

  telefono: z.string().trim()
    .min(10, "El teléfono debe tener 10 dígitos"),

  tipo_visitante: z.string()
    .min(1, "Selecciona el tipo de visitante"),

  motivo_visita: z.string()
    .trim()
    .min(1, "Especifica el motivo de la visita"),

  fecha_visita: z.string()
    .min(1, "La fecha de visita es obligatoria")
    .refine((fecha) => fecha >= hoy, {
      message: "No puedes agendar una visita para un día que ya pasó",
    }),

  hora_estimada: z.string()
    .min(1, "La hora de llegada es obligatoria"),
  
  hora_salida: z.string()
    .min(1, "La hora de salida es obligatoria"),

  // Vehículo opcional
  vehiculo: z.string().trim().optional(),

  foto: z.any().optional(),

  es_frecuente: z.boolean(), 
});

export type VisitanteFormValues = z.infer<typeof visitanteSchema>;