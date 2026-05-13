"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, X } from "lucide-react";
//import { toast } from "sonner"; // O la librería de notificaciones que usen

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { EmpleadoDomestico } from "@/features/residente_empleados/types";

// Esquema de validación robusto (CA004 y CA005)
const formSchema = z.object({
  nombre: z.string().min(3, "El nombre es obligatorio."),
  tipo: z.enum(["Limpieza", "Chofer", "Cuidador", "Jardinería", "Otros"], {
    required_error: "Selecciona el tipo de empleado.",
  }),
  telefono: z.string().regex(/^\d{10}$/, "Deben ser 10 dígitos."),
  horario_inicio: z.string().min(1, "Requerido"),
  horario_fin: z.string().min(1, "Requerido"),
  notas: z.string().max(200, "Máximo 200 caracteres").optional(),
  estado: z.enum(["Activo", "Inactivo"]),
}).refine((data) => {
  // Validación de consistencia de horario (CA005)
  return data.horario_inicio < data.horario_fin;
}, {
  message: "El horario de fin debe ser posterior al de inicio",
  path: ["horario_fin"],
});

type FormValues = z.infer<typeof formSchema>;

interface ModalEditarEmpleadoProps {
  empleado: EmpleadoDomestico | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModalEditarEmpleado({ empleado, isOpen, onClose, onSuccess }: ModalEditarEmpleadoProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      tipo: "Limpieza",
      telefono: "",
      horario_inicio: "08:00",
      horario_fin: "16:00",
      notas: "",
      estado: "Activo",
    },
  });

  // Cargar datos registrados (CA002)
  React.useEffect(() => {
    if (empleado) {
      form.reset({
        nombre: empleado.nombre,
        tipo: (empleado as any).tipo || "Limpieza",
        telefono: empleado.telefono || "",
        horario_inicio: (empleado as any).horario_inicio || "08:00",
        horario_fin: (empleado as any).horario_fin || "16:00",
        notas: (empleado as any).notas || "",
        estado: empleado.estado === "Activo" ? "Activo" : "Inactivo",
      });
    }
  }, [empleado, form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      // Aquí iría tu fetch al back (CA006, CA007, CA009)
      console.log("Enviando a Bitácora y API:", values);
      
      // Simulación de éxito
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Información actualizada correctamente"); // CA006
      onSuccess?.(); 
      onClose();
    } catch (error) {
      toast.error("Error técnico al guardar los cambios"); // CA011
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Perfil de Empleado</DialogTitle>
          <p className="text-sm text-muted-foreground">CA003: Modifica la información detallada del personal.</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            {/* Nombre Completo */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Empleado */}
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Personal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Limpieza">Limpieza</SelectItem>
                        <SelectItem value="Chofer">Chofer</SelectItem>
                        <SelectItem value="Cuidador">Cuidador</SelectItem>
                        <SelectItem value="Jardinería">Jardinería</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Teléfono */}
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (10 dígitos)</FormLabel>
                    <FormControl><Input placeholder="971..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Horario Inicio */}
              <FormField
                control={form.control}
                name="horario_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrada</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Horario Fin */}
              <FormField
                control={form.control}
                name="horario_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salida</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas Adicionales */}
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas / Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Indicaciones especiales para el guardia..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}