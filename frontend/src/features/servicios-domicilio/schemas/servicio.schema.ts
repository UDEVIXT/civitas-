import * as z from "zod";

// Obtenemos la fecha de hoy en formato YYYY-MM-DD para la validación
const hoy = new Date().toISOString().split("T")[0];

export const servicioDomicilioSchema = z.object({
  // CA003: Tipo de servicio ahora es texto libre
  tipo_servicio: z.string()
    .trim()
    .min(1, "El tipo de servicio es obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),

  // CA003: Empresa o Proveedor
  nombre_empresa: z.string()
    .trim()
    .min(1, "El nombre de la empresa o proveedor es obligatorio"),

  frecuencia: z.enum(["UNICA_VEZ", "RECURRENTE", "PROGRAMADO"]),

  // CA003: Fecha de la visita con validación de no pasado
  fecha_visita: z.string()
    .min(1, "La fecha de la visita es obligatoria")
    .refine((fecha) => fecha >= hoy, {
      message: "No puedes programar un servicio en el pasado",
    }),

  hora_estimada: z.string()
    .min(1, "El horario estimado es obligatorio"),

  nombre_tecnico: z.string()
    .trim()
    .optional()
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), {
      message: "El nombre del técnico solo puede contener letras",
    }),

  placas: z.string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9-\s]+$/.test(val), {
      message: "Formato de placas inválido",
    }),

  notas: z.string().trim().optional(),
  foto: z.string().trim().optional(),
});

export type ServicioDomicilioFormValues = z.infer<typeof servicioDomicilioSchema>;