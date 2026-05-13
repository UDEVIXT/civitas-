"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmpleadoDomestico } from "@/features/residente_empleados/types";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().length(10, "Deben ser exactamente 10 dígitos"),
  hora_entrada: z.string().min(1, "Requerido"),
  hora_salida: z.string().min(1, "Requerido"),
  cargo: z.string().min(1, "Selecciona un cargo"),
  foto: z.string().optional(),
}).refine((data) => data.hora_entrada < data.hora_salida, {
  message: "La salida debe ser después de la entrada",
  path: ["hora_salida"],
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
      telefono: "",
      hora_entrada: "08:00",
      hora_salida: "16:00",
      cargo: "",
      foto: "",
    },
  });

  React.useEffect(() => {
    if (empleado) {
      form.reset({
        nombre: empleado.nombre || "",
        telefono: empleado.telefono || "",
        hora_entrada: (empleado as any).hora_entrada || "08:00",
        hora_salida: (empleado as any).hora_salida || "16:00",
        cargo: (empleado as any).cargo || "Nana",
        foto: (empleado as any).fotoUrl || "",
      });
    }
  }, [empleado, form]);

  // Filtro para aceptar solo números en el teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(value);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Enviando datos validados:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center border-b pb-4 mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Editar Información del Empleado
          </DialogTitle>
          
          <div className="flex flex-col items-center mt-4 space-y-2">
            <Avatar className="h-20 w-20 border-2 border-gray-100 shadow-sm">
              <AvatarImage src={form.watch("foto") || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                {empleado?.nombre?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500 font-medium">
              {form.watch("nombre") || "Nuevo Empleado"} - {form.watch("cargo") || "Sin Cargo"}
            </p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Nombre Completo :</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Número telefónico:</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel"
                      placeholder="Solo números"
                      onChange={(e) => handlePhoneChange(e, field.onChange)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hora_entrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Hora Entrada</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hora_salida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Hora Salida</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Cargo:</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecciona un cargo" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Nana">Nana</SelectItem>
                      <SelectItem value="Limpieza">Limpieza</SelectItem>
                      <SelectItem value="Chofer">Chofer</SelectItem>
                      <SelectItem value="Cuidador">Cuidador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Foto (URL):</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-[#F1B111] hover:bg-[#D49B0D] text-white font-bold"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}