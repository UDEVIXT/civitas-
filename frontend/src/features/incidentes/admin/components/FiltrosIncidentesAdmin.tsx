"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const estados = [
  { value: "TODOS", label: "Todos los estados" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "RESUELTA", label: "Resuelta" },
  { value: "CANCELADA", label: "Cancelada" },
];

const prioridades = [
  { value: "TODAS", label: "Todas las prioridades" },
  { value: "CRITICA", label: "Crítica" },
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Media" },
  { value: "BAJA", label: "Baja" },
];

export interface FiltrosAdmin {
  busqueda?: string;
  estado?: string;
  prioridad?: string;
}

interface FiltrosIncidentesAdminProps {
  filters: FiltrosAdmin;
  onFilterChange: (filters: FiltrosAdmin) => void;
}

export function FiltrosIncidentesAdmin({ filters, onFilterChange }: FiltrosIncidentesAdminProps) {
  const hayFiltrosActivos =
    !!filters.busqueda ||
    (!!filters.estado && filters.estado !== "TODOS") ||
    (!!filters.prioridad && filters.prioridad !== "TODAS");

  const handleBusquedaChange = (value: string) => {
    onFilterChange({ ...filters, busqueda: value });
  };

  const handleEstadoChange = (value: string) => {
    onFilterChange({ ...filters, estado: value === "TODOS" ? undefined : value });
  };

  const handlePrioridadChange = (value: string) => {
    onFilterChange({ ...filters, prioridad: value === "TODAS" ? undefined : value });
  };

  const handleLimpiarFiltros = () => {
    onFilterChange({ busqueda: "", estado: undefined, prioridad: undefined });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por título, residente o ubicación..."
          value={filters.busqueda || ""}
          onChange={(e) => handleBusquedaChange(e.target.value)}
          className="flex h-9 w-full md:w-72 rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Select
        value={filters.estado || "TODOS"}
        onValueChange={handleEstadoChange}
      >
        <SelectTrigger className="w-full md:w-44 h-9">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {estados.map((e) => (
            <SelectItem key={e.value} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.prioridad || "TODAS"}
        onValueChange={handlePrioridadChange}
      >
        <SelectTrigger className="w-full md:w-44 h-9">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          {prioridades.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hayFiltrosActivos && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLimpiarFiltros}
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
