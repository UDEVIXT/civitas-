import * as z from "zod";

// ✅ CORRECCIÓN 1: Obtenemos el "hoy" basado en tu zona horaria local, no en UTC.
const getFechaLocalLimpia = () => {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset() * 60000;
  return new Date(hoy.getTime() - offset).toISOString().split("T")[0];
};

const hoy = getFechaLocalLimpia();

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
      // ✅ CORRECCIÓN: Zod espera 'message' o 'error' para los enums, no 'required_error'
      message: "Selecciona el tipo de visitante",
    }
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
    .min(1, "Indica hasta qué hora será válido el QR"),

  vehiculo: z.string().trim().optional(),

  foto: z.any().optional(),

  es_frecuente: z.boolean(),
});

// ✅ CORRECCIÓN 2: Aplicamos el superRefine a una constante intermedia.
// De esta forma, cualquier esquema que herede de aquí obligará a cumplir los tiempos.
// ... (arriba se queda tu visitanteBaseSchema intacto)

// ✅ CORRECCIÓN: Separamos la lógica de la validación en una función reutilizable
const validarTiempos = (
  data: { fecha_visita?: string; hora_estimada?: string; hora_salida?: string },
  ctx: z.RefinementCtx
) => {
  if (
    data.fecha_visita &&
    data.hora_estimada &&
    data.hora_salida &&
    data.hora_salida <= data.hora_estimada
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["hora_salida"],
      message: "La vigencia del QR debe terminar después de la hora de llegada",
    });
  }
};

// 1. Esquema de Creación: Toma la base y le aplica la validación
export const visitanteSchema = visitanteBaseSchema.superRefine(validarTiempos);

// 2. Esquema de Edición: Toma la base, PRIMERO omite el vehículo, y LUEGO le aplica la validación
export const editarVisitanteSchema = visitanteBaseSchema
  .omit({ vehiculo: true })
  .superRefine(validarTiempos);

export type VisitanteFormValues = z.infer<typeof visitanteSchema>;
export type EditarVisitanteFormValues = z.infer<typeof editarVisitanteSchema>;