"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LogIn,
  UserX,
  Lock,
} from "lucide-react";
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
import { FiltrosEmpleados, FiltrosEmpleadosValues } from "./FiltrosEmpleados";

type TipoEmpleado = "LIMPIEZA" | "CHOFER" | "CUIDADOR" | "JARDINERO" | "COCINERO" | "OTRO";
type EstadoEmpleado = "ACTIVO" | "INACTIVO" | "BLOQUEADO";

interface EmpleadoDomestico {
  id: string;
  nombre: string;
  iniciales: string;
  colorAvatar: string;
  tipo: TipoEmpleado;
  residente: string;
  propiedad: string;
  diasAutorizados: string;
  horarioAutorizado: string;
  estado: EstadoEmpleado;
  bloqueadoPorAdmin: boolean;
  vinculosActivos: number;
  notaExtra?: string;
}

const MOCK_EMPLEADOS: EmpleadoDomestico[] = [
  {
    id: "1",
    nombre: "María García López",
    iniciales: "MG",
    colorAvatar: "bg-pink-500",
    tipo: "LIMPIEZA",
    residente: "Juan Pérez",
    propiedad: "Casa #15",
    diasAutorizados: "Lun-Vie",
    horarioAutorizado: "8am–4pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
  {
    id: "2",
    nombre: "Carlos López Ruiz",
    iniciales: "CL",
    colorAvatar: "bg-blue-500",
    tipo: "CHOFER",
    residente: "Ana Martínez",
    propiedad: "Casa #8",
    diasAutorizados: "Miércoles",
    horarioAutorizado: "10am–2pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
  {
    id: "3",
    nombre: "Rosa Mendoza Torres",
    iniciales: "RM",
    colorAvatar: "bg-purple-500",
    tipo: "CUIDADOR",
    residente: "Luis Torres",
    propiedad: "Casa #23",
    diasAutorizados: "Domingo",
    horarioAutorizado: "9am–12pm",
    estado: "INACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 0,
  },
  {
    id: "4",
    nombre: "Pedro Ramírez Vega",
    iniciales: "PR",
    colorAvatar: "bg-green-600",
    tipo: "JARDINERO",
    residente: "Carmen Vega",
    propiedad: "Casa #742",
    diasAutorizados: "Lunes",
    horarioAutorizado: "10am–12pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
  {
    id: "5",
    nombre: "Elena Vásquez Mora",
    iniciales: "EV",
    colorAvatar: "bg-orange-500",
    tipo: "COCINERO",
    residente: "Roberto Díaz",
    propiedad: "Casa #4A",
    diasAutorizados: "Lun-Vie",
    horarioAutorizado: "8am–4pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
  {
    id: "6",
    nombre: "Miguel Santos Cruz",
    iniciales: "MS",
    colorAvatar: "bg-red-600",
    tipo: "LIMPIEZA",
    residente: "Sofía Ruiz",
    propiedad: "Casa #71",
    diasAutorizados: "Lun-Vie",
    horarioAutorizado: "9am–6pm",
    estado: "BLOQUEADO",
    bloqueadoPorAdmin: true,
    vinculosActivos: 0,
    notaExtra: "Bloqueado por Administración",
  },
  {
    id: "7",
    nombre: "Lucía Hernández Paz",
    iniciales: "LH",
    colorAvatar: "bg-teal-500",
    tipo: "CUIDADOR",
    residente: "Sofía Ruiz",
    propiedad: "Casa #3",
    diasAutorizados: "Mar-Jue",
    horarioAutorizado: "7am–3pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
  {
    id: "8",
    nombre: "Antonio Flores Soto",
    iniciales: "AF",
    colorAvatar: "bg-yellow-600",
    tipo: "CHOFER",
    residente: "Manuel Castro",
    propiedad: "Casa #120",
    diasAutorizados: "Lun-Vie",
    horarioAutorizado: "8am–4pm",
    estado: "INACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 0,
  },
  {
    id: "9",
    nombre: "Isabel Moreno Reyes",
    iniciales: "IM",
    colorAvatar: "bg-indigo-500",
    tipo: "LIMPIEZA",
    residente: "Ana García / Luis Pérez",
    propiedad: "Casa #2B",
    diasAutorizados: "Sábado",
    horarioAutorizado: "9am–1pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 2,
    notaExtra: "Vinculada a 2 residentes",
  },
  {
    id: "10",
    nombre: "Fernando Cruz Medina",
    iniciales: "FC",
    colorAvatar: "bg-red-700",
    tipo: "JARDINERO",
    residente: "Daniela Herrera",
    propiedad: "Casa #55",
    diasAutorizados: "Mié-Vie",
    horarioAutorizado: "8am–12pm",
    estado: "BLOQUEADO",
    bloqueadoPorAdmin: true,
    vinculosActivos: 0,
    notaExtra: "Bloqueado por Administración",
  },
  {
    id: "11",
    nombre: "Patricia Gómez Luna",
    iniciales: "PG",
    colorAvatar: "bg-rose-500",
    tipo: "COCINERO",
    residente: "Diana López",
    propiedad: "Casa #7",
    diasAutorizados: "Lun-Vie",
    horarioAutorizado: "8am–5pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
  {
    id: "12",
    nombre: "Roberto Sánchez Vera",
    iniciales: "RS",
    colorAvatar: "bg-cyan-600",
    tipo: "OTRO",
    residente: "Andrés Vargas",
    propiedad: "Casa #31",
    diasAutorizados: "Jueves",
    horarioAutorizado: "10am–4pm",
    estado: "ACTIVO",
    bloqueadoPorAdmin: false,
    vinculosActivos: 1,
  },
];

const PAGE_SIZE = 8;

const estadoBadge: Record<EstadoEmpleado, { label: string; className: string }> = {
  ACTIVO: { label: "Activo", className: "bg-green-100 text-green-800 hover:bg-green-100 border-0" },
  INACTIVO: { label: "Inactivo", className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0" },
  BLOQUEADO: { label: "Bloqueado", className: "bg-red-100 text-red-800 hover:bg-red-100 border-0" },
};

const tipoLabel: Record<TipoEmpleado, string> = {
  LIMPIEZA: "Limpieza",
  CHOFER: "Chofer",
  CUIDADOR: "Cuidador",
  JARDINERO: "Jardinero",
  COCINERO: "Cocinero",
  OTRO: "Otro",
};

export function EmpleadosDomesticosPage() {
  const [filtros, setFiltros] = useState<FiltrosEmpleadosValues>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [pageError, setPageError] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...MOCK_EMPLEADOS];

    if (filtros.busqueda?.trim()) {
      const q = filtros.busqueda.toLowerCase();
      result = result.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.residente.toLowerCase().includes(q)
      );
    }

    if (filtros.estado) {
      result = result.filter((e) => e.estado === filtros.estado);
    }

    if (filtros.tipo) {
      result = result.filter((e) => e.tipo === filtros.tipo);
    }

    return result;
  }, [filtros]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
    setPageInput("1");
    setPageError(null);
  }, [filtros]);

  useEffect(() => {
    setPageInput(String(currentPage));
    setPageError(null);
  }, [currentPage]);

  const paginados = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageSubmit = () => {
    const num = parseInt(pageInput, 10);
    if (isNaN(num) || num < 1) {
      setPageError(`Ingresa un número entre 1 y ${totalPages}.`);
      setPageInput(String(currentPage));
      return;
    }
    if (num > totalPages) {
      setPageError(`No existe la página ${num}. Redirigiendo a la última (${totalPages}).`);
      setCurrentPage(totalPages);
      return;
    }
    setPageError(null);
    setCurrentPage(num);
  };

  return (
    <div className="w-full min-w-0 container mx-auto py-6 px-4 sm:px-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Empleados domésticos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {`${filtered.length} empleado${filtered.length !== 1 ? "s" : ""} registrado${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" className="ml-4 shrink-0">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </div>
      )}

      <FiltrosEmpleados filters={filtros} onFilterChange={setFiltros} />

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-45">Empleado</TableHead>
              <TableHead className="hidden sm:table-cell">Propiedad</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Días autorizados</TableHead>
              <TableHead className="hidden lg:table-cell">Horario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {filtros.busqueda?.trim()
                    ? "No se encontraron empleados que coincidan con la búsqueda."
                    : "No hay empleados domésticos registrados."}
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((emp) => {
                const isBloqueado = emp.estado === "BLOQUEADO";
                const isInactivo = emp.estado === "INACTIVO";
                const badge = estadoBadge[emp.estado];

                return (
                  <TableRow
                    key={emp.id}
                    className={`align-top ${isBloqueado ? "bg-red-50 hover:bg-red-100" : ""}`}
                  >
                    <TableCell className="min-w-45">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${emp.colorAvatar}`}
                        >
                          {emp.iniciales}
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight flex items-center gap-1.5">
                            {isBloqueado && (
                              <Lock className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            )}
                            {emp.nombre}
                          </p>
                          {isBloqueado && (
                            <p className="text-xs font-semibold text-red-600 mt-0.5 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              Bloqueado por Administración
                            </p>
                          )}
                          {emp.notaExtra && !isBloqueado && (
                            <p className="text-xs text-blue-600 mt-0.5">{emp.notaExtra}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">
                            {emp.propiedad} · {emp.residente}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm">
                      <p className="font-medium">{emp.propiedad}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{emp.residente}</p>
                      {emp.vinculosActivos > 1 && (
                        <p className="text-xs text-blue-600 mt-0.5">
                          {emp.vinculosActivos} vínculos activos
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm">
                      {tipoLabel[emp.tipo]}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {emp.diasAutorizados}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {emp.horarioAutorizado}
                    </TableCell>

                    <TableCell>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-right">
                      {isBloqueado ? (
                        <Button
                          size="sm"
                          disabled
                          className="bg-red-200 text-red-700 cursor-not-allowed hover:bg-red-200"
                        >
                          <Lock className="h-3.5 w-3.5 mr-1" />
                          Bloqueado
                        </Button>
                      ) : isInactivo ? (
                        <Button size="sm" disabled variant="outline" className="cursor-not-allowed">
                          <UserX className="h-3.5 w-3.5 mr-1" />
                          Dado de baja
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <LogIn className="h-3.5 w-3.5 mr-1" />
                          Registrar entrada
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
        <span className="text-center sm:text-left">
          {`Mostrando ${filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} de ${filtered.length} empleados`}
        </span>

        <div className="flex flex-col items-center sm:items-end gap-1">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Anterior</span>
            </Button>

            <div className="flex items-center gap-1 text-sm">
              <span>Página</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => { setPageInput(e.target.value); setPageError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
                onBlur={handlePageSubmit}
                className="w-12 h-8 text-center rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span>de {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="hidden xs:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {pageError && (
            <p className="text-xs text-amber-600 flex items-center gap-1 text-center sm:text-right">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {pageError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
