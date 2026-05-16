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
import { Textarea } from "@/components/ui/textarea";

// Importamos el esquema que creamos en servicio.schema.ts
import { servicioDomicilioSchema, type ServicioDomicilioFormValues } from "../schemas/servicio.schema";

interface ModalServicioProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ServicioDomicilioFormValues) => void;
  isSaving?: boolean;
}

export function ModalServicio({ isOpen, onClose, onSave, isSaving }: ModalServicioProps) {
  const form = useForm<ServicioDomicilioFormValues>({
    resolver: zodResolver(servicioDomicilioSchema),
    defaultValues: {
      id_tipo_servicio: "",
      nombre_empresa: "",
      frecuencia: "UNICA_VEZ",
      fecha_visita: "",
      hora_estimada: "08:00",
      nombre_tecnico: "",
      placas: "",
      notas: "",
      foto: "",
    },
  });

  const onSubmit = (values: ServicioDomicilioFormValues) => {
    // CA005: El componente padre se encargará de guardar y mostrar la confirmación
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[650px] p-4 sm:p-6 max-h-[95vh] overflow-y-auto overflow-x-hidden rounded-2xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-2xl font-extrabold text-blue-900">
            Registrar Acceso de Servicio
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Autoriza el ingreso de proveedores, paquetería o mantenimiento a tu domicilio.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* BLOQUE 1: Datos del Servicio */}
            <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 inline-flex items-center justify-center text-xs">1</span>
                Datos del Servicio
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="id_tipo_servicio" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tipo de Servicio *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {/* Estos values idealmente vendrán de tu BD más adelante */}
                        <SelectItem value="1">Gas</SelectItem>
                        <SelectItem value="2">Agua Purificada</SelectItem>
                        <SelectItem value="3">Paquetería</SelectItem>
                        <SelectItem value="4">Mantenimiento</SelectItem>
                        <SelectItem value="5">Internet / Telefonía</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="nombre_empresa" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Empresa o Proveedor *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Gas Sur, DHL, Telmex" className="bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="frecuencia" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Frecuencia de Acceso (NTH001) *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="bg-white"><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="UNICA_VEZ">Única Vez</SelectItem>
                      <SelectItem value="RECURRENTE">Recurrente</SelectItem>
                      <SelectItem value="PROGRAMADO">Programado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* BLOQUE 2: Programación */}
            <div className="space-y-4 p-4 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-gray-200 text-gray-800 rounded-full w-6 h-6 inline-flex items-center justify-center text-xs">2</span>
                Programación
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="fecha_visita" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Fecha Esperada *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
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
            </div>

            {/* BLOQUE 3: Identificación (Opcional) */}
            <div className="space-y-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-gray-200 text-gray-800 rounded-full w-6 h-6 inline-flex items-center justify-center text-xs">3</span>
                Datos del Repartidor / Técnico <span className="text-xs font-normal text-gray-500 ml-1">(Opcional)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="nombre_tecnico" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Nombre del Técnico</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Solo letras" 
                        className="bg-white"
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

                <FormField control={form.control} name="placas" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Placas del Vehículo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej. ABC-123" 
                        className="bg-white uppercase"
                        {...field} 
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-\s]/g, "");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="notas" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-sm">Notas para la Caseta</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej. Dejar pasar hasta la puerta, vienen a revisar la lavadora..." className="resize-none bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1" disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold order-1 sm:order-2">
                {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Registrar y Autorizar"}
              </Button>
            </div>
            
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}