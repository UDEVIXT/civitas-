/**
 * Aquí cumplimos estrictamente con el CA002 (datos obligatorios) y el CA008 (mensajes de error si está incompleto o inválido).
 */

import * as z from "zod";

// Fecha actual para validación de que no agenden en el pasado
const hoy = new Date().toISOString().split("T")[0];

const visitanteBaseSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(1, "El nombre completo es obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras en el nombre"),

  telefono: z.string().trim().min(10, "El teléfono debe tener 10 dígitos"),

  tipo_visitante: z.enum(
    ["Visita Personal", "Proveedor", "Familiar", "Servicio", "Otro"],
    {
      required_error: "Selecciona el tipo de visitante",
    },
  ),

  motivo_visita: z.string().trim().min(1, "Especifica el motivo de la visita"),

  notas_adicionales: z.string().trim().optional(),

  fecha_visita: z
    .string()
    .min(1, "La fecha de visita es obligatoria")
    .refine((fecha) => fecha >= hoy, {
      message: "No puedes agendar una visita para un día que ya pasó",
    }),

  hora_estimada: z.string().min(1, "La hora de llegada es obligatoria"),

  hora_salida: z
    .string()
    .min(1, "Indica hasta quÃ© hora serÃ¡ vÃ¡lido el QR"),

  // Vehículo opcional
  vehiculo: z.string().trim().optional(),

  foto: z.any().optional(),

  es_frecuente: z.boolean(),
});

export const visitanteSchema = visitanteBaseSchema.superRefine((data, ctx) => {
  if (
    data.fecha_visita &&
    data.hora_estimada &&
    data.hora_salida &&
    data.hora_salida <= data.hora_estimada
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["hora_salida"],
      message: "La vigencia del QR debe terminar despuÃ©s de la hora de llegada",
    });
  }
});

export const editarVisitanteSchema = visitanteBaseSchema.omit({
  vehiculo: true,
});

export type VisitanteFormValues = z.infer<typeof visitanteSchema>;
export type EditarVisitanteFormValues = z.infer<typeof editarVisitanteSchema>;
