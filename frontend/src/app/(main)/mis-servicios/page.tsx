"use client";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ModalServicio } from "@/features/servicios-domicilio/components/modal-servicio";
import { TablaServicios } from "@/features/servicios-domicilio/components/tabla-servicios";
import type { ServicioDomicilioFormValues } from "@/features/servicios-domicilio/schemas/servicio.schema";
import { useResidenteServicios } from "@/features/servicios-domicilio/hooks/useResidenteServicios";

export default function MisServiciosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { servicios, isLoading, isError, refetch } = useResidenteServicios();

  const handleSaveServicio = async (values: ServicioDomicilioFormValues) => {
    setIsSaving(true);
    try {
      console.log("Datos listos para enviar al backend:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsModalOpen(false);
      await refetch();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Lógica de filtrado flexible
  const filteredServicios = servicios?.filter((servicio: any) => {
    if (!searchTerm) return true;

    // Convertimos el objeto servicio a una cadena larga para buscar en todos sus valores
    const valoresServicio = Object.values(servicio)
      .filter(val => typeof val === 'string')
      .join(' ')
      .toLowerCase();

    return valoresServicio.includes(searchTerm.toLowerCase());
  }) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Servicios a Domicilio</h1>
        <p className="text-gray-500 mt-2">
          Gestiona los accesos de proveedores, paquetería y mantenimiento.
        </p>
      </div>

      {/* Barra de herramientas: Nuevo y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium px-4 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo
        </Button>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-10 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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

      {/* Pasamos los servicios filtrados a la tabla */}
      {!isLoading && !isError && <TablaServicios servicios={filteredServicios} />}

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