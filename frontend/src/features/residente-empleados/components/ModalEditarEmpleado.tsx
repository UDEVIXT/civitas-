"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

// Tipos base para iterar la tabla
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

// 1. Esquema de un día individual
const horarioDiaSchema = z.object({
  dia: z.enum(DIAS_SEMANA),
  activo: z.boolean(),
  hora_entrada: z.string(),
  hora_salida: z.string(),
});

// 2. Esquema principal + Validaciones estrictas
const formSchema = z.object({
  nombre: z.string()
    .trim()
    .min(1, "Campo obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  
  telefono: z.string()
    .trim()
    .min(1, "Campo obligatorio")
    .regex(/^\d+$/, "Solo se permiten números")
    .length(10, "El teléfono debe tener exactamente 10 dígitos"),
  
  cargo: z.string()
    .trim()
    .min(1, "Campo obligatorio")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  
  notas_adicionales: z.string().optional(),
  foto: z.any().optional(),
  horarios: z.array(horarioDiaSchema),
}).superRefine((data, ctx) => {
  let tieneDiasActivos = false;

  data.horarios.forEach((horario, index) => {
    if (horario.activo) {
      tieneDiasActivos = true;
      // VALIDACIÓN CA005: Inconsistencia de horarios
      if (horario.hora_entrada >= horario.hora_salida) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La salida debe ser después de la entrada",
          path: ["horarios", index, "hora_salida"],
        });
      }
    }
  });

  if (!tieneDiasActivos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debes autorizar al menos un día de acceso",
      path: ["horarios"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

interface ModalEditarEmpleadoProps {
  empleado: EmpleadoDomestico | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: any) => void;
  isSaving?: boolean;
}

export function ModalEditarEmpleado({ empleado, isOpen, onClose, onSave, isSaving }: ModalEditarEmpleadoProps) {
  // Plantilla por defecto para los 7 días
  const [imagenPreview, setImagenPreview] = React.useState<string | null>(null);
  const horariosPorDefecto = DIAS_SEMANA.map(dia => ({
    dia,
    activo: false,
    hora_entrada: "08:00",
    hora_salida: "16:00"
  }));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      telefono: "",
      cargo: "",
      notas_adicionales: "",
      foto: undefined,
      horarios: horariosPorDefecto,
    },
  });

React.useEffect(() => {
    if (empleado) {
      setImagenPreview(null);
      const telefonoLimpio = (empleado.telefono || "").replace(/\D/g, "");
 
      const servicioAny = empleado.servicio as any;
      const empleadoAny = empleado as any;

      // 💡 CARGO BLINDADO: Primero busca en servicio.cargo, si no, usa el tipo_servicio
     const cargoReal = servicioAny?.cargo || servicioAny?.tipo_servicio?.nombre || "";

      // Diccionario para traducir de la BD al UI
      const mapeoDiasInverso: Record<string, string> = {
        'LUNES': 'Lunes', 'MARTES': 'Martes', 'MIERCOLES': 'Miércoles',
        'JUEVES': 'Jueves', 'VIERNES': 'Viernes', 'SABADO': 'Sábado', 'DOMINGO': 'Domingo'
      };

      const listaHorariosBD: any[] = servicioAny?.horarios || [];

      // Reconstruimos la tabla de 7 días cruzando con los datos de la BD
      const horariosMapeados = DIAS_SEMANA.map(diaUI => {
        // Buscamos si este día de la UI existe dentro de la respuesta del servidor
        const horarioBD = listaHorariosBD.find(h => mapeoDiasInverso[h.dia_semana] === diaUI);
        
        // 💡 FIX CRÍTICO: Si el registro existe en la lista de la BD, significa que está activo
        if (horarioBD) {
          let entradaStr = "08:00";
          let salidaStr = "16:00";

          if (horarioBD.hora_inicio) {
            if (horarioBD.hora_inicio.includes('T')) {
              entradaStr = horarioBD.hora_inicio.split('T')[1].substring(0, 5);
            } else {
              entradaStr = horarioBD.hora_inicio.substring(0, 5);
            }
          }

          if (horarioBD.hora_fin) {
            if (horarioBD.hora_fin.includes('T')) {
              salidaStr = horarioBD.hora_fin.split('T')[1].substring(0, 5);
            } else {
              salidaStr = horarioBD.hora_fin.substring(0, 5);
            }
          }

          return {
            dia: diaUI,
            activo: true, // 👈 Forzamos a true porque el backend ya lo filtró como activo
            hora_entrada: entradaStr,
            hora_salida: salidaStr,
          };
        }

        // Si no existe en la BD, se queda desmarcado por defecto
        return {
          dia: diaUI,
          activo: false,
          hora_entrada: "08:00",
          hora_salida: "16:00"
        };
      });

      form.reset({
        nombre: empleado.nombre || "",
        telefono: telefonoLimpio,
        cargo: cargoReal,
        notas_adicionales: empleadoAny.notas_adicionales || empleadoAny.motivo || "", 
        foto: undefined,
        horarios: horariosMapeados,
      });
    }
  }, [empleado, form]);

  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] p-4 sm:p-6 max-h-[95vh] overflow-y-auto overflow-x-hidden rounded-2xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-xl font-bold text-center text-gray-800">
            Editar Perfil y Accesos
          </DialogTitle>
          <DialogDescription className="sr-only">
            Modifica los datos y permisos de acceso del empleado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Header con Foto (Estilo Superpuesto) */}
            <div className="flex flex-col items-center justify-center gap-3 bg-gray-50 p-6 rounded-xl text-center">
              
              {/* Contenedor relativo para posicionar el botón encima de la foto */}
              <div className="relative inline-block">
                <Avatar className="h-28 w-28 border-4 border-white shadow-md">
                  <AvatarImage 
                    src={imagenPreview || empleado?.url_imagen || undefined} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-3xl">
                    {empleado?.nombre?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                {/* Botón flotante superpuesto en la esquina inferior derecha */}
                <FormField control={form.control} name="foto" render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="space-y-0 absolute bottom-0 right-0">
                    <FormLabel className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center shadow-sm transition-colors">
                      <Upload className="h-4 w-4" />
                      {/* Ocultamos el texto visualmente para que solo quede el icono redondo, como en la referencia */}
                      <span className="sr-only">Editar Foto</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                            setImagenPreview(URL.createObjectURL(file));
                          }
                        }}
                        {...fieldProps}
                      />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
                  {form.watch("nombre") || "Sin nombre"}
                </p>
              </div>
            </div>

            {/* Datos Personales (Apilados verticalmente con Filtros de Teclado) */}
            <div className="flex flex-col gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej. Juan Pérez" 
                      {...field} 
                      onChange={(e) => {
                        // Borra instantáneamente todo lo que no sean letras o espacios
                        const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                        field.onChange(valorLimpio);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="telefono" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Teléfono *</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      maxLength={10} 
                      placeholder="10 dígitos" 
                      {...field} 
                      onChange={(e) => {
                        // Borra instantáneamente todo lo que no sean números
                        const valorLimpio = e.target.value.replace(/\D/g, "");
                        field.onChange(valorLimpio);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="cargo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tipo de Empleado / Cargo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej. Chofer, Jardinero..." 
                      {...field} 
                      onChange={(e) => {
                        // Borra instantáneamente todo lo que no sean letras o espacios
                        const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                        field.onChange(valorLimpio);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Tabla de Horarios */}
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-sm">Horario de Acceso Permitido *</h3>
                <p className="text-xs text-muted-foreground">Define las horas de entrada y salida para cada día de la semana.</p>
              </div>
              
              <div className="hidden sm:grid grid-cols-[100px_60px_1fr_1fr] gap-4 px-2 py-1 bg-gray-100 rounded-t-md text-xs font-semibold text-gray-600">
                <div>Día</div>
                <div className="text-center">Activo</div>
                <div>Entrada</div>
                <div>Salida</div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-1">
                {form.watch("horarios").map((horario, index) => (
                  <div key={horario.dia} className="grid grid-cols-1 sm:grid-cols-[100px_60px_1fr_1fr] items-center gap-2 sm:gap-4 p-3 sm:p-2 bg-gray-50 sm:bg-transparent rounded-lg border sm:border-none">
                    
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className="text-sm font-medium">{horario.dia}</span>
                      <FormField control={form.control} name={`horarios.${index}.activo`} render={({ field }) => (
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="sm:hidden" />
                        </FormControl>
                      )} />
                    </div>

                    <div className="hidden sm:flex justify-center">
                      <FormField control={form.control} name={`horarios.${index}.activo`} render={({ field }) => (
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      )} />
                    </div>

                    <FormField control={form.control} name={`horarios.${index}.hora_entrada`} render={({ field }) => (
                      <FormItem className="space-y-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 sm:hidden w-12">Entrada</span>
                          <FormControl><Input type="time" disabled={!form.watch(`horarios.${index}.activo`)} className="h-8 w-full min-w-0" {...field} /></FormControl>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name={`horarios.${index}.hora_salida`} render={({ field }) => (
                      <FormItem className="space-y-0 relative">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 sm:hidden w-12">Salida</span>
                          <FormControl><Input type="time" disabled={!form.watch(`horarios.${index}.activo`)} className="h-8 w-full min-w-0" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-[10px] absolute -bottom-4 left-0 sm:left-auto" />
                      </FormItem>
                    )} />
                  </div>
                ))}
              </div>
              {form.formState.errors.horarios?.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.horarios.root.message}</p>
              )}
            </div>

            <FormField control={form.control} name="notas_adicionales" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Notas Adicionales <span className="text-xs font-normal text-gray-400">(Opcional)</span></FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej. Entra por la puerta de servicio..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1" disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold order-1 sm:order-2">
                {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Guardar Cambios"}
              </Button>
            </div>
            
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}