import { RefreshCcw, Trash2, X } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { EmpleadoDomestico } from "../types";

type EmpleadosDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEmpleado: EmpleadoDomestico | null;
  mode: "deactivate" | "reactivate";
  motivo: string;
  onMotivoChange: (value: string) => void;
  isDeleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
};

export function EmpleadosDeleteDialog({
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
  const isDeactivate = mode === "deactivate";
  const motivoError = isDeactivate && !motivo.trim();
  const title = isDeactivate
    ? "Dar de baja a empleado domestico"
    : "Reincorporar empleado domestico";
  const description = isDeactivate
    ? "Estas seguro de completar esta accion? Se eliminaran todos los permisos de acceso al empleado domestico."
    : "Esta accion reactivara el acceso del empleado domestico.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <div className="flex items-start gap-4 px-6 pb-6 pt-6">
          <div
            className={
              isDeactivate
                ? "flex size-12 items-center justify-center rounded-full bg-red-50"
                : "flex size-12 items-center justify-center rounded-full bg-amber-50"
            }
          >
            {isDeactivate ? (
              <Trash2 className="size-5 text-red-500" />
            ) : (
              <RefreshCcw className="size-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <DialogHeader className="gap-2">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {selectedEmpleado && (
              <p className="mt-3 text-sm text-muted-foreground">
                {selectedEmpleado.nombre} - {selectedEmpleado.destino}
              </p>
            )}
            {isDeactivate && (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Motivo
                </label>
                <Textarea
                  value={motivo}
                  onChange={(event) => onMotivoChange(event.target.value)}
                  placeholder="Escribe el motivo de la baja"
                />
                {motivoError && (
                  <p className="text-xs text-red-600">
                    El motivo es obligatorio.
                  </p>
                )}
              </div>
            )}
            {deleteError && (
              <p className="mt-3 text-sm text-red-600">{deleteError}</p>
            )}
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-mt-1"
              disabled={isDeleting}
            >
              <X className="size-4" />
            </Button>
          </DialogClose>
        </div>
        <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || motivoError}
            className={
              isDeactivate
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-amber-500 text-amber-950 hover:bg-amber-600"
            }
          >
            {isDeleting
              ? isDeactivate
                ? "Dando de baja..."
                : "Reincorporando..."
              : isDeactivate
                ? "Confirmar baja"
                : "Reincorporar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
