"use client";

import { Pencil, Clock, UserMinus, UserCheck } from "lucide-react";
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

// 1. Modificamos el tipo de las Props para recibir la función onBaja
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
  onBaja, // <-- Desestructuramos la nueva prop
}: MisEmpleadosTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed">
        <p className="text-sm text-muted-foreground italic">
          Cargando tus empleados...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-x-auto">
      <div className="min-w-[600px]"> 
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-90">Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Horario Autorizado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No tienes empleados domésticos registrados.
                </TableCell>
              </TableRow>
            ) : (
              items.map((empleado, index) => {
                const isActive = empleado.servicio?.activo;
                return (
                  <TableRow
                    key={empleado.id_visitante}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                            avatarPalette[index % avatarPalette.length],
                          )}
                        >
                          {getInitials(empleado.nombre)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {empleado.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {empleado.telefono || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2 py-0 border",
                          isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500",
                        )}
                      >
                        {isActive ? "Activo" : "Suspendido"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerHorario(empleado)}
                      >
                        <Clock className="size-4" />
                        <span className="ml-2">Ver horario</span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón de Editar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(empleado)}
                          className="rounded-full hover:bg-amber-50 hover:text-amber-600"
                          title="Editar empleado"
                        >
                          <Pencil className="size-4" />
                        </Button>

                        {/* 2. Nuevo Botón Dinámico: Suspender o Reactivar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onBaja(empleado, isActive ? "deactivate" : "reactivate")}
                          className={cn(
                            "rounded-full",
                            isActive
                              ? "hover:bg-red-50 hover:text-red-600"
                              : "hover:bg-emerald-50 hover:text-emerald-600"
                          )}
                          title={isActive ? "Suspender acceso" : "Reactivar acceso"}
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