"use client";

import { CalendarX, RefreshCcw } from "lucide-react";

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
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <div className="flex items-start gap-4 px-6 pb-6 pt-6">
          <div 
            className={
              isSuspension
                ? "flex size-12 items-center justify-center rounded-full bg-red-50 shrink-0"
                : "flex size-12 items-center justify-center rounded-full bg-emerald-50 shrink-0"
            }
          >
            {isSuspension ? (
              <CalendarX className="size-5 text-red-500" />
            ) : (
              <RefreshCcw className="size-5 text-emerald-600" />
            )}
          </div>
          
          <div className="flex-1">
            <DialogHeader className="gap-2">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            {selectedEmpleado && (
              <div className="mt-3 rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                <p className="text-sm font-medium text-zinc-900">
                  {selectedEmpleado.nombre}
                </p>
                {/* Leemos el puesto de forma segura desde la estructura real de tu objeto servicio */}
                {selectedEmpleado.servicio?.tipo_servicio?.nombre && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedEmpleado.servicio.tipo_servicio.nombre}
                  </p>
                )}
              </div>
            )}

            {isSuspension && (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Motivo de la suspensión temporal
                </label>
                <Textarea
                  value={motivo}
                  onChange={(event) => onMotivoChange(event.target.value)}
                  placeholder="Ej. Periodo vacacional / Permiso temporal"
                  className="resize-none"
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
          </div>
        </div>

        <DialogFooter className="border-t bg-zinc-50/50 px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-xl">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            className={
              isSuspension
                ? "rounded-xl bg-red-500 hover:bg-red-600 text-white"
                : "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            }
            onClick={onConfirm}
            disabled={isDeleting || (isSuspension && motivo.trim().length < 5)}
          >
            {isDeleting 
              ? "Procesando..." 
              : isSuspension 
                ? "Suspender Acceso" 
                : "Reactivar Acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}