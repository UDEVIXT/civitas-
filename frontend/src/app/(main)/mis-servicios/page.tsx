"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ModalServicio } from "@/features/servicios-domicilio/components/modal-servicio";
import { TablaServicios } from "@/features/servicios-domicilio/components/tabla-servicios";
import type { ServicioDomicilioFormValues } from "@/features/servicios-domicilio/schemas/servicio.schema";
import { useResidenteServicios } from "@/features/servicios-domicilio/hooks/useResidenteServicios";

export default function MisServiciosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { servicios, isLoading, isError, refetch } = useResidenteServicios();

  const handleSaveServicio = async (values: ServicioDomicilioFormValues) => {
    setIsSaving(true);

    try {
      console.log("Datos listos para enviar al backend:", values);

      // Aquí después conectamos el POST.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsModalOpen(false);

      // Recarga el GET después de guardar.
      await refetch();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-gray-500">
          Cargando servicios...
        </div>
      )}

      {!isLoading && isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          No se pudieron cargar los servicios a domicilio.
        </div>
      )}

      {!isLoading && !isError && <TablaServicios servicios={servicios} />}

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