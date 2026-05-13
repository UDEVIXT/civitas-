"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

const formSchema = z.object({
  estado: z.enum(["Activo", "Inactivo"]),
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
  onSuccess?: () => void;
}

export function ModalEditarEmpleado({
  empleado,
  isOpen,
  onClose,
  onSuccess,
}: ModalEditarEmpleadoProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!empleado) return;
      const isReactivating = values.estado === "Activo";

      const res = isReactivating
        ? await activarEmpleadoDomestico(empleado.id_visitante, values.motivo)
        : await eliminarEmpleadoDomestico(empleado.id_visitante, values.motivo);

      if (res && !res.success) {
        throw new Error(res.message || "Error al actualizar");
      }
      return res;
    },
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["empleados-domesticos"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Ocurrió un error inesperado");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      estado: "Activo",
      motivo: "",
    },
  });

  React.useEffect(() => {
    if (empleado) {
      setErrorMessage(null);
      form.reset({
        estado: empleado.servicio?.activo ? "Activo" : "Inactivo",
        motivo: "",
      });
    }
  }, [empleado, form]);

  async function onSubmit(values: FormValues) {
    updateStatus(values);
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
            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <FormLabel>Empleado</FormLabel>
              <Input
                value={empleado?.nombre || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de Acceso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
