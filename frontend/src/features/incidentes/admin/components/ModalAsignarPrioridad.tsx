"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Incidente, PrioridadIncidencia } from "@/features/incidentes/residentes/api/incidencias";

interface ModalAsignarPrioridadProps {
  incidente: Incidente | null;
  selectedIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrioridadAsignada: (prioridad: PrioridadIncidencia) => void;
}

const prioridadOptions: { value: PrioridadIncidencia; label: string; color: string }[] = [
  { value: "BAJA", label: "Baja", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  { value: "MEDIA", label: "Media", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
  { value: "ALTA", label: "Alta", color: "bg-orange-100 text-orange-800 hover:bg-orange-200" },
  { value: "CRITICA", label: "Crítica", color: "bg-red-100 text-red-800 hover:bg-red-200" },
];

export function ModalAsignarPrioridad({
  incidente,
  selectedIds,
  open,
  onOpenChange,
  onPrioridadAsignada,
}: ModalAsignarPrioridadProps) {
  const [selectedPrioridad, setSelectedPrioridad] = useState<PrioridadIncidencia | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuardar = async () => {
    if (!selectedPrioridad) return;

    setIsSubmitting(true);
    try {
      // Aquí se llamaría a la API para actualizar la prioridad
      // Por ahora, simulamos la actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      onPrioridadAsignada(selectedPrioridad);
      setSelectedPrioridad(null);
    } catch (error) {
      console.error("Error al asignar prioridad:", error);
      // Aquí se mostraría un mensaje de error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPrioridad(null);
    onOpenChange(false);
  };

  const esLote = selectedIds.size > 0 && !incidente;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {esLote
              ? `Asignar Prioridad (${selectedIds.size} incidentes)`
              : "Asignar Prioridad"}
          </DialogTitle>
          <DialogDescription>
            {esLote
              ? "Selecciona el nivel de prioridad para los incidentes seleccionados."
              : "Selecciona el nivel de prioridad para este incidente."}
          </DialogDescription>
        </DialogHeader>

        {incidente && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div>
              <span className="font-semibold">{incidente.titulo}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {incidente.descripcion}
            </div>
          </div>
        )}

        <div className="space-y-3 mt-4">
          <label className="text-sm font-medium">Nivel de Prioridad</label>
          <div className="grid grid-cols-2 gap-3">
            {prioridadOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedPrioridad(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPrioridad === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${option.color}`}>
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={!selectedPrioridad || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
