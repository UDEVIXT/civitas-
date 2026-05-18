"use client";
import { useState, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Plus } from "lucide-react";

import { FiltrosIncidentes } from "./FiltrosIncidentes";
import { Incidente, EstadoIncidencia } from "../api/incidencias";
import { ModalDetalleIncidente } from "./ModalDetalleIncidente";

interface TablaEstadoIncidentesProps {
  data: Incidente[];
}

interface FiltrosState {
  estado?: 'Pendiente' | 'En proceso' | 'Resuelto' | 'Todos';
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  ordenarPor?: 'reciente' | 'antiguo';
}

const estadoLabel: Record<EstadoIncidencia, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  RESUELTA: "Resuelta",
  CANCELADA: "Cancelada",
};

const estadoFiltroToBackend: Record<string, EstadoIncidencia | undefined> = {
  Pendiente: "PENDIENTE",
  "En proceso": "EN_PROCESO",
  Resuelto: "RESUELTA",
  Todos: undefined,
};

const getPrioridadColor = (prioridad: string) => {
  const colors: Record<string, string> = {
    BAJA: "bg-green-100 text-green-800 hover:bg-green-100",
    MEDIA: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    ALTA: "bg-red-100 text-red-800 hover:bg-red-100",
  };
  return colors[prioridad?.toUpperCase()] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const getEstadoColor = (estado: EstadoIncidencia) => {
  const colors: Record<EstadoIncidencia, string> = {
    PENDIENTE: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    EN_PROCESO: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    RESUELTA: "bg-green-100 text-green-800 hover:bg-green-100",
    CANCELADA: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };
  return colors[estado] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const formatFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) return { fecha: "—", hora: "—" };
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return { fecha: `${dia}/${mes}/${anio}`, hora: `${horas}:${minutos}` };
};

const PAGE_SIZE = 6;

// ── Subcomponente que filtra localmente ──
function TablaLocal({ data, filters, onFilterChange }: {
  data: Incidente[];
  filters: FiltrosState;
  onFilterChange: (f: FiltrosState) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = data;

    if (filters.estado && filters.estado !== 'Todos') {
      const estadoBackend = estadoFiltroToBackend[filters.estado];
      if (estadoBackend) result = result.filter(i => i.estado === estadoBackend);
    }

    if (filters.busqueda) {
      result = result.filter(i =>
        i.motivo.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        i.descripcion.toLowerCase().includes(filters.busqueda!.toLowerCase())
      );
    }

    if (filters.fechaDesde) {
      result = result.filter(i => new Date(i.createdAt) >= new Date(filters.fechaDesde!));
    }

    if (filters.fechaHasta) {
      result = result.filter(i => new Date(i.createdAt) <= new Date(filters.fechaHasta!));
    }

    result.sort((a, b) => {
      const fa = new Date(a.createdAt).getTime();
      const fb = new Date(b.createdAt).getTime();
      return filters.ordenarPor === 'reciente' ? fb - fa : fa - fb;
    });

    return result;
  }, [data, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (newFilters: FiltrosState) => {
    setCurrentPage(1);
    onFilterChange(newFilters);
  };

  return (
    <FilasYPaginacion
      incidentes={paginated}
      filters={filters}
      onFilterChange={handleFilterChange}
      currentPage={currentPage}
      totalPages={totalPages}
      total={filtered.length}
      onPageChange={setCurrentPage}
      selectedId={selectedId}
      onSelectId={setSelectedId}
    />
  );
}

// ── Subcomponente compartido: tabla + paginación ──
function FilasYPaginacion({ incidentes, filters, onFilterChange, currentPage, totalPages, total, onPageChange, selectedId, onSelectId }: {
  incidentes: Incidente[];
  filters: FiltrosState;
  onFilterChange: (f: FiltrosState) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}) {
  const selectedIncidente = incidentes.find(i => i.id_reporte === selectedId) || null;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <FiltrosIncidentes filters={filters} onFilterChange={onFilterChange} />
        <div className="text-sm text-muted-foreground">
          Mostrando {incidentes.length} de {total} incidentes
        </div>
      </div>

      {incidentes.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">No se encontraron incidentes</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border rounded-lg min-w-[700px] lg:min-w-[800px]">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="min-w-[120px] lg:min-w-[150px]">Motivo</TableHead>
                <TableHead className="min-w-[150px] lg:min-w-[200px]">Descripción</TableHead>
                <TableHead className="text-center min-w-[100px] lg:min-w-[120px]">Fecha reporte</TableHead>
                <TableHead className="text-center min-w-[80px] lg:min-w-[100px]">Estado</TableHead>
                <TableHead className="text-center min-w-[80px] lg:min-w-[100px]">Prioridad</TableHead>
                <TableHead className="text-center min-w-[60px] lg:min-w-[80px]">Anónimo</TableHead>
                <TableHead className="text-center min-w-[50px] lg:min-w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidentes.map((incidente) => {
                const fechaReporte = formatFecha(incidente.createdAt);
                return (
                  <TableRow key={incidente.id_reporte} className="py-8">
                    <TableCell className="font-medium">{incidente.motivo}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <span className="text-sm line-clamp-2">{incidente.descripcion}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{fechaReporte.fecha}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{fechaReporte.hora}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getEstadoColor(incidente.estado)}>
                        {estadoLabel[incidente.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {incidente.prioridad ? (
                        <Badge className={getPrioridadColor(incidente.prioridad)}>
                          {incidente.prioridad.charAt(0).toUpperCase() + incidente.prioridad.slice(1).toLowerCase()}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {incidente.es_anonimo ? (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Sí</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectId(incidente.id_reporte)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Controles de paginación debajo de la tabla, alineados a la derecha */}
      <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      <ModalDetalleIncidente
        incidente={selectedIncidente}
        open={!!selectedId}
        onOpenChange={(open) => !open && onSelectId(null)}
      />
    </div>
  );
}

// ── Componente principal ──
export function TablaEstadoIncidentes({ data }: TablaEstadoIncidentesProps) {
  const [filters, setFilters] = useState<FiltrosState>({
    estado: 'Todos',
    busqueda: '',
    fechaDesde: undefined,
    fechaHasta: undefined,
    ordenarPor: 'reciente',
  });

  return <TablaLocal data={data} filters={filters} onFilterChange={setFilters} />;
}