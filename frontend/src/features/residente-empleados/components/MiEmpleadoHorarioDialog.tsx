"use client";
import { Clock } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { capitalizeFirstLetter } from "@/lib/utils";

// Definimos un tipo local para asegurar el tipado
type HorarioServicio = {
  dia_semana: string;
  hora_inicio: string | Date;
  hora_fin: string | Date;
};

type MiEmpleadoHorarioDialogProps = {
  nombre: string;
  horarios: HorarioServicio[];
  codigoQr?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Función limpia para formatear strings "HH:MM:SS" o Date sin tocar zonas horarias
const formatearHoraLimpia = (timeValue: any) => {
  if (!timeValue) return "";

  // Caso A: Si es un string directo tipo "08:30:00" o "10:00" de Postgres (¡Tu caso!)
  if (typeof timeValue === 'string' && !timeValue.includes('T')) {
    const [strHoras, strMinutos] = timeValue.split(':');
    const hours = parseInt(strHoras, 10);
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    const hours12 = hours % 12 || 12;
    const hoursStr = String(hours12).padStart(2, '0');
    return `${hoursStr}:${strMinutos} ${ampm}`;
  }

  // Caso B: Resguardo si Prisma de casualidad mandó un objeto Date completo
  const d = new Date(timeValue);
  const hours = d.getUTCHours(); // Usamos UTC para evitar desfases de la fecha cero ISO
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  const hours12 = hours % 12 || 12;
  const hoursStr = String(hours12).padStart(2, '0');
  
  return `${hoursStr}:${minutes} ${ampm}`;
};

export function MiEmpleadoHorarioDialog({
  nombre,
  horarios,
  codigoQr,
  open,
  onOpenChange,
}: MiEmpleadoHorarioDialogProps) {
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
              Aquí puedes ver los horarios del empleado doméstico.
            </DialogDescription>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="mb-3 text-lg font-semibold">QR de acceso</h3>
            {codigoQr ? (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <QRCode value={codigoQr} size={180} level="M" />
                </div>
                <p className="text-center text-sm text-zinc-600">
                  Comparte este código QR para identificar al empleado.
                </p>
              </div>
            ) : (
              <p className="text-center text-sm italic text-zinc-500">
                Aún no hay un QR disponible para este empleado.
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold">Horarios Autorizados</h3>
            <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-xl space-y-1">
              {horarios && horarios.length > 0 ? (
                horarios.map((horario) => (
                  <div
                    key={horario.dia_semana}
                    className="flex justify-between py-2 border-b last:border-0 border-gray-100"
                  >
                    <span className="font-medium text-gray-700">
                      {capitalizeFirstLetter(horario.dia_semana.toLowerCase())}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatearHoraLimpia(horario.hora_inicio)} - {formatearHoraLimpia(horario.hora_fin)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="italic text-center py-2">No hay horarios registrados.</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="p-4 border-t bg-gray-50/50 rounded-b-2xl">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}