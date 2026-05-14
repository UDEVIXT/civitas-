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

  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* RESPONSIVE: Ancho adaptable y scroll interno */}
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="flex flex-col items-center border-b pb-4 mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Editar Información
          </DialogTitle>
          
          <div className="flex flex-col items-center mt-4 space-y-2">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-gray-100 shadow-sm">
              <AvatarImage src={form.watch("foto") || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                {empleado?.nombre?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500 font-medium text-center">
              {form.watch("nombre") || "Cargando..."} <br className="sm:hidden" /> 
              <span className="hidden sm:inline">-</span> {form.watch("cargo")}
            </p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Campo: Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Nombre Completo:</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Teléfono */}
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Teléfono:</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel"
                      placeholder="10 dígitos"
                      onChange={(e) => handlePhoneChange(e, field.onChange)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RESPONSIVE GRID: 1 columna en móvil, 2 en PC para las horas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hora_entrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Entrada</FormLabel>
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
                    <FormLabel className="text-gray-700 font-semibold">Salida</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo: Cargo */}
            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Cargo:</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
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

            {/* Campo: Foto */}
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

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="order-2 sm:order-1 flex-1" disabled={isSaving}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="order-1 sm:order-2 flex-1 bg-[#F1B111] hover:bg-[#D49B0D] text-white font-bold"
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