"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, HelpCircle } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
      telefono: "",        // Nuevo campo
      tipo_visitante: "",
      motivo_visita: "",
      fecha_visita: "",
      hora_estimada: "12:00",
      foto: "",            // Nuevo campo
      es_frecuente: false,
    },
  });

  const onSubmit = (values: VisitanteFormValues) => {
    console.log("Valores validados por Zod listos para enviar:", values);
    onSave(values);
  };

  const hoyStr = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-6 rounded-2xl bg-white border-none shadow-lg">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pb-2">
          {/* Icono decorativo del Figma */}
          <div className="bg-amber-50 text-amber-500 p-3 rounded-full">
            <HelpCircle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Registrar visitante
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Ingresa los datos de la persona que vendrá de visita
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Campos apilados en una sola columna */}
            <FormField control={form.control} name="nombre_completo" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">Nombre:</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ej. Antonina" 
                    className="bg-white border-gray-200 focus-visible:ring-amber-500"
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

            <FormField control={form.control} name="telefono" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">Número telefónico:</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    maxLength={10}
                    placeholder="ej. 971 100 2998" 
                    className="bg-white border-gray-200 focus-visible:ring-amber-500"
                    {...field} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      field.onChange(val);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="fecha_visita" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">Fecha:</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    min={hoyStr} 
                    className="bg-white border-gray-200 focus-visible:ring-amber-500" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tipo_visitante" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">Tipo de vehículo:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-gray-200 focus-visible:ring-amber-500">
                      <SelectValue placeholder="Camioneta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="Camioneta">Camioneta</SelectItem>
                    <SelectItem value="Motocicleta">Motocicleta</SelectItem>
                    <SelectItem value="Peatón">Peatón</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="foto" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">Foto:</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ingresa un link con la foto de tu visitante..." 
                    className="bg-white border-gray-200 focus-visible:ring-amber-500" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Switch de Visitante Frecuente */}
            <FormField control={form.control} name="es_frecuente" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between mt-2">
                <div className="space-y-0.5">
                  <FormLabel className="font-semibold text-gray-800 cursor-pointer">
                    Visitante frecuente
                  </FormLabel>
                  <p className="text-sm text-gray-500">
                    Agregar a la lista de personas que visitan tu hogar frecuentemente.
                  </p>
                </div>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    className="data-[state=checked]:bg-indigo-500" 
                  />
                </FormControl>
              </FormItem>
            )} />

            {/* Campos ocultos pero necesarios para tu backend/CA */}
            <div className="hidden">
              <FormField control={form.control} name="motivo_visita" render={({ field }) => (
                <FormItem><FormControl><Input {...field} value="Visita registrada" /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="hora_estimada" render={({ field }) => (
                <FormItem><FormControl><Input type="time" {...field} value="12:00" /></FormControl></FormItem>
              )} />
            </div>

            {/* Botones Flexibles 50/50 */}
            <div className="flex gap-4 w-full pt-4 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isSaving} 
                className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Guardar"}
              </Button>
            </div>
            
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}