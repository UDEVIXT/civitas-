"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, ArrowUpDown, CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const estados = [
  { value: "Todos", label: "Todos los estados" },
  { value: "Pendiente", label: "Pendiente" },
  { value: "En proceso", label: "En proceso" },
  { value: "Resuelto", label: "Resuelto" },
];

const ordenamientos = [
  { value: "reciente", label: "Más reciente" },
  { value: "antiguo", label: "Más antiguo" },
];

interface FiltrosIncidentesProps {
  filters: {
    estado?: 'Pendiente' | 'En proceso' | 'Resuelto' | 'Todos';
    busqueda?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    ordenarPor?: 'reciente' | 'antiguo';
  };
  onFilterChange: (filters: {
    estado?: 'Pendiente' | 'En proceso' | 'Resuelto' | 'Todos';
    busqueda?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    ordenarPor?: 'reciente' | 'antiguo';
  }) => void;
}

function DatePickerWithRange({ filters, onFiltersChange }: { 
  filters: FiltrosIncidentesProps['filters']; 
  onFiltersChange: FiltrosIncidentesProps['onFilterChange']; 
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (filters.fechaDesde || filters.fechaHasta) {
      return {
        from: filters.fechaDesde ? new Date(filters.fechaDesde) : undefined,
        to: filters.fechaHasta ? new Date(filters.fechaHasta) : undefined,
      };
    }
    return undefined;
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onFiltersChange({
      ...filters,
      fechaDesde: newDate?.from ? newDate.from.toISOString().split('T')[0] : undefined,
      fechaHasta: newDate?.to ? newDate.to.toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start px-3 h-9 font-normal w-70"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                {format(date.to, "dd/MM/yyyy", { locale: es })}
              </>
            ) : (
              format(date.from, "dd/MM/yyyy", { locale: es })
            )
          ) : (
            <span>Seleccionar rango de fechas</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleDateChange}
          numberOfMonths={2}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}

export function FiltrosIncidentes({ filters, onFilterChange }: FiltrosIncidentesProps) {
  const handleEstadoChange = (value: string) => {
    onFilterChange({ 
      estado: value === 'Todos' ? undefined : value as any,
      busqueda: filters.busqueda,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
      ordenarPor: filters.ordenarPor
    });
  };

  const handleBusquedaChange = (value: string) => {
    onFilterChange({ 
      estado: filters.estado,
      busqueda: value,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
      ordenarPor: filters.ordenarPor
    });
  };

  const handleFechaRangeChange = (fechaDesde: string, fechaHasta: string) => {
    onFilterChange({ 
      estado: filters.estado,
      busqueda: filters.busqueda,
      fechaDesde,
      fechaHasta,
      ordenarPor: filters.ordenarPor
    });
  };

  const handleOrdenarPorChange = (value: string) => {
    onFilterChange({ 
      estado: filters.estado,
      busqueda: filters.busqueda,
      fechaDesde: filters.fechaDesde,
      fechaHasta: filters.fechaHasta,
      ordenarPor: value as any
    });
  };

  const handleLimpiarFiltros = () => {
    onFilterChange({ 
      estado: 'Todos',
      busqueda: '',
      fechaDesde: undefined,
      fechaHasta: undefined,
      ordenarPor: 'reciente'
    });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar incidente..."
            value={filters.busqueda || ''}
            onChange={(e) => handleBusquedaChange(e.target.value)}
            className="flex h-9 w-60 rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Select value={filters.estado || 'Todos'} onValueChange={handleEstadoChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((estado) => (
              <SelectItem key={estado.value} value={estado.value}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DatePickerWithRange 
          filters={filters} 
          onFiltersChange={onFilterChange} 
        />

        <Select value={filters.ordenarPor || 'reciente'} onValueChange={handleOrdenarPorChange}>
          <SelectTrigger className="w-36 h-9">
            <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {ordenamientos.map((orden) => (
              <SelectItem key={orden.value} value={orden.value}>
                {orden.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button 
          onClick={handleLimpiarFiltros}
          className="h-9 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
