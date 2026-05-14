/** Modal para editar información de un empleado del rol residente **/
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

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

  onSave: (values: any) => void;
  isSaving?: boolean;
}

export function ModalEditarEmpleado({ 
  empleado, 
  isOpen, 
  onClose, 
  onSave, 
  isSaving 
}: ModalEditarEmpleadoProps) {

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

 // Resetear el formulario cuando cambia el empleado seleccionado
  React.useEffect(() => {
    if (empleado) {
      form.reset({
        nombre: empleado.nombre || "",
        telefono: empleado.telefono || "",
        hora_entrada: (empleado.servicio as any)?.hora_entrada || "08:00",
        hora_salida: (empleado.servicio as any)?.hora_salida || "16:00",
        cargo: (empleado.servicio as any)?.cargo || "Nana",
        foto: empleado.url_imagen || "",
      });
    }
  }, [empleado, form]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(value);
  };

  // Esta es la función que se dispara al dar clic en el botón amarillo
  const onSubmit = (values: FormValues) => {
    // Le pasamos los datos al Hook para que él haga la magia
    onSave(values);
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
              {form.watch("nombre") || "Cargando..."} - {form.watch("cargo")}
            </p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* ... (Tus FormFields: nombre, telefono, horas, cargo, foto) ... */}

            <div className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-[#F1B111] hover:bg-[#D49B0D] text-white font-bold"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}