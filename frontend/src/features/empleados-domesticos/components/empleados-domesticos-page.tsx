"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import type { EmpleadosMeta } from "../data/empleados";

const PAGE_SIZE = 7;

const statusOptions = ["Todos", "Activos"] as const;

type StatusFilter = (typeof statusOptions)[number];

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

export function EmpleadosDomesticosPage({
  initialData,
  initialMeta,
}: {
  initialData: EmpleadoDomestico[];
  initialMeta: EmpleadosMeta;
}) {
  const [empleados] = React.useState<EmpleadoDomestico[]>(initialData || []);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("Todos");
  const [page, setPage] = React.useState(1);

  const filteredEmployees = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return empleados.filter((empleado) => {
      const matchesStatus =
        statusFilter === "Todos" || empleado.estado === "Activo";
      const matchesSearch = normalizedSearch
        ? [empleado.nombre, empleado.destino, empleado.horarioAutorizado]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [empleados, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="min-h-screen bg-amber-50/30 text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col px-6 py-8 sm:px-8">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">UDEV</p>
              <h1 className="text-2xl font-semibold">Empleados domésticos</h1>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full",
                  statusFilter === status &&
                    "border-amber-300 bg-amber-50 text-amber-900",
                )}
              >
                {status}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <SlidersHorizontal className="size-4" />
              Más filtros
            </Button>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-border bg-white shadow-sm">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Nombre
            </p>
          </div>
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
              {pageEmployees.map((empleado, index) => (
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
                      className="h-8 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-amber-950 hover:bg-amber-500"
                    >
                      Dar de baja
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      currentPage === 1 && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                {pages.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      isActive={pageNumber === currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    type="button"
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={cn(
                      currentPage === totalPages &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </section>
      </main>
    </div>
  );
}
