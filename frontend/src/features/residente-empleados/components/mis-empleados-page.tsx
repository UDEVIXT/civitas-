"use client";

import * as React from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  WifiOff
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
import { ModalConfirmarVinculacion } from "./ModalConfirmarVinculacion"; // <-- Importamos el nuevo modal

type NuevoEmpleadoFormValues = Parameters<
  NonNullable<React.ComponentProps<typeof ModalAgregarEmpleado>["onSave"]>
>[0];

type HorarioFormulario = {
  dia: string;
  activo: boolean;
  hora_entrada: string;
  hora_salida: string;
};

export default function MisEmpleadosPage() {
  const { user } = useAuth();
  const idUsuarioActivo = user?.id ? String(user.id) : "";

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active">("all");
  const [page, setPage] = React.useState(1);

  // Estado para controlar el nuevo modal de confirmación (409)
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    values: NuevoEmpleadoFormValues | null;
    isSaving: boolean;
  }>({ isOpen: false, values: null, isSaving: false });

  const queryClient = useQueryClient();
  const { toast } = useToast();

const guardarEmpleado = React.useCallback(
  async (
    values: NuevoEmpleadoFormValues,
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
      .filter((h: HorarioFormulario) => h.activo)
      .map((h: HorarioFormulario) => ({
        dia_semana: mapDia(h.dia),
        hora_inicio: h.hora_entrada,
        hora_fin: h.hora_salida,
      }));

    if (!values.id_tipo_servicio || values.id_tipo_servicio.trim() === "") {
      throw new Error("Selecciona un tipo de servicio válido antes de guardar.");
    }

    // Instanciación del objeto FormData para habilitar multipart/form-data
    const formData = new FormData();
    
    formData.append("nombre_completo", values.nombre);
    formData.append("rfc", values.rfc.trim().toUpperCase());
    formData.append("id_tipo_servicio", values.id_tipo_servicio);
    formData.append("confirmar_reuso_rfc", String(confirmarReusoRFC));

    if (values.telefono?.trim()) {
      formData.append("telefono", values.telefono.trim());
    }

    // Serialización estricta para compatibilidad con class-transformer en NestJS
    formData.append("horarios", JSON.stringify(horariosActivos));

    // Inyección del archivo binario. La clave debe coincidir exactamente con FileInterceptor
    if (values.fotoArchivo) {
      formData.append("foto_empleado", values.fotoArchivo);
    }

    return crearEmpleadoDomestico(formData);
  },
  [],
);

  const {
    empleados,
    isLoading,
    isError,
    refetch,
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

  // Función para manejar la confirmación de la vinculación (Reintento de guardado)
  const handleConfirmarVinculacion = async () => {
    if (!confirmModal.values) return;

    setConfirmModal((prev) => ({ ...prev, isSaving: true }));

    try {
      await guardarEmpleado(confirmModal.values, true);
      queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });

      // Cerramos ambos modales
      setConfirmModal({ isOpen: false, values: null, isSaving: false });
      setIsAddModalOpen(false);

      toast({
        title: "Empleado vinculado",
        description: "Se reutilizó el RFC y se registró exitosamente para tu vivienda.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo vincular el empleado";
      toast({
        title: "Error al guardar",
        description: message,
        variant: "destructive",
      });
      setConfirmModal((prev) => ({ ...prev, isSaving: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f6efdf] px-4 py-4 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-330 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
        {/* ... TODO TU HEADER, FILTROS Y TABLA EXACTAMENTE IGUAL ... */}
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
                <PopoverContent align="start" className="w-80 rounded-2xl border-zinc-200 shadow-xl">
                  {/* ... Contenido del Popover original ... */}
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
            {isError ? (
              // ESTADO DE ERROR (Sin conexión o fallo del servidor)
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600 shadow-sm">
                  <WifiOff className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-900">Problemas de conexión</h3>
                <p className="mb-6 max-w-md text-sm text-zinc-500">
                  No pudimos cargar la información de tus empleados. Verifica tu conexión a internet o el estado del servidor e intenta de nuevo.
                </p>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  className="border-zinc-300 hover:bg-zinc-50 font-medium"
                >
                  Volver a intentar
                </Button>
              </div>
            ) : (
              // ESTADO NORMAL (Tabla de empleados)
              <>
                <TablaMisEmpleados
                  items={visibleEmpleados}
                  isLoading={isLoading}
                  onEdit={modalEdit.handleEditClick}
                  onVerHorario={modalHorario.handleVerHorario}
                  onBaja={modalBaja.handleBajaClick}
                />
                
                {/* Paginación */}
                {!isLoading && filteredEmpleados.length > 0 && (
                  <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row">
                    <Button
                      variant="outline"
                      className="h-9 rounded-md border-zinc-200 bg-white px-3 text-sm shadow-sm hover:bg-zinc-50"
                      disabled={currentPage === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <p className="text-sm text-zinc-600">
                      Página {currentPage} de {totalPages}
                    </p>
                    <Button
                      variant="outline"
                      className="h-9 rounded-md border-zinc-200 bg-white px-3 text-sm shadow-sm hover:bg-zinc-50"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
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
            const status = (err as { response?: { status?: number } })?.response?.status;
            const serverMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            const normalizedMessage = typeof serverMessage === "string" ? serverMessage.toLowerCase() : "";

            // Si hay conflicto (409), abrimos el modal personalizado
            if (status === 409) {
              if (normalizedMessage.includes("baja global") || normalizedMessage.includes("globalmente")) {
                toast({
                  title: "Empleado no disponible",
                  description: serverMessage || "El empleado fue bloqueado globalmente por administración.",
                  variant: "destructive",
                });
                return;
              }

              setConfirmModal({
                isOpen: true,
                values: values,
                isSaving: false,
              });
              return;
            }

            const message = serverMessage || (err instanceof Error ? err.message : "No se pudo guardar en servidor");
            toast({
              title: "Error al guardar",
              description: message,
              variant: "destructive",
            });
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
        codigoQr={modalEdit.selectedEmpleado?.codigo_qr ?? null}
        open={modalHorario.isOpen}
        onOpenChange={modalHorario.setIsOpen}
      />

      {/* Renderizamos el nuevo Modal de Confirmación */}
      <ModalConfirmarVinculacion
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, values: null, isSaving: false })}
        onConfirm={handleConfirmarVinculacion}
        isSubmitting={confirmModal.isSaving}
      />
    </div>
  );
}
