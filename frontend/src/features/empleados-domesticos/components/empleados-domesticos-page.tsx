"use client";
import { useEmpleadoDomesticos } from "@/features/empleados-domesticos/hooks/useEmpleadoDomestico";
import { EmpleadosTable } from "@/features/empleados-domesticos/components/empleados-table";
import { EmpleadosFilters } from "@/features/empleados-domesticos/components/empleados-filters";
import { EmpleadosPagination } from "@/features/empleados-domesticos/components/empleados-pagination";
import { EmpleadosDeleteDialog } from "@/features/empleados-domesticos/components/empleados-delete-dialog";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";
import { EmpleadosHorarioDialog } from "./horarios-empleado-domestico";

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
  } = useEmpleadoDomesticos();

  return (
    <div className="min-h-screen bg-amber-50/30 text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-8 sm:px-8">
        <EmpleadosFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <section className="mt-6 rounded-2xl border border-border bg-white shadow-sm">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Nombre
            </p>
          </div>

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
