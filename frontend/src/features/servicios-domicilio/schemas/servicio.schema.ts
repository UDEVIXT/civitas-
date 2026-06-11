import * as z from "zod";

const hoy = new Date().toISOString().split("T")[0];

export const servicioDomicilioSchema = z.object({
  // --- TODOS OBLIGATORIOS SEGÚN QA ---
  tipo_servicio: z.string()
    .trim()
    .min(1, "El tipo de servicio es obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),

  nombre_empresa: z.string()
    .trim()
    .min(1, "El nombre de la empresa es obligatorio"),

  fecha_visita: z.string()
    .min(1, "La fecha es obligatoria")
    .refine((fecha) => fecha >= hoy, {
      message: "No puedes programar un servicio en el pasado",
    }),

  hora_estimada: z.string()
    .min(1, "El horario estimado es obligatorio"),

  nombre_tecnico: z.string()
    .trim()
    .min(1, "El nombre del técnico es obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),

  placas: z.string()
    .trim()
    .toUpperCase()
    .min(1, "Las placas son obligatorias") 
    .regex(/^[a-zA-Z0-9-\s]+$/, "Formato de placas inválido"),

  // Para la foto, validamos que exista un archivo seleccionado
  foto: z.any()
    .refine((file) => file instanceof File, "La foto del trabajador es obligatoria"),

  // Frecuencia y Notas se quedan como opcionales o con valor por defecto
  frecuencia: z.enum(["UNICA_VEZ", "RECURRENTE", "PROGRAMADO"]),
  notas: z.string().trim().optional(),
});

export type ServicioDomicilioFormValues = z.infer<typeof servicioDomicilioSchema>;