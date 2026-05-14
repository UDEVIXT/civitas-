"use client";

import * as React from "react";
// Importamos hook personalizado para gestionar empleados del residente
import { useResidenteEmpleados } from "../hooks/useResidenteEmpleados"; 

// Componentes UI
import { TablaMisEmpleados } from "./TablaMisEmpleados";
import { ModalEditarEmpleado } from "./ModalEditarEmpleado";
import { EmpleadosHorarioDialog } from "@/features/empleados-domesticos/components/horarios-empleado-domestico";

export default function MisEmpleadosPage() {
  // Aquí usamos useResidenteEmpleados.ts . El "123" es un ejemplo, 
  // luego lo cambiaremos por el ID real del usuario logueado.
  const { 
    empleados, 
    isLoading, 
    search, 
    setSearch, 
    modalEdit, 
    modalHorario 
  } = useResidenteEmpleados("06d83e87-92d9-42fd-ad18-da5abd12a477");

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mis Empleados Domésticos
          </h2>
          <p className="text-muted-foreground">
            Gestiona y actualiza los permisos de acceso de tu personal de apoyo.
          </p>
        </div>
      </div>

      {/* Buscador opcional (puedes usar el de shadcn si gustas) */}
      <div className="flex items-center py-4">
        <input
          placeholder="Buscar empleado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm p-2 border rounded-md"
        />
      </div>

      <div className="space-y-4">
        <TablaMisEmpleados
          items={empleados}
          isLoading={isLoading}
          onEdit={modalEdit.handleEditClick}
          onVerHorario={modalHorario.handleVerHorario}
        />
      </div>

      <ModalEditarEmpleado
      empleado={modalEdit.selectedEmpleado}
      isOpen={modalEdit.isOpen}
      onClose={() => modalEdit.setIsOpen(false)}
      onSave={modalEdit.save}       // <-- Conexión con la mutación del Hook
      isSaving={modalEdit.isSaving} // <-- Muestra el spinner si está guardando
    />

      {/* Modal de Horarios (el de Joan) */}
      <EmpleadosHorarioDialog
        nombre={modalEdit.selectedEmpleado?.nombre || ""}
        horarios={modalEdit.selectedEmpleado?.servicio?.horarios || []}
        open={modalHorario.isOpen}
        onOpenChange={modalHorario.setIsOpen}
      />
    </div>
  );
}