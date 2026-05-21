"use client";

import React, { useState } from "react";
import { Search, UserPlus, Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Componentes
import { ModalVisitante } from "@/features/mis-visitantes/components/modal-visitante";
import { TablaVisitantes } from "@/features/mis-visitantes/components/tabla-visitantes";
import { EmptyStateVisitantes } from "@/features/mis-visitantes/components/empty-state-visitantes";
import type { VisitanteFormValues } from "@/features/mis-visitantes/schemas/visitante.schema";
import type { Visitante } from "@/features/mis-visitantes/types";

// Mock Data (Simulando lo que traería el backend de Joan)
const VISITANTES_MOCK: Visitante[] = [
  { id_visitante: "1", nombre_completo: "Olivia Rhye", motivo_visita: "Visita por cumpleaños", tipo_visitante: "Visita Personal", fecha_visita: "2026-05-20", hora_estimada: "14:00", es_frecuente: false, estatus: "Activo" },
  { id_visitante: "2", nombre_completo: "Phoenix Baker", motivo_visita: "Masajista personal", tipo_visitante: "Servicio", fecha_visita: "2026-05-21", hora_estimada: "10:00", es_frecuente: true, estatus: "Activo" },
];

export default function MisVisitantesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Cambia esto a [] para probar cómo se ve el Empty State
  const [visitantes, setVisitantes] = useState<Visitante[]>(VISITANTES_MOCK); 

  const handleSaveVisitante = async (values: VisitanteFormValues) => {
    setIsSaving(true);
    try {
      console.log("Enviando a BD:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula latencia
      
      // Simula agregar a la lista para que se quite el Empty State temporalmente
      const nuevoVisitante: Visitante = {
        id_visitante: Math.random().toString(),
        ...values,
        tipo_visitante: values.tipo_visitante as any,
        estatus: "Activo"
      };
      setVisitantes([nuevoVisitante, ...visitantes]);
      
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header superior idéntico a tu Figma */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Visitantes</h1>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search" className="pl-9 bg-white" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros (Figma) */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setIsModalOpen(true)} variant="outline" className="bg-white hover:bg-gray-50 text-gray-700">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo
        </Button>
        <Button variant="outline" className="bg-white hover:bg-gray-50 text-gray-700">
          <Star className="mr-2 h-4 w-4 text-amber-400" /> Favoritos
        </Button>
        <Button variant="outline" className="bg-white hover:bg-gray-50 text-gray-700">
          <Filter className="mr-2 h-4 w-4" /> Más filtros
        </Button>
      </div>

      {/* Renderizado Condicional: ¿Hay visitantes? */}
      {visitantes.length === 0 ? (
        <EmptyStateVisitantes />
      ) : (
        <TablaVisitantes visitantes={visitantes} />
      )}

      {/* Modal */}
      {isModalOpen && (
        <ModalVisitante
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVisitante}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}