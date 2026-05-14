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
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <div className="flex items-start gap-4 px-6 pb-6 pt-6">
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
                    className="flex justify-between py-2"
                  >
                    <span>{capitalizeFirstLetter(horario.dia_semana)}</span>
                    <span>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
