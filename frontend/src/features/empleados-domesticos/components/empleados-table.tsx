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

import type { EmpleadoDomestico } from "../types";

const avatarPalette = [
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
];

const statusStyles: Record<EmpleadoDomestico["estado"], string> = {
  Activo: "border-emerald-200 bg-emerald-100 text-emerald-700",
  Inactivo: "border-zinc-200 bg-zinc-100 text-zinc-500",
};

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]);
  return initials.join("").toUpperCase();
}

type EmpleadosTableProps = {
  items: EmpleadoDomestico[];
  isLoading: boolean;
  onActionClick: (empleado: EmpleadoDomestico) => void;
};

export function EmpleadosTable({
  items,
  isLoading,
  onActionClick,
}: EmpleadosTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="w-90">Nombre</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Destino</TableHead>
          <TableHead>Horario Autorizado</TableHead>
          <TableHead className="text-right">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((empleado, index) => (
          <TableRow key={empleado.id}>
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
                    {empleado.telefono}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={statusStyles[empleado.estado]}>
                {empleado.estado}
              </Badge>
            </TableCell>
            <TableCell className="text-sm font-medium">
              {empleado.destino}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {empleado.horarioAutorizado}
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                className={
                  empleado.estado === "Inactivo"
                    ? "h-8 rounded-lg border border-amber-200 bg-white px-4 text-xs font-semibold text-amber-900 hover:bg-amber-50"
                    : "h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-amber-950 hover:bg-amber-500"
                }
                onClick={() => onActionClick(empleado)}
              >
                {empleado.estado === "Inactivo"
                  ? "Reincorporar empleado"
                  : "Dar de baja"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {!isLoading && items.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-6 text-center text-sm text-muted-foreground"
            >
              No se encontraron empleados.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
