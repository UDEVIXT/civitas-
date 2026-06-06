"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { FiltrosEmpleados } from "./FiltrosEmpleados";
import { useEmpleadosGuardia } from "../hooks/useEmpleadosGuardia";
import { EmpleadoGuardia } from "../api/empleados-guardia";

type EstadoVis = "ACTIVO" | "INACTIVO" | "BLOQUEADO";

const DIA_LABELS: Record<string, string> = {
  LUNES: "Lun", MARTES: "Mar", MIERCOLES: "Mié",
  JUEVES: "Jue", VIERNES: "Vie", SABADO: "Sáb", DOMINGO: "Dom",
};

function getEstado(emp: EmpleadoGuardia): EstadoVis {
  if (emp.bloqueo_global) return "BLOQUEADO";
  if (emp.estado_acceso === "Activo") return "ACTIVO";
  return "INACTIVO";
}

function getIniciales(nombre: string): string {
  return nombre.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

function getColorAvatar(id: string): string {
  const colors = [
    "bg-pink-500", "bg-blue-500", "bg-purple-500", "bg-green-600",
    "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
    "bg-cyan-600", "bg-amber-600",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % colors.length;
  return colors[Math.abs(hash)];
}

function formatDias(dias: string[]): string {
  return dias.map((d) => DIA_LABELS[d] ?? d).join(", ") || "—";
}

function formatHorario(horarios: string[]): string {
  return horarios[0] ?? "—";
}

const estadoBadge: Record<EstadoVis, { label: string; className: string }> = {
  ACTIVO: { label: "Activo", className: "bg-green-100 text-green-800 hover:bg-green-100 border-0" },
  INACTIVO: { label: "Inactivo", className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0" },
  BLOQUEADO: { label: "Bloqueado", className: "bg-red-100 text-red-800 hover:bg-red-100 border-0" },
};

export function EmpleadosDomesticosPage() {
  const {
    empleados,
    loading,
    error,
    currentPage,
    totalPages,
    totalEmpleados,
    filtros,
    setFiltros,
    setCurrentPage,
    refetch,
  } = useEmpleadosGuardia();

  const [pageInput, setPageInput] = useState(String(currentPage));
  const [pageError, setPageError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPageInput(String(currentPage));
    setPageError(null);
  }, [currentPage]);

  const paginados = useMemo(() => {
    let result = empleados;
    if (filtros.estado) {
      result = result.filter((e) => getEstado(e) === filtros.estado);
    }
    if (filtros.tipo) {
      result = result.filter(
        (e) => e.tipo_empleado?.toLowerCase() === filtros.tipo?.toLowerCase()
      );
    }
    return result;
  }, [empleados, filtros.estado, filtros.tipo]);

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
          {loading ? "Cargando..." : `${totalEmpleados} empleado${totalEmpleados !== 1 ? "s" : ""} registrado${totalEmpleados !== 1 ? "s" : ""}`}
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="ml-4 shrink-0">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Cargando empleados...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {filtros.busqueda?.trim()
                    ? "No se encontraron empleados que coincidan con la búsqueda."
                    : "No hay empleados domésticos registrados."}
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((emp) => {
                const estado = getEstado(emp);
                const isBloqueado = estado === "BLOQUEADO";
                const isInactivo = estado === "INACTIVO";
                const badge = estadoBadge[estado];
                const iniciales = getIniciales(emp.nombre_completo);
                const colorAvatar = getColorAvatar(emp.id_visitante);

                const isExpanded = expandedId === emp.id_visitante;

                return (
                  <React.Fragment key={emp.id_visitante}>
                  <TableRow
                    className={`align-top cursor-pointer sm:cursor-default ${isBloqueado ? "bg-red-50 hover:bg-red-100" : ""}`}
                    onClick={() => setExpandedId(isExpanded ? null : emp.id_visitante)}
                  >
                    <TableCell className="min-w-45">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorAvatar}`}
                        >
                          {iniciales}
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight flex items-center gap-1.5">
                            {isBloqueado && (
                              <Lock className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            )}
                            {emp.nombre_completo}
                          </p>
                          {isBloqueado && (
                            <p className="text-xs font-semibold text-red-600 mt-0.5 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              Bloqueado por Administración
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">
                            {emp.propiedad_asociada} · {emp.residente_asociado}
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 sm:hidden transition-transform ml-auto ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm">
                      <p className="font-medium">{emp.propiedad_asociada}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{emp.residente_asociado}</p>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm">
                      {emp.tipo_empleado || "—"}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDias(emp.dias_autorizados)}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {formatHorario(emp.horarios_autorizados)}
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
                  {isExpanded && (
                    <TableRow className={`sm:hidden ${isBloqueado ? "bg-red-50" : "bg-muted/30"}`}>
                      <TableCell colSpan={7} className="px-4 pb-3 pt-0">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo</span>
                            <span>{emp.tipo_empleado || "—"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Días</span>
                            <span>{formatDias(emp.dias_autorizados)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Horario</span>
                            <span>{formatHorario(emp.horarios_autorizados)}</span>
                          </div>
                          <div className="pt-1">
                            {isBloqueado ? (
                              <Button size="sm" disabled className="w-full bg-red-200 text-red-700 cursor-not-allowed hover:bg-red-200">
                                <Lock className="h-3.5 w-3.5 mr-1" />
                                Bloqueado
                              </Button>
                            ) : isInactivo ? (
                              <Button size="sm" disabled variant="outline" className="w-full cursor-not-allowed">
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                Dado de baja
                              </Button>
                            ) : (
                              <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                                <LogIn className="h-3.5 w-3.5 mr-1" />
                                Registrar entrada
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
        <span className="text-center sm:text-left">
          {loading ? "Cargando..." : `Mostrando ${totalEmpleados === 0 ? 0 : (currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, totalEmpleados)} de ${totalEmpleados} empleados`}
        </span>

        <div className="flex flex-col items-center sm:items-end gap-1">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
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
