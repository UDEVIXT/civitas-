"use client";

import * as React from "react";
import {
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  Users,
  UserCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useResidenteEmpleados } from "../hooks/useResidenteEmpleados";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  crearEmpleadoDomestico,
  type CrearEmpleadoDomesticoRequest,
} from "@/features/residente-empleados/api/residente-api";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { TablaMisEmpleados } from "./TablaMisEmpleados";
import { ModalEditarEmpleado } from "./ModalEditarEmpleado";
import { MiEmpleadoHorarioDialog } from "./MiEmpleadoHorarioDialog";
import { ModalBajaEmpleado } from "./ModalBajaEmpleado";
import { ModalAgregarEmpleado } from "./ModalAgregarEmpleado";

export default function MisEmpleadosPage() {
  const { user } = useAuth();
  const idUsuarioActivo = user?.id ? String(user.id) : "";

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active">(
    "all",
  );
  const [page, setPage] = React.useState(1);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const guardarEmpleado = React.useCallback(
    async (
      values: Parameters<NonNullable<React.ComponentProps<typeof ModalAgregarEmpleado>["onSave"]>>[0],
      confirmarReusoRFC = false,
    ) => {
      const mapDia = (d: string): CrearEmpleadoDomesticoRequest["horarios"][number]["dia_semana"] => {
        const mapa: Record<string, CrearEmpleadoDomesticoRequest["horarios"][number]["dia_semana"]> = {
          Lunes: "LUNES",
          Martes: "MARTES",
          Miércoles: "MIERCOLES",
          Jueves: "JUEVES",
          Viernes: "VIERNES",
          Sábado: "SABADO",
          Domingo: "DOMINGO",
        };
        return mapa[d] ?? d.toUpperCase();
      };

      const horariosActivos = (values.horarios || [])
        .filter((h) => h.activo)
        .map((h) => ({
          dia_semana: mapDia(h.dia),
          hora_inicio: h.hora_entrada,
          hora_fin: h.hora_salida,
        }));

      // Validate id_tipo_servicio before sending to backend to avoid 400 validation errors
      if (!values.id_tipo_servicio || values.id_tipo_servicio.trim() === "") {
        throw new Error("Selecciona un tipo de servicio válido antes de guardar.");
      }

      const payload: CrearEmpleadoDomesticoRequest = {
        nombre_completo: values.nombre,
        rfc: values.rfc.trim().toUpperCase(),
        id_tipo_servicio: values.id_tipo_servicio,
        confirmar_reuso_rfc: confirmarReusoRFC,
        cargo: values.cargo?.trim() || undefined,
        telefono: values.telefono?.trim() || undefined,
        url_imagen: values.foto || undefined,
        horarios: horariosActivos.map((h) => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
        })),
      };

      return crearEmpleadoDomestico(payload);
    },
    [],
  );

  const {
    empleados,
    isLoading,
    search,
    setSearch,
    modalEdit,
    modalHorario,
    modalBaja,
  } = useResidenteEmpleados(idUsuarioActivo);

  const filteredEmpleados = React.useMemo(() => {
    return statusFilter === "active"
      ? empleados.filter((empleado) => empleado.servicio?.activo)
      : empleados;
  }, [empleados, statusFilter]);

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredEmpleados.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleEmpleados = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmpleados.slice(start, start + pageSize);
  }, [filteredEmpleados, currentPage]);

  return (
    <div className="min-h-screen bg-[#f6efdf] px-4 py-4 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-330 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]">

        <main className="space-y-5 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Empleados Domésticos
              </h1>
              <p className="max-w-2xl text-sm text-zinc-500 sm:text-[15px]">
                Gestiona y actualiza los permisos de acceso de tu personal de apoyo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Button
                variant="outline"
                className="h-10 rounded-lg border-zinc-200 bg-white px-4 text-sm shadow-sm hover:bg-zinc-50"
              >
                <Upload className="mr-2 size-4" />
                Import
              </Button>
              <Button
                className="h-10 rounded-lg bg-[#1d4ed8] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1e40af]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-2 size-4" />
                Agregar Nuevo Empleado
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "h-10 rounded-lg border-zinc-200 bg-white px-4 text-sm shadow-sm hover:bg-zinc-50",
                  statusFilter === "all" && "border-zinc-900 bg-zinc-50",
                )}
              >
                Todos
                <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  ×
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("active")}
                className={cn(
                  "h-10 rounded-lg border-zinc-200 bg-white px-4 text-sm shadow-sm hover:bg-zinc-50",
                  statusFilter === "active" &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700",
                )}
              >
                Activos
                <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  ×
                </span>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50">
                    <SlidersHorizontal className="mr-2 size-4" />
                    Más filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-80 rounded-2xl border-zinc-200 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <p className="font-medium text-zinc-900">Filtros rápidos</p>
                      <Filter className="size-4 text-zinc-500" />
                    </div>

                    <div className="space-y-2 text-sm text-zinc-600">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50"
                        onClick={() => setStatusFilter("all")}
                      >
                        <span className="flex items-center gap-2">
                          <Users className="size-4" />
                          Todos
                        </span>
                        <span>Mostrar todo</span>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 hover:bg-zinc-50"
                        onClick={() => setStatusFilter("active")}
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="size-4" />
                          Activos
                        </span>
                        <span>Solo activos</span>
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-lg border-zinc-200 bg-white pl-10 shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-400"
              />
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <TablaMisEmpleados
              items={visibleEmpleados}
              isLoading={isLoading}
              onEdit={modalEdit.handleEditClick}
              onVerHorario={modalHorario.handleVerHorario}
              onBaja={modalBaja.handleBajaClick}
            />

            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row">
              <Button
                variant="outline"
                className="h-9 rounded-md border-zinc-200 bg-white px-3 text-sm shadow-sm hover:bg-zinc-50"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <p className="text-sm text-zinc-600">
                Page {currentPage} of {totalPages}
              </p>
              <Button
                variant="outline"
                className="h-9 rounded-md border-zinc-200 bg-white px-3 text-sm shadow-sm hover:bg-zinc-50"
                disabled={currentPage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </section>
        </main>
      </div>

      <ModalEditarEmpleado
        empleado={modalEdit.selectedEmpleado}
        isOpen={modalEdit.isOpen}
        onClose={() => modalEdit.setIsOpen(false)}
        onSave={modalEdit.save}
        isSaving={modalEdit.isSaving}
      />

      <ModalAgregarEmpleado
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={async (values) => {
          try {
            await guardarEmpleado(values, false);
            queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
            setIsAddModalOpen(false);
            toast({
              title: "Empleado agregado",
              description: "El empleado fue persistido correctamente.",
            });
          } catch (err: unknown) {
            console.error("Error al crear empleado en servidor:", err);
            // Log full response body when available to aid debugging
            console.error("Server response:", (err as any)?.response?.data ?? (err as any)?.response ?? err);

            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
              const confirmar = window.confirm(
                "Ya existe un empleado con ese RFC y teléfono en otra vivienda. ¿Deseas vincularlo también a tu vivienda?",
              );

              if (confirmar) {
                try {
                  await guardarEmpleado(values, true);
                  queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
                  setIsAddModalOpen(false);
                  toast({
                    title: "Empleado vinculado",
                    description: "Se reutilizó el RFC y se registró para tu vivienda.",
                  });
                  return;
                } catch (secondErr: unknown) {
                  const secondMessage =
                    secondErr instanceof Error ? secondErr.message : "No se pudo guardar en servidor";
                  toast({
                    title: "Error al guardar",
                    description: secondMessage,
                    variant: "destructive",
                  });
                  return;
                }
              }

              return;
            }
            const serverMessage = (err as any)?.response?.data?.message;
            const message = serverMessage || (err instanceof Error ? err.message : "No se pudo guardar en servidor");
            toast({
              title: "Error al guardar",
              description: message,
              variant: "destructive",
            });
            queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
          }
        }}
      />

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

      <MiEmpleadoHorarioDialog
        nombre={modalEdit.selectedEmpleado?.nombre || ""}
        horarios={modalEdit.selectedEmpleado?.servicio?.horarios || []}
        open={modalHorario.isOpen}
        onOpenChange={modalHorario.setIsOpen}
      />
    </div>
  );
}
