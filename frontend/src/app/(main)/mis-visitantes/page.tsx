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

// Importamos la API que acabamos de crear
import { crearVisitante } from "@/features/mis-visitantes/api/visitante.api";

export default function MisVisitantesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Empezamos sin visitantes para ver el Empty State de Figma
  const [visitantes, setVisitantes] = useState<Visitante[]>([]); 

  const handleSaveVisitante = async (values: VisitanteFormValues) => {
    setIsSaving(true);
    try {
      // 1. Mandamos el FormData al back
      const responseBackend = await crearVisitante(values);
      console.log("Respuesta del backend con foto:", responseBackend);
      
      // 2. Armamos el visitante para la tabla, mapeando la URL de la imagen
      const nuevoVisitante: Visitante = {
        id_visitante: responseBackend?.id_visitante || Math.random().toString(), 
        nombre_completo: values.nombre_completo,
        motivo_visita: values.motivo_visita,
        tipo_visitante: values.tipo_visitante as any,
        fecha_visita: values.fecha_visita,
        hora_estimada: values.hora_estimada,
        es_frecuente: values.es_frecuente,
        telefono: values.telefono,
        estatus: "Activo",
        url_foto: responseBackend?.url_imagen 
      };
      
      setVisitantes([nuevoVisitante, ...visitantes]);
      setIsModalOpen(false);
      
    } catch (error) {
      console.error("Error al registrar en la API:", error);
      alert("Hubo un problema al guardar el visitante en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Visitantes</h1>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search" className="pl-9 bg-white" />
          </div>
        </div>
      </div>

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

      {/* Aquí entra la magia: Si es 0 muestra tu Empty State, si no, pinta la tabla */}
      {visitantes.length === 0 ? (
        <EmptyStateVisitantes />
      ) : (
        <TablaVisitantes visitantes={visitantes} />
      )}

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