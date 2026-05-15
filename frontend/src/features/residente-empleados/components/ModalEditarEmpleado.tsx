"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Asegúrate de tener este componente
import { Checkbox } from "@/components/ui/checkbox"; // Asegúrate de tener este componente
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

const DIAS_SEMANA = [
  { id: "Lunes", label: "L" },
  { id: "Martes", label: "M" },
  { id: "Miércoles", label: "M" },
  { id: "Jueves", label: "J" },
  { id: "Viernes", label: "V" },
  { id: "Sábado", label: "S" },
  { id: "Domingo", label: "D" },
];

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().length(10, "El teléfono debe tener 10 dígitos"),
  hora_entrada: z.string().min(1, "La hora de entrada es obligatoria"),
  hora_salida: z.string().min(1, "La hora de salida es obligatoria"),
  dias_autorizados: z.array(z.string()).min(1, "Debes seleccionar al menos un día"),
  cargo: z.string().min(1, "Selecciona un cargo"),
  notas: z.string().optional(),
  foto: z.string().optional(),
}).refine((data) => data.hora_entrada < data.hora_salida, {
  message: "Error: La hora de salida debe ser posterior a la de entrada",
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

export function ModalEditarEmpleado({ empleado, isOpen, onClose, onSave, isSaving }: ModalEditarEmpleadoProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      telefono: "",
      hora_entrada: "08:00",
      hora_salida: "16:00",
      dias_autorizados: [],
      cargo: "",
      notas: "",
      foto: "",
    },
  });

  React.useEffect(() => {
    if (empleado) {
      const telefonoLimpio = (empleado.telefono || "").replace(/\D/g, "");
      form.reset({
        nombre: empleado.nombre || "",
        telefono: telefonoLimpio || "" ,
        hora_entrada: (empleado.servicio as any)?.hora_entrada || "08:00",
        hora_salida: (empleado.servicio as any)?.hora_salida || "16:00",
        dias_autorizados: (empleado.servicio as any)?.dias_autorizados || [],
        cargo: (empleado.servicio as any)?.cargo || "Nana",
        notas: (empleado.servicio as any)?.notas || "",
        foto: empleado.url_imagen || "",
      });
    }
  }, [empleado, form]);

  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-4 sm:p-6 max-h-[95vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-xl font-bold text-center text-gray-800">
            Editar Perfil de Empleado
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Header con Foto */}
            <div className="flex flex-col items-center justify-center gap-3 bg-gray-50 p-4 rounded-xl mb-4 text-center">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-md">
                <AvatarImage src={form.watch("foto") || "/placeholder-user.jpg"} />
                <AvatarFallback className="bg-amber-100 text-amber-700 font-bold text-2xl">
                  {empleado?.nombre?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <p className="text-base sm:text-lg font-extrabold text-gray-950 tracking-tight">
                  {form.watch("nombre") || "Sin nombre"}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-3 py-0.5 rounded-full inline-block mx-auto">
                  {form.watch("cargo")}
                </p>
              </div>
            </div>

            {/* Nombre Completo */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nombre Completo <span className="text-xs font-normal text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Ej. Juan Pérez" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teléfono */}
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Teléfono <span className="text-xs font-normal text-red-500">*</span></FormLabel>
                    <FormControl><Input type="tel" maxLength={10} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cargo */}
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tipo de Empleado <span className="text-xs font-normal text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
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
            </div>

            {/* Días Autorizados (CA003) */}
            <FormField
              control={form.control}
              name="dias_autorizados"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="font-bold">Días Autorizados <span className="text-xs font-normal text-red-500">*</span></FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA.map((dia) => (
                      <FormField
                        key={dia.id}
                        control={form.control}
                        name="dias_autorizados"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(dia.id);
                          return (
                            <FormItem key={dia.id} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, dia.id])
                                      : field.onChange(field.value?.filter((value) => value !== dia.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-medium cursor-pointer">{dia.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horario Autorizado (CA005) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hora_entrada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs">Entrada <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel className="font-bold text-xs">Salida <span className="text-red-500">*</span></FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas Adicionales (CA003) */}
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Notas Adicionales <span className="text-xs font-normal text-gray-400">(Opcional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej. Entra por la puerta de servicio..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Foto URL */}
            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">URL de Foto <span className="text-xs font-normal text-gray-400">(Opcional)</span></FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1" disabled={isSaving}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold order-1 sm:order-2"
              >
                {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}