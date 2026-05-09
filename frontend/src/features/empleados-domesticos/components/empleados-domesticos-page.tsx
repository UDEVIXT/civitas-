"use client";

import * as React from "react";

import { useToast } from "@/hooks/use-toast";

import {
  deleteEmpleadoDomestico,
  getEmpleadosDomesticos,
  updateEmpleadoDomestico,
  type EmpleadosMeta,
} from "../data/empleados";
import type { EmpleadoDomestico } from "../types";
import { EmpleadosDeleteDialog } from "./empleados-delete-dialog";
import { EmpleadosFilters } from "./empleados-filters";
import { EmpleadosPagination } from "./empleados-pagination";
import { EmpleadosTable } from "./empleados-table";

const PAGE_SIZE = 7;
const statusOptions = ["Todos", "Activos"] as const;

type StatusFilter = (typeof statusOptions)[number];

export function EmpleadosDomesticosPage({
  initialData,
  initialMeta,
}: {
  initialData: EmpleadoDomestico[];
  initialMeta: EmpleadosMeta;
}) {
  const [items, setItems] = React.useState(initialData);
  const [meta, setMeta] = React.useState<EmpleadosMeta>(initialMeta);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("Todos");
  const [page, setPage] = React.useState(initialMeta.page || 1);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedEmpleado, setSelectedEmpleado] =
    React.useState<EmpleadoDomestico | null>(null);
  const [dialogMode, setDialogMode] = React.useState<
    "deactivate" | "reactivate"
  >("deactivate");
  const [motivo, setMotivo] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
  const totalPages = Math.max(1, meta.totalPages);
  const currentPage = Math.min(page, totalPages);
  const pageEmployees = items;

  const fetchEmployees = React.useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      try {
        const response = await getEmpleadosDomesticos({
          page: targetPage,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          isActive: statusFilter === "Activos" ? true : undefined,
        });
        setItems(response.data);
        setMeta(response.meta);

        if (
          response.meta.totalPages > 0 &&
          targetPage > response.meta.totalPages
        ) {
          setPage(response.meta.totalPages);
        }
      } catch (error) {
        setItems([]);
        setMeta({
          total: 0,
          page: targetPage,
          limit: PAGE_SIZE,
          totalPages: 1,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter],
  );

  const didInitRef = React.useRef(false);

  React.useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }

    void fetchEmployees(page);
  }, [page, search, statusFilter, fetchEmployees]);

  const handleOpenDialog = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setDialogMode(empleado.estado === "Inactivo" ? "reactivate" : "deactivate");
    setMotivo("");
    setDeleteError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedEmpleado(null);
      setDeleteError(null);
      setMotivo("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmpleado) {
      return;
    }

    if (dialogMode === "deactivate" && !motivo.trim()) {
      setDeleteError("El motivo es obligatorio para dar de baja.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      if (dialogMode === "deactivate") {
        await updateEmpleadoDomestico(selectedEmpleado.id, {
          activo: false,
          motivo: motivo.trim(),
        });
      } else {
        await updateEmpleadoDomestico(selectedEmpleado.id, {
          activo: true,
        });
      }
      await fetchEmployees(page);
      toast({
        title:
          dialogMode === "deactivate"
            ? "Empleado dado de baja"
            : "Empleado reincorporado",
        description:
          dialogMode === "deactivate"
            ? `${selectedEmpleado.nombre} ya no tiene acceso activo.`
            : `${selectedEmpleado.nombre} recupero su acceso.`,
      });
      setIsDialogOpen(false);
      setSelectedEmpleado(null);
    } catch (error) {
      setDeleteError(
        dialogMode === "deactivate"
          ? "No pudimos completar la baja. Intentalo de nuevo en unos segundos."
          : "No pudimos reincorporar al empleado. Intentalo de nuevo en unos segundos.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-8 sm:px-8">
        <EmpleadosFilters
          search={search}
          onSearchChange={setSearch}
          statusOptions={statusOptions}
          statusFilter={statusFilter}
          onStatusChange={(value) => setStatusFilter(value as StatusFilter)}
        />

        <section className="mt-6 rounded-2xl border border-border bg-white shadow-sm">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Nombre
            </p>
          </div>
          <EmpleadosTable
            items={pageEmployees}
            isLoading={isLoading}
            onActionClick={handleOpenDialog}
          />
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
            <EmpleadosPagination
              currentPage={currentPage}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </section>
        <EmpleadosDeleteDialog
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
          selectedEmpleado={selectedEmpleado}
          mode={dialogMode}
          motivo={motivo}
          onMotivoChange={setMotivo}
          isDeleting={isDeleting}
          deleteError={deleteError}
          onConfirm={handleConfirmDelete}
        />
      </main>
    </div>
  );
}
