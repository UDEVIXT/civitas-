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
import { Clock, Calendar, MapPin, Image, User, CheckSquare } from "lucide-react";

import { Incidente, EstadoIncidencia, PrioridadIncidencia } from "@/features/incidentes/residentes/api/incidencias";
import { ModalAsignarPrioridad } from "./ModalAsignarPrioridad";

interface TablaIncidentesAdminProps {
  data?: Incidente[];
}

interface FiltrosState {
  estado?: 'Pendiente' | 'En proceso' | 'Resuelto' | 'Todos';
  prioridad?: 'Baja' | 'Media' | 'Alta' | 'Crítica' | 'Todos';
  busqueda?: string;
  ordenarPor?: 'reciente' | 'antiguo' | 'prioridad';
}

const estadoLabel: Record<EstadoIncidencia, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  RESUELTA: "Resuelta",
  CANCELADA: "Cancelada",
};

const prioridadLabel: Record<PrioridadIncidencia, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const estadoFiltroToBackend: Record<string, EstadoIncidencia | undefined> = {
  Pendiente: "PENDIENTE",
  "En proceso": "EN_PROCESO",
  Resuelto: "RESUELTA",
  Todos: undefined,
};

const prioridadFiltroToBackend: Record<string, PrioridadIncidencia | undefined> = {
  Baja: "BAJA",
  Media: "MEDIA",
  Alta: "ALTA",
  Crítica: "CRITICA",
  Todos: undefined,
};

const getPrioridadColor = (prioridad: PrioridadIncidencia) => {
  const colors: Record<PrioridadIncidencia, string> = {
    BAJA: "bg-green-100 text-green-800 hover:bg-green-100",
    MEDIA: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    ALTA: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    CRITICA: "bg-red-100 text-red-800 hover:bg-red-100",
  };
  return colors[prioridad] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
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

const prioridadOrder: Record<PrioridadIncidencia, number> = {
  CRITICA: 4,
  ALTA: 3,
  MEDIA: 2,
  BAJA: 1,
};

const PAGE_SIZE = 6;

export function TablaIncidentesAdmin({ data }: TablaIncidentesAdminProps) {
  const [filters, setFilters] = useState<FiltrosState>({
    estado: 'Todos',
    prioridad: 'Todos',
    busqueda: '',
    ordenarPor: 'reciente',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = data || [];

    if (filters.estado && filters.estado !== 'Todos') {
      const estadoBackend = estadoFiltroToBackend[filters.estado];
      if (estadoBackend) result = result.filter(i => i.estado === estadoBackend);
    }

    if (filters.prioridad && filters.prioridad !== 'Todos') {
      const prioridadBackend = prioridadFiltroToBackend[filters.prioridad];
      if (prioridadBackend) result = result.filter(i => i.prioridad === prioridadBackend);
    }

    if (filters.busqueda) {
      result = result.filter(i =>
        i.titulo.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        i.descripcion.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        (i.nombre_residente && i.nombre_residente.toLowerCase().includes(filters.busqueda!.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      if (filters.ordenarPor === 'prioridad') {
        const pa = a.prioridad ? prioridadOrder[a.prioridad] : 0;
        const pb = b.prioridad ? prioridadOrder[b.prioridad] : 0;
        return pb - pa;
      }
      const fa = new Date(a.fecha_creacion).getTime();
      const fb = new Date(b.fecha_creacion).getTime();
      return filters.ordenarPor === 'reciente' ? fb - fa : fa - fb;
    });

    return result;
  }, [data, filters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (newFilters: FiltrosState) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginated.map(i => i.id_incidencia)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAsignarPrioridad = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setModalOpen(true);
  };

  const handleAsignarPrioridadLote = () => {
    if (selectedIds.size > 0) {
      setSelectedIncidente(null);
      setModalOpen(true);
    }
  };

  const handlePrioridadAsignada = (prioridad: PrioridadIncidencia) => {
    setModalOpen(false);
    setSelectedIncidente(null);
    // Aquí se llamaría a la API para actualizar la prioridad
  };

  const allSelected = paginated.length > 0 && paginated.every(i => selectedIds.has(i.id_incidencia));
  const someSelected = selectedIds.size > 0;

  return (
    <div className="space-y-4 mt-4">
      {/* Filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row lg:flex-row items-start md:items-center lg:items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full md:w-auto lg:w-auto">
            <input
              type="search"
              placeholder="Buscar incidente..."
              value={filters.busqueda || ''}
              onChange={(e) => handleFilterChange({ ...filters, busqueda: e.target.value })}
              className="flex h-9 w-full md:w-60 lg:w-60 rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <select
            value={filters.estado || 'Todos'}
            onChange={(e) => handleFilterChange({ ...filters, estado: e.target.value as any })}
            className="h-9 w-full md:w-36 lg:w-36 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Resuelto">Resuelto</option>
          </select>

          <select
            value={filters.prioridad || 'Todos'}
            onChange={(e) => handleFilterChange({ ...filters, prioridad: e.target.value as any })}
            className="h-9 w-full md:w-36 lg:w-36 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Todos">Todas las prioridades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>

          <select
            value={filters.ordenarPor || 'reciente'}
            onChange={(e) => handleFilterChange({ ...filters, ordenarPor: e.target.value as any })}
            className="h-9 w-full md:w-36 lg:w-36 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
            <option value="prioridad">Por prioridad</option>
          </select>

          <button
            onClick={() => handleFilterChange({ estado: 'Todos', prioridad: 'Todos', busqueda: '', ordenarPor: 'reciente' })}
            className="h-9 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 w-full md:w-auto lg:w-auto"
          >
            Limpiar Filtros
          </button>
        </div>

        {someSelected && (
          <Button
            onClick={handleAsignarPrioridadLote}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Asignar Prioridad ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {paginated.length} de {filtered.length} incidentes
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">No se encontraron incidentes</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="border rounded-lg min-w-[900px] lg:min-w-[1000px]">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead className="min-w-[120px] lg:min-w-[150px]">Título</TableHead>
                <TableHead className="min-w-[150px] lg:min-w-[200px]">Descripción</TableHead>
                <TableHead className="min-w-[100px] lg:min-w-[120px]">Residente</TableHead>
                <TableHead className="text-center min-w-[100px] lg:min-w-[120px]">Fecha reporte</TableHead>
                <TableHead className="text-center min-w-[80px] lg:min-w-[100px]">Estado</TableHead>
                <TableHead className="text-center min-w-[80px] lg:min-w-[100px]">Prioridad</TableHead>
                <TableHead className="min-w-[100px] lg:min-w-[120px]">Ubicación</TableHead>
                <TableHead className="text-center min-w-[60px] lg:min-w-[80px]">Fotos</TableHead>
                <TableHead className="text-center min-w-[100px] lg:min-w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((incidente) => {
                const fechaReporte = formatFecha(incidente.fecha_creacion);
                return (
                  <TableRow key={incidente.id_incidencia} className="py-8">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(incidente.id_incidencia)}
                        onChange={(e) => handleSelectOne(incidente.id_incidencia, e.target.checked)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{incidente.titulo}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <span className="text-sm">{incidente.descripcion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">
                          {incidente.es_anonimo ? "Reporte anónimo" : incidente.nombre_residente || "—"}
                        </span>
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
                          {prioridadLabel[incidente.prioridad]}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAsignarPrioridad(incidente)}
                        >
                          Asignar
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {incidente.ubicacion ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{incidente.ubicacion}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {incidente.fotos && incidente.fotos.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <Image className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{incidente.fotos.length}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAsignarPrioridad(incidente)}
                      >
                        Asignar Prioridad
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de asignar prioridad */}
      <ModalAsignarPrioridad
        incidente={selectedIncidente}
        selectedIds={selectedIds}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onPrioridadAsignada={handlePrioridadAsignada}
      />
    </div>
  );
}
