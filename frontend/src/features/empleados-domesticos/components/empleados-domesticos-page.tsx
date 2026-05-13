"use client";
import { useEmpleadoDomesticos } from "@/features/empleados-domesticos/hooks/useEmpleadoDomestico";
import { EmpleadosTable } from "@/features/empleados-domesticos/components/empleados-table";
import { EmpleadosFilters } from "@/features/empleados-domesticos/components/empleados-filters";
import { EmpleadosPagination } from "@/features/empleados-domesticos/components/empleados-pagination";
import { EmpleadosDeleteDialog } from "@/features/empleados-domesticos/components/empleados-delete-dialog";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

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
    modal,
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
            onActionClick={modal.handleActionClick}
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

        <EmpleadosDeleteDialog
          open={modal.isOpen}
          onOpenChange={modal.setIsOpen}
          selectedEmpleado={modal.selectedEmpleado}
          mode={
            modal.selectedEmpleado?.servicio.activo === true
              ? "deactivate"
              : "reactivate"
          }
          motivo={modal.motivo}
          onMotivoChange={modal.setMotivo}
          isDeleting={modal.isDeleting}
          deleteError={modal.deleteError}
          onConfirm={modal.confirmAction}
        />
      </main>
    </div>
  );
}
