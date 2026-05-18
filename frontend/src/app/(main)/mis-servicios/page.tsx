"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ModalServicio } from "@/features/servicios-domicilio/components/modal-servicio";
import { TablaServicios, type ServicioMock } from "@/features/servicios-domicilio/components/tabla-servicios";
import type { ServicioDomicilioFormValues } from "@/features/servicios-domicilio/schemas/servicio.schema";

// Datos de prueba limpios (sin íconos)
const SERVICIOS_MOCK: ServicioMock[] = [
  { id: "1", empresa: "Gas Sur", tipo: "Gas", frecuencia: "RECURRENTE", fecha: "2026-05-18", estatus: "Activo" },
  { id: "2", empresa: "Amazon", tipo: "Paquetería", frecuencia: "UNICA_VEZ", fecha: "2026-05-16", estatus: "Pendiente" },
  { id: "3", empresa: "Telmex", tipo: "Internet", frecuencia: "PROGRAMADO", fecha: "2026-05-20", estatus: "Pendiente" },
];

export default function MisServiciosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveServicio = async (values: ServicioDomicilioFormValues) => {
    setIsSaving(true);
    try {
      console.log("Datos listos para enviar al backend:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header limpio, sin bordes ni sombras, idéntico a "Mis Empleados" */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Servicios a Domicilio
          </h1>
          <p className="text-gray-500 mt-2">
            Gestiona los accesos de proveedores, paquetería y mantenimiento.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Servicio
        </Button>
      </div>

      <TablaServicios servicios={SERVICIOS_MOCK} />

      {isModalOpen && (
        <ModalServicio
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveServicio}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}