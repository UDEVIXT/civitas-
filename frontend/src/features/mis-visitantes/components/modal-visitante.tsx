/**
 * Aquí aplicamos el formulario con las protecciones de Zod (CA002) y la restricción de teclado para el nombre.
 */

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { visitanteSchema, type VisitanteFormValues } from "../schemas/visitante.schema";

interface ModalVisitanteProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: VisitanteFormValues) => void;
  isSaving?: boolean;
}

export function ModalVisitante({ isOpen, onClose, onSave, isSaving }: ModalVisitanteProps) {
  const form = useForm<VisitanteFormValues>({
    resolver: zodResolver(visitanteSchema),
    defaultValues: {
      nombre_completo: "",
      tipo_visitante: "",
      motivo_visita: "",
      fecha_visita: "",
      hora_estimada: "12:00",
      es_frecuente: false, // React Hook Form maneja el default aquí
    },
  });

  const onSubmit = (values: VisitanteFormValues) => {
    onSave(values);
  };

  const hoyStr = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Registrar Visitante
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Ingresa los datos de tu visita para agilizar su acceso en caseta.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {/* Añadimos void para callar a TS si se queja de promesas no retornadas */}
          <form onSubmit={form.handleSubmit((data) => void onSubmit(data))} className="space-y-4">
            
            <FormField control={form.control} name="nombre_completo" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Nombre Completo *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej. Carlos Pérez" 
                    {...field} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      field.onChange(val);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="tipo_visitante" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Visita Personal">Visita Personal</SelectItem>
                      <SelectItem value="Proveedor">Proveedor</SelectItem>
                      <SelectItem value="Familiar">Familiar</SelectItem>
                      <SelectItem value="Servicio">Servicio</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="motivo_visita" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Motivo *</FormLabel>
                  <FormControl><Input placeholder="Ej. Cumpleaños" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="fecha_visita" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Fecha *</FormLabel>
                  <FormControl><Input type="date" min={hoyStr} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="hora_estimada" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Hora Estimada *</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="es_frecuente" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-gray-50">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-bold cursor-pointer">
                    Guardar como visitante frecuente
                  </FormLabel>
                  <p className="text-xs text-gray-500">
                    Facilita futuros registros agregando a esta persona a tus favoritos (NTH001).
                  </p>
                </div>
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
                {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Guardar Visitante"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}