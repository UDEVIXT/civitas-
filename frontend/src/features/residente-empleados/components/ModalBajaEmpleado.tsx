"use client";

import { AlertCircle, CalendarX, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Importamos el tipo real desde tus types compartidos para evitar discrepancias
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

type EmpleadosDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmpleado: EmpleadoDomestico | null;
  mode: "deactivate" | "reactivate"; // Controla si es suspensión o reactivación
  motivo: string;
  onMotivoChange: (value: string) => void;
  isDeleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
};


export function ModalBajaEmpleado({
  open,
  onOpenChange,
  selectedEmpleado,
  mode,
  motivo,
  onMotivoChange,
  isDeleting,
  deleteError,
  onConfirm,
}: EmpleadosDeleteDialogProps) {
  const isSuspension = mode === "deactivate";

  // Validación: mínimo 5 caracteres si es una suspensión temporal
  const motivoError = isSuspension && motivo.trim().length > 0 && motivo.trim().length < 5;

  const title = isSuspension
    ? "Suspender acceso temporalmente"
    : "Reactivar acceso de empleado";

  const description = isSuspension
    ? "El sistema bloqueará temporalmente el acceso de este empleado a la privada (por vacaciones o suspensión), pero conservará su ficha activa para una reactivación posterior."
    : "Se restaurarán inmediatamente todos los permisos de acceso y horarios previamente configurados para este empleado.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-0 shadow-2xl">
        <div className="relative px-6 pb-6 pt-8 text-center sm:px-8">
          <DialogHeader className="items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-500 ring-8 ring-amber-50">
              <AlertCircle className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-semibold text-zinc-900">
              {title}
            </DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-6 text-zinc-600">
              {description}
            </DialogDescription>
          </DialogHeader>

          {selectedEmpleado && (
            <div className="mt-5 flex items-center justify-center">
              <div className="w-full max-w-sm rounded-lg bg-white border border-zinc-100 px-4 py-3 text-center shadow-sm">
                <p className="text-base font-extrabold text-zinc-900">{selectedEmpleado.nombre}</p>
                {selectedEmpleado.servicio?.tipo_servicio?.nombre && (
                  <p className="text-xs text-zinc-500 mt-1">{selectedEmpleado.servicio.tipo_servicio.nombre}</p>
                )}
              </div>
            </div>
          )}

          {isSuspension && (
            <div className="mt-4 space-y-2 text-left">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Motivo de la suspensión temporal
              </label>
              <Textarea
                value={motivo}
                onChange={(event) => onMotivoChange(event.target.value)}
                placeholder="Ej. Periodo vacacional / Permiso temporal"
                className="min-h-28 resize-none rounded-xl border-zinc-200"
              />
              {motivoError && (
                <p className="text-xs text-red-600">
                  Por favor, escribe un motivo más detallado (mínimo 5 caracteres).
                </p>
              )}
            </div>
          )}

          {deleteError && (
            <p className="mt-3 text-sm text-red-600">{deleteError}</p>
          )}

          <DialogFooter className="mt-8 flex-row gap-3 border-t pt-5">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="h-11 rounded-xl px-6">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              className={
                isSuspension
                  ? "h-11 rounded-xl bg-red-500 px-6 text-white hover:bg-red-600"
                  : "h-11 rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700"
              }
              onClick={onConfirm}
              disabled={isDeleting || (isSuspension && motivo.trim().length < 5)}
            >
              {isDeleting
                ? "Procesando..."
                : isSuspension
                  ? "Sí, Revocar Acceso"
                  : "Sí, Reactivar Acceso"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
