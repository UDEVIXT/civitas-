"use client";

import * as React from "react";
import { useResidenteEmpleados } from "../hooks/useResidenteEmpleados"; 
// 1. Importa el hook de autenticación que maneja el equipo
import { useAuth } from "@/features/auth/hooks/useAuth"; 

import { TablaMisEmpleados } from "./TablaMisEmpleados";
import { ModalEditarEmpleado } from "./ModalEditarEmpleado";
import { MiEmpleadoHorarioDialog } from "./MiEmpleadoHorarioDialog";

export default function MisEmpleadosPage() {
  // 2. Obtén el usuario logueado dinámicamente
  const { user } = useAuth(); 

  // 3. Le pasas el ID dinámico
  // const idResidenteActivo = user?.id_residente ? String(user.id_residente) : "";
  const idResidenteActivo = "0c281d05-a73a-4a0c-ab25-eb1ca390f08f";

  const { 
    empleados, 
    isLoading, 
    search, 
    setSearch, 
    modalEdit, 
    modalHorario 
  } = useResidenteEmpleados(idResidenteActivo);

  console.log("Lo que llega al hook:", empleados);

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

      {/* Buscador */}
      <div className="flex items-center py-4">
        <input
          placeholder="Buscar empleado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm p-2 border rounded-md bg-white text-sm"
        />
      </div>

      <div className="space-y-4">
        <TablaMisEmpleados
          items={empleados}
          isLoading={isLoading}
          onEdit={modalEdit.handleEditClick}
          onVerHorario={modalHorario.handleVerHorario}
          onBaja={modalBaja.handleBajaClick} 
        />
      </div>

      {/* Modal de Edición */}
      <ModalEditarEmpleado
        empleado={modalEdit.selectedEmpleado}
        isOpen={modalEdit.isOpen}
        onClose={() => modalEdit.setIsOpen(false)}
        onSave={modalEdit.save}       
        isSaving={modalEdit.isSaving} 
      />

      {/* Modal de Baja / Suspensión Temporal */}
      <ModalBajaEmpleado
        open={modalBaja.isOpen}
        onOpenChange={modalBaja.setIsOpen}
        selectedEmpleado={modalBaja.selectedEmpleado}
        mode={modalBaja.mode} 
        motivo={modalBaja.motivo}
        onMotivoChange={modalBaja.setMotivo}
        isDeleting={modalBaja.isDeleting}
        deleteError={modalBaja.deleteError}
        onConfirm={modalBaja.confirm} 
      />

      {/* Modal de Horarios (el de Joan) */}
      <MiEmpleadoHorarioDialog
        nombre={modalEdit.selectedEmpleado?.nombre || ""}
        horarios={modalEdit.selectedEmpleado?.servicio?.horarios || []}
        open={modalHorario.isOpen}
        onOpenChange={modalHorario.setIsOpen}
      />
    </div>
  );
}