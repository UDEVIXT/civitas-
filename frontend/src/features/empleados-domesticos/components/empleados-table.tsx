import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

import type { EmpleadoDomestico } from "../types";

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]);
  return initials.join("").toUpperCase();
}

type EmpleadosTableProps = {
  items: EmpleadoDomestico[];
  isLoading: boolean;
  onEdit: (empleado: EmpleadoDomestico) => void;
  onVerHorario: (empleado: EmpleadoDomestico) => void;
};

export function EmpleadosTable({
  items = [],
  isLoading,
  onEdit,
  onVerHorario,
}: EmpleadosTableProps) {
  const hasItems = items.length > 0;

  if (isLoading && !hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">
          Cargando empleados...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-3 px-4 py-4 md:hidden">
        {hasItems ? (
          items.map((empleado) => (
            <article
              key={empleado.id_visitante}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border">
                  <AvatarImage
                    src={empleado.url_imagen}
                    alt={empleado.nombre}
                  />
                  <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                    {getInitials(empleado.nombre || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {empleado.nombre || "Sin nombre"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {empleado.telefono || "Sin teléfono"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    empleado.servicio?.activo
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-50 text-zinc-500"
                  }
                >
                  {empleado.servicio?.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">Tipo</span>
                  <span className="text-right">
                    {empleado.servicio?.tipo_servicio?.nombre ||
                      "Tipo no disponible"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">Destino</span>
                  <span className="text-right">
                    {empleado.residente?.vivienda?.numero_vivienda || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    Fecha de registro
                  </span>
                  <span className="text-right">
                    {empleado.servicio?.fecha_registro
                      ? new Date(
                          empleado.servicio.fecha_registro,
                        ).toLocaleDateString()
                      : "Fecha no disponible"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onVerHorario(empleado)}
                >
                  <Clock className="size-4" />
                  <span className="ml-2">Ver horario</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={
                    !empleado.servicio?.activo
                      ? "h-9 w-full rounded-lg border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
                      : "h-9 w-full rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-500 border-none"
                  }
                  onClick={() => onEdit(empleado)}
                >
                  {!empleado.servicio?.activo
                    ? "Reincorporar"
                    : "Dar de baja"}
                </Button>
              </div>
            </article>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron empleados.
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-60">Nombre</TableHead>
              <TableHead className="w-20">Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Horario Autorizado</TableHead>
              <TableHead className="w-30">Fecha de Registro</TableHead>
              <TableHead className="text-right">&nbsp;</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasItems
              ? items.map((empleado) => (
                  <TableRow key={empleado.id_visitante}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-border">
                          <AvatarImage
                            src={empleado.url_imagen}
                            alt={empleado.nombre}
                          />
                          <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                            {getInitials(empleado.nombre || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {empleado.nombre || "Sin nombre"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {empleado.telefono || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {empleado.servicio?.tipo_servicio?.nombre ||
                        "Tipo no disponible"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          empleado.servicio?.activo
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500"
                        }
                      >
                        {empleado.servicio?.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {empleado.residente?.vivienda?.numero_vivienda || "N/A"}
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
                    <TableCell className="text-sm text-muted-foreground">
                      {empleado.servicio?.fecha_registro
                        ? new Date(
                            empleado.servicio.fecha_registro,
                          ).toLocaleDateString()
                        : "Fecha no disponible"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={
                          !empleado.servicio?.activo
                            ? "h-8 rounded-lg border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
                            : "h-8 rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-500 border-none"
                        }
                        onClick={() => onEdit(empleado)}
                      >
                        {!empleado.servicio?.activo
                          ? "Reincorporar"
                          : "Dar de baja"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : !isLoading && (
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
      </div>
    </div>
  );
}
