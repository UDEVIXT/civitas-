"use client";

import { Pencil } from "lucide-react";
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

type MisEmpleadosTableProps = {
  items: EmpleadoDomestico[];
  isLoading: boolean;
  onEditClick: (empleado: EmpleadoDomestico) => void;
};

export function TablaMisEmpleados({
  items,
  isLoading,
  onEditClick,
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
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
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
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {empleado.servicio?.horario_texto || "Sin horario"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditClick(empleado)}
                      className="rounded-full hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
