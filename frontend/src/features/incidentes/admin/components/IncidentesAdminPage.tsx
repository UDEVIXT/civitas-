"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Image as ImageIcon, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { FiltrosIncidentesAdmin } from "./FiltrosIncidentesAdmin";
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
import {
  EstadoIncidencia,
  PrioridadIncidencia,
} from "../api/incidencias-admin";
import { useIncidenciasAdmin } from "../hooks/useIncidenciasAdmin";


const estadoBadge: Record<EstadoIncidencia, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0" },
  EN_PROCESO: { label: "En proceso", className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-0" },
  RESUELTA: { label: "Resuelta", className: "bg-green-100 text-green-800 hover:bg-green-100 border-0" },
  CANCELADA: { label: "Cancelada", className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0" },
};

const prioridadBadge: Record<PrioridadIncidencia, { label: string; className: string }> = {
  BAJA: { label: "Baja", className: "bg-green-100 text-green-800 hover:bg-green-100 border-0" },
  MEDIA: { label: "Media", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0" },
  ALTA: { label: "Alta", className: "bg-orange-100 text-orange-800 hover:bg-orange-100 border-0" },
  CRITICA: { label: "Crítica", className: "bg-red-100 text-red-800 hover:bg-red-100 border-0" },
};

function formatFecha(fechaISO: string) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

export function IncidentesAdminPage() {
  const {
    incidentes,
    loading,
    error,
    currentPage,
    totalPages,
    totalIncidentes,
    filtros,
    setFiltros,
    setCurrentPage,
    refetch,
  } = useIncidenciasAdmin();

  const [pageInput, setPageInput] = useState(String(currentPage));
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    setPageInput(String(currentPage));
    setPageError(null);
  }, [currentPage]);

  const handlePageInputSubmit = () => {
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
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidencias</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? "Cargando..." : `${totalIncidentes} incidencia${totalIncidentes !== 1 ? "s" : ""} registrada${totalIncidentes !== 1 ? "s" : ""}`}
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

      <FiltrosIncidentesAdmin
        filters={{
          busqueda: filtros.busqueda,
          estado: filtros.estado,
          prioridad: filtros.prioridad,
        }}
        onFilterChange={(f) => setFiltros(f)}
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[240px]">Incidencia</TableHead>
              <TableHead>Residente</TableHead>
              <TableHead className="whitespace-nowrap">Fecha y hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-center">Fotos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Cargando incidencias...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : incidentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {filtros.busqueda?.trim() ? "No se encontraron incidencias que coincidan con tu búsqueda." : "No hay incidencias registradas."}
                </TableCell>
              </TableRow>
            ) : (
              incidentes.map((inc) => {
                const estado = estadoBadge[inc.estado];
                return (
                  <TableRow key={inc.id_incidencia} className="align-top">
                    <TableCell className="max-w-[240px]">
                      <p className="font-medium text-sm leading-tight truncate">{inc.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{inc.descripcion}</p>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {inc.es_anonimo ? (
                        <span className="italic text-muted-foreground">Anónimo</span>
                      ) : (
                        inc.nombre_residente ?? <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {formatFecha(inc.fecha_creacion)}
                    </TableCell>
                    <TableCell>
                      <Badge className={estado.className}>{estado.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {inc.prioridad ? (
                        <Badge className={prioridadBadge[inc.prioridad].className}>
                          {prioridadBadge[inc.prioridad].label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {inc.ubicacion ? (
                        <div className="flex items-start gap-1 text-sm text-muted-foreground max-w-[140px]">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{inc.ubicacion}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {inc.fotos && inc.fotos.length > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span>{inc.fotos.length}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
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
          {loading ? "Cargando..." : `Mostrando ${Math.min((currentPage - 1) * 8 + 1, incidentes.length)}–${Math.min(currentPage * 8, incidentes.length)} de ${incidentes.length}`}
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
                onKeyDown={(e) => e.key === "Enter" && handlePageInputSubmit()}
                onBlur={handlePageInputSubmit}
                disabled={loading}
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
