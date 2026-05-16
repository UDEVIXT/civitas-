import { HorarioServicio } from "../types";
import { capitalizeFirstLetter } from "@/lib/utils";

import { Clock } from "lucide-react";
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

type EmpleadosHorarioDialogProps = {
  nombre: string;
  horarios: HorarioServicio[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EmpleadosHorarioDialog({
  nombre,
  horarios,
  open,
  onOpenChange,
}: EmpleadosHorarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl rounded-2xl p-0">
        <div className="flex flex-col gap-4 px-6 pb-6 pt-6 sm:flex-row sm:items-start">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-50">
            <Clock className="size-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-lg font-semibold">
              Horario de {nombre}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Aquí puedes ver los horarios del empleado domestico.
            </DialogDescription>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold">Horarios</h3>
          <div className="text-sm text-muted-foreground">
            {horarios.length > 0
              ? horarios.map((horario: HorarioServicio) => (
                  <div
                    key={horario.dia_semana}
                    className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>{capitalizeFirstLetter(horario.dia_semana)}</span>
                    <span className="text-foreground">
                      {new Date(horario.hora_inicio).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(horario.hora_fin).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              : "No hay horarios disponibles."}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
