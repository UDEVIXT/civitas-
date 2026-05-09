"use client";

import * as React from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FiltrosTablaAdminProps {
  onSearchProperty: (propertyId: string) => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: 'desc' | 'asc') => void;
  onClearFilters: () => void;
}

const tipos = [
  { value: "todos", label: "Todos los tipos" },
  { value: "visitante", label: "Visitante" },
  { value: "residente", label: "Residente" },
  { value: "empleado doméstico", label: "Empleado doméstico" },
  { value: "proveedor", label: "Proveedor" },
];

const ordenamientos = [
  { value: "desc", label: "Más reciente primero" },
  { value: "asc", label: "Más antiguo primero" },
];

export function FiltrosTablaAdmin({ onSearchProperty, onTypeChange, onSortChange, onClearFilters }: FiltrosTablaAdminProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por propiedad (ej. 101)..."
            onChange={(e) => onSearchProperty(e.target.value)}
            className="flex h-9 w-[240px] rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select defaultValue="todos" onValueChange={onTypeChange}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {tipos.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="desc" onValueChange={(val: 'desc' | 'asc') => onSortChange(val)}>
          <SelectTrigger className="w-[200px] h-9">
            <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {ordenamientos.map((ord) => (
              <SelectItem key={ord.value} value={ord.value}>
                {ord.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}