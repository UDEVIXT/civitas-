"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import apiClient from "@/api/axios";
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
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "BLOQUEADO", label: "Bloqueado" },
];

const tipos = [
  { value: "TODOS", label: "Todos los tipos" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "CHOFER", label: "Chofer" },
  { value: "CUIDADOR", label: "Cuidador" },
  { value: "JARDINERO", label: "Jardinero" },
  { value: "COCINERO", label: "Cocinero" },
  { value: "OTRO", label: "Otro" },
];

interface ViviendaItem {
  id_vivienda: string;
  numero_vivienda: string;
}

export interface FiltrosEmpleadosValues {
  busqueda?: string;
  estado?: string;
  tipo?: string;
  idVivienda?: string;
}

interface FiltrosEmpleadosProps {
  filters: FiltrosEmpleadosValues;
  onFilterChange: (filters: FiltrosEmpleadosValues) => void;
}

export function FiltrosEmpleados({ filters, onFilterChange }: FiltrosEmpleadosProps) {
  const [viviendas, setViviendas] = useState<ViviendaItem[]>([]);

  useEffect(() => {
    apiClient
      .get<{ data: ViviendaItem[] }>("/vivienda")
      .then((res) => setViviendas(res.data.data ?? []))
      .catch(() => setViviendas([]));
  }, []);

  const hayFiltrosActivos =
    !!filters.busqueda ||
    (!!filters.estado && filters.estado !== "TODOS") ||
    (!!filters.tipo && filters.tipo !== "TODOS") ||
    !!filters.idVivienda;

  const handleBusquedaChange = (value: string) => {
    onFilterChange({ ...filters, busqueda: value });
  };

  const handleEstadoChange = (value: string) => {
    onFilterChange({ ...filters, estado: value === "TODOS" ? undefined : value });
  };

  const handleTipoChange = (value: string) => {
    onFilterChange({ ...filters, tipo: value === "TODOS" ? undefined : value });
  };

  const handleViviendaChange = (value: string) => {
    onFilterChange({ ...filters, idVivienda: value === "TODAS" ? undefined : value });
  };

  const handleLimpiar = () => {
    onFilterChange({ busqueda: "", estado: undefined, tipo: undefined, idVivienda: undefined });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por nombre del empleado..."
          value={filters.busqueda || ""}
          onChange={(e) => handleBusquedaChange(e.target.value)}
          className="flex h-9 w-full md:w-72 rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.idVivienda || "TODAS"} onValueChange={handleViviendaChange}>
          <SelectTrigger className="w-[calc(50%-4px)] md:w-44 h-9">
            <SelectValue placeholder="Propiedad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas las propiedades</SelectItem>
            {viviendas.map((v) => (
              <SelectItem key={v.id_vivienda} value={v.id_vivienda}>
                {v.numero_vivienda}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.estado || "TODOS"} onValueChange={handleEstadoChange}>
          <SelectTrigger className="w-[calc(50%-4px)] md:w-44 h-9">
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

        <Select value={filters.tipo || "TODOS"} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-[calc(50%-4px)] md:w-44 h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipos.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hayFiltrosActivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimpiar}
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
