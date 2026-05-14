"use client";

//Vista para mostrar los empleados domésticos del residente, con un modal para editar permisos.
import * as React from "react";
import { TablaMisEmpleados } from "@/features/residente-empleados/components/TablaMisEmpleados";
import { ModalEditarEmpleado } from "@/features/residente-empleados/components/ModalEditarEmpleado";
import { EmpleadosHorarioDialog } from "@/features/empleados-domesticos/components/horarios-empleado-domestico";
import { useEmpleadoDomesticos } from "@/features/empleados-domesticos/hooks/useEmpleadoDomestico";

export default function MisEmpleadosPage() {
  const { empleados, loading, modalEdit, modalHorario } =
    useEmpleadoDomesticos();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Mis Empleados Domésticos
          </h2>
          <p className="text-muted-foreground">
            Gestiona y actualiza los permisos de acceso de tu personal de apoyo.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading && empleados.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600/30 border-t-amber-600" />
              <p className="text-sm text-muted-foreground">
                Cargando tu personal...
              </p>
            </div>
          </div>
        ) : (
          <TablaMisEmpleados
            items={empleados}
            isLoading={loading}
            onEdit={modalEdit.handleActionClick}
            onVerHorario={modalHorario.handleVerHorario}
          />
        )}
      </div>

      <ModalEditarEmpleado
        empleado={modalEdit.selectedEmpleado}
        isOpen={modalEdit.isOpen}
        onClose={() => modalEdit.setIsEditModalOpen(false)}
      />

      <EmpleadosHorarioDialog
        nombre={modalHorario.nombreEmpleado}
        horarios={modalHorario.horarios}
        open={modalHorario.isOpen}
        onOpenChange={modalHorario.setIsHorarioModalOpen}
      />
    </div>
  );
}
