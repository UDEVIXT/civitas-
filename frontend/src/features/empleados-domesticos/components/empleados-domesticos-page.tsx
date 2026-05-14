"use client";
import { useEmpleadoDomesticos } from "@/features/empleados-domesticos/hooks/useEmpleadoDomestico";
import { EmpleadosTable } from "@/features/empleados-domesticos/components/empleados-table";
import { EmpleadosFilters } from "@/features/empleados-domesticos/components/empleados-filters";
import { EmpleadosPagination } from "@/features/empleados-domesticos/components/empleados-pagination";
import { EmpleadosDeleteDialog } from "@/features/empleados-domesticos/components/empleados-delete-dialog";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";
import { EmpleadosHorarioDialog } from "./horarios-empleado-domestico";

import useResidente from "@/features/empleados-domesticos/hooks/useResidente";
import useVivienda from "@/features/empleados-domesticos/hooks/useVivienda";

export function EmpleadosDomesticosPage() {
  const {
    empleados,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    modalEdit,
    modalHorario,
    setResidenciaFilter,
    setViviendaFilter,
    residenciaFilter,
    viviendaFilter,
  } = useEmpleadoDomesticos();

  const { data: resResponse } = useResidente();
  const { data: vivResponse } = useVivienda();

  const residentes = resResponse?.data || [];
  const viviendas = vivResponse?.data || [];

  return (
    <div className="min-h-screen bg-amber-50/30 text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-8 sm:px-8">
        <EmpleadosFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          residentes={residentes}
          residenciaId={residenciaFilter}
          onResidenciaChange={setResidenciaFilter}
          viviendas={viviendas}
          viviendaId={viviendaFilter}
          onViviendaChange={setViviendaFilter}
        />

        <section className="mt-6 rounded-2xl border border-border bg-white shadow-sm">
          <EmpleadosTable
            items={empleados}
            isLoading={loading}
            onEdit={modalEdit.handleActionClick}
            onVerHorario={modalHorario.handleVerHorario}
          />

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
            <EmpleadosPagination
              currentPage={page}
              totalPages={totalPages}
              isLoading={loading}
              onPageChange={setPage}
            />
          </div>
        </section>

        <EmpleadosHorarioDialog
          open={modalHorario.isOpen}
          onOpenChange={modalHorario.setIsHorarioModalOpen}
          nombre={modalHorario.nombreEmpleado}
          horarios={modalHorario.horarios}
        />

        <EmpleadosDeleteDialog
          open={modalEdit.isOpen}
          onOpenChange={modalEdit.setIsEditModalOpen}
          selectedEmpleado={modalEdit.selectedEmpleado}
          mode={
            modalEdit.selectedEmpleado?.servicio.activo === true
              ? "deactivate"
              : "reactivate"
          }
          motivo={modalEdit.motivo}
          onMotivoChange={modalEdit.setMotivo}
          isDeleting={modalEdit.isDeleting}
          deleteError={modalEdit.deleteError}
          onConfirm={modalEdit.confirmAction}
        />
      </main>
    </div>
  );
}
