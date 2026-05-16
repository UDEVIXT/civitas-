import * as z from "zod";

export const servicioDomicilioSchema = z.object({
  // CA003: Tipo de servicio (Gas, Agua, etc.)
  id_tipo_servicio: z.string()
    .min(1, "Selecciona un tipo de servicio"),

  // CA003: Empresa o Proveedor
  nombre_empresa: z.string()
    .trim()
    .min(1, "El nombre de la empresa o proveedor es obligatorio"),

  // Control de frecuencia para el NTH001
  frecuencia: z.enum(["UNICA_VEZ", "RECURRENTE", "PROGRAMADO"]),

  // CA003: Fecha de la visita (Obligatoria si es Única vez)
  fecha_visita: z.string()
    .min(1, "La fecha de la visita es obligatoria"),

  // CA003: Horario estimado (Formato de hora HH:MM)
  hora_estimada: z.string()
    .min(1, "El horario estimado es obligatorio"),

  // CA003 & CA004: Nombre del técnico (Opcional, pero si se escribe, solo letras)
  nombre_tecnico: z.string()
    .trim()
    .optional()
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), {
      message: "El nombre del técnico solo puede contener letras",
    }),

  // CA003 & CA004: Número de identificación o placas (Opcional, alfanumérico con guiones)
  placas: z.string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9-\s]+$/.test(val), {
      message: "Formato de placas inválido (solo letras, números y guiones)",
    }),

  // Notas adicionales opcionales para la caseta
  notas: z.string().trim().optional(),
  
  // URL de foto opcional para identificar al proveedor
  foto: z.string().trim().optional(),
});

// Exportamos el tipo inferido para usarlo en React Hook Form
export type ServicioDomicilioFormValues = z.infer<typeof servicioDomicilioSchema>;