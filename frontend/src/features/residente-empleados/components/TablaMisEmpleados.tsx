 //Muestra la tabla de la vista empleados domésticos, con sus respectivos botones para editar, ver horario y dar de baja o reactivar. Es un componente hijo de la vista MisEmpleados. Recibe los empleados como props desde el hook useResidenteEmpleados, que se encarga de hacer la consulta a la API y manejar el estado de carga y errores.

"use client";

import { Pencil, Clock, UserMinus, UserCheck } from "lucide-react";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

const avatarPalette = [
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
];

function getInitials(name: string) {
  if (!name) return "";
  const parts = name.split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatHorario(empleado: EmpleadoDomestico) {
  const horarios = empleado.servicio?.horarios ?? [];
  if (!horarios.length) return "Sin horario";

  const dayLabel: Record<string, string> = {
    LUNES: "Lun",
    MARTES: "Mar",
    MIERCOLES: "Mié",
    JUEVES: "Jue",
    VIERNES: "Vie",
    SABADO: "Sáb",
    DOMINGO: "Dom",
  };

  const first = horarios[0];
  const last = horarios[horarios.length - 1];
  const firstLabel = dayLabel[first.dia_semana] ?? first.dia_semana.slice(0, 3);
  const lastLabel = dayLabel[last.dia_semana] ?? last.dia_semana.slice(0, 3);

  const formatTime = (value?: string | Date) => {
    if (value === undefined || value === null || value === "") return "";

    let date: Date | null = null;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      } else {
        const m = value.match(/^(\d{1,2}):(\d{2})/);
        if (m) {
          const hours = parseInt(m[1], 10);
          const minutes = parseInt(m[2], 10);
          const suffix = hours >= 12 ? "pm" : "am";
          const normalizedHours = hours % 12 || 12;
          return `${normalizedHours}:${String(minutes).padStart(2, "0")}${suffix}`;
        }
      }
    } else {
      const coerced = new Date(String(value));
      if (!isNaN(coerced.getTime())) date = coerced;
    }

    if (!date) return String(value);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const suffix = hours >= 12 ? "pm" : "am";
    const normalizedHours = hours % 12 || 12;
    return `${normalizedHours}:${String(minutes).padStart(2, "0")}${suffix}`;
  };

  return `${firstLabel}-${lastLabel}: ${formatTime(first.hora_inicio)}-${formatTime(last.hora_fin)}`;
}

type MisEmpleadosTableProps = {
  items: EmpleadoDomestico[];
  isLoading: boolean;
  onEdit: (empleado: EmpleadoDomestico) => void;
  onVerHorario: (empleado: EmpleadoDomestico) => void;
  onBaja: (
    empleado: EmpleadoDomestico,
    mode: "deactivate" | "reactivate"
  ) => void;
};

export function TablaMisEmpleados({
  items,
  isLoading,
  onEdit,
  onVerHorario,
  onBaja, 
}: MisEmpleadosTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-zinc-500 italic">Cargando tus empleados...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-275">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 bg-zinc-50/80 text-[11px] uppercase tracking-wide text-zinc-500">
              <TableHead className="w-90 pl-5 font-medium text-zinc-500">Nombre</TableHead>
              <TableHead className="w-62.5 font-medium text-zinc-500">Horario Autorizado</TableHead>
              {/* Nueva columna para el reloj */}
              <TableHead className="w-24 text-center font-medium text-zinc-500">Detalle</TableHead>
              <TableHead className="w-37.5 font-medium text-zinc-500">Estado</TableHead>
              <TableHead className="text-right font-medium text-zinc-500">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5} // Cambiado a 5 por la nueva columna
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  No tienes empleados domésticos registrados.
                </TableCell>
              </TableRow>
            ) : (
              items.map((empleado, index) => {
                const isActive = empleado.servicio?.activo;
                const isGloballyBlocked = Boolean(empleado.servicio?.bloqueo_global);
                const canReactivate = !isActive && !isGloballyBlocked;
                return (
                  <TableRow
                    key={empleado.id_visitante}
                    className="border-zinc-200 transition-colors hover:bg-zinc-50/70"
                  >
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-11 items-center justify-center overflow-hidden rounded-full border border-zinc-200", avatarPalette[index % avatarPalette.length])}>
                          {empleado.url_imagen ? (
                            <Image src={empleado.url_imagen} alt={empleado.nombre} width={44} height={44} className="object-cover" unoptimized />
                          ) : (
                            <span className="text-sm font-semibold">{getInitials(empleado.nombre)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {empleado.nombre} -{" "}
                            {empleado.servicio?.cargo ||
                              empleado.servicio?.tipo_servicio?.nombre ||
                              "Empleado"}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {empleado.residente?.vivienda?.numero_vivienda
                              ? `Vivienda ${empleado.residente.vivienda.numero_vivienda}`
                              : empleado.telefono || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm text-zinc-600">
                      {formatHorario(empleado)}
                    </TableCell>

                    {/* Nueva celda exclusiva para el botón de Ver Horario */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onVerHorario(empleado)}
                        className="rounded-full hover:bg-zinc-100 hover:text-blue-600 text-zinc-400"
                        title="Ver detalle del horario"
                      >
                        <Clock className="size-4" />
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border px-3 py-0.5 text-xs font-medium",
                          isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                            : "border-zinc-200 bg-zinc-100 text-zinc-500",
                        )}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón de Editar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(empleado)}
                          className="rounded-full hover:bg-zinc-100 hover:text-zinc-900"
                          title="Editar empleado"
                        >
                          <Pencil className="size-4" />
                        </Button>

                        {/* Botón Dinámico: Suspender o Reactivar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!isActive && isGloballyBlocked}
                          onClick={() =>
                            onBaja(empleado, isActive ? "deactivate" : "reactivate")}
                          className={cn(
                            "rounded-full",
                            isActive
                              ? "hover:bg-red-50 hover:text-red-600"
                              : canReactivate
                                ? "hover:bg-emerald-50 hover:text-emerald-600"
                                : "cursor-not-allowed opacity-50"
                          )}
                          title={
                            isActive
                              ? "Suspender acceso"
                              : isGloballyBlocked
                                ? "Solo el administrador puede reincorporarlo"
                                : "Reactivar acceso"
                          }
                        >
                          {isActive ? (
                            <UserMinus className="size-4" />
                          ) : (
                            <UserCheck className="size-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}