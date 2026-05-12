"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";
import {
  eliminarEmpleadoDomestico,
  activarEmpleadoDomestico,
} from "@/features/empleados-domesticos/api/empleados";

// Definimos el esquema de validación con Zod
const formSchema = z.object({
  estado: z.enum(["Activo", "Inactivo"], {
    required_error: "Debes seleccionar un estado.",
  }),
  motivo: z
    .string()
    .min(5, {
      message: "El motivo debe tener al menos 5 caracteres.",
    })
    .max(200, {
      message: "El motivo no puede exceder los 200 caracteres.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface ModalEditarEmpleadoProps {
  empleado: EmpleadoDomestico | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalEditarEmpleado({
  empleado,
  isOpen,
  onClose,
  onSuccess,
}: ModalEditarEmpleadoProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Configuramos el formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estado: "Activo",
      motivo: "",
    },
  });

  // Actualizamos los valores del formulario cuando cambia el empleado seleccionado
  React.useEffect(() => {
    if (empleado) {
      form.reset({
        estado: empleado.servicio?.activo ? "Activo" : "Inactivo",
        motivo: "", // Reiniciamos el motivo cada vez que se abre
      });
    }
  }, [empleado, form]);

  async function onSubmit(values: FormValues) {
    if (!empleado) return;

    try {
      setIsSubmitting(true);

      const isReactivating = values.estado === "Activo";

      if (isReactivating) {
        await activarEmpleadoDomestico(empleado.id_visitante, values.motivo);
      } else {
        await eliminarEmpleadoDomestico(empleado.id_visitante, values.motivo);
      }

      onSuccess(); // Refrescar la tabla
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Empleado Doméstico</DialogTitle>
          <DialogDescription>
            Actualiza el estado de acceso para{" "}
            <strong>{empleado?.nombre}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo de Nombre (Solo lectura) */}
            <div className="space-y-2">
              <FormLabel>Empleado</FormLabel>
              <Input
                value={empleado?.nombre || ""}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Campo de Estado */}
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de Acceso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Activo">
                        Activo (Permitir acceso)
                      </SelectItem>
                      <SelectItem value="Inactivo">
                        Inactivo (Bloquear acceso)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Motivo */}
            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del cambio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Cambio de horario, fin de contrato, vacaciones..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
