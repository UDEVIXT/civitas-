"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, CalendarIcon, ArrowUpDown, X } from "lucide-react";
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
import { BitacoraFiltro } from "../api/bitacora";

export function FiltrosTabla({
  filters,
  onChange,
  onClear,
  selectedIds,
  onMassExitClick,
}: {
  filters: BitacoraFiltro;
  onChange: (f: Partial<BitacoraFiltro>) => void;
  onClear: () => void;
  selectedIds: string[];
  onMassExitClick: () => void;
}) {
  // Convertimos las fechas del filtro en un objeto DateRange controlable
  const dateRange = React.useMemo(() => {
    if (!filters.fecha_inicio) return undefined;
    return {
      from: new Date(`${filters.fecha_inicio}T12:00:00`), // Evitamos desfase de huso horario
      to: filters.fecha_fin ? new Date(`${filters.fecha_fin}T12:00:00`) : undefined,
    };
  }, [filters.fecha_inicio, filters.fecha_fin]);
  
  const tipos = [
    { value: "todos", label: "Todos los tipos" },
    { value: "visitante", label: "Visitante" },
    { value: "residente", label: "Residente" },
    { value: "empleado_domestico", label: "Empleado doméstico" },
    { value: "proveedor", label: "Proveedor" },
  ];

  const ordenamientos = [
    { value: "reciente", label: "Más reciente primero" },
    { value: "antiguo", label: "Más antiguo primero" },
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* CA005 - Buscador por nombre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nombre..."
            value={filters.search || ""}
            onChange={(e) => onChange({ search: e.target.value })}
            className="flex h-9 w-[240px] rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* CA004 - Filtro por tipo */}
        <Select
          value={filters.tipo || "todos"}
          onValueChange={(v) => onChange({ tipo: v as BitacoraFiltro["tipo"] })}
        >
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

        {/* CA004 - Filtro por residencia */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por residencia..."
            value={filters.residencia || ""}
            onChange={(e) => onChange({ residencia: e.target.value })}
            className="flex h-9 w-[200px] rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* CA003 - Filtro por rango de fechas */}
        <DatePickerWithRange
          date={dateRange}
          onChangeDate={(from, to) => {
            onChange({
              fecha_inicio: from ? format(from, "yyyy-MM-dd") : undefined,
              fecha_fin: to ? format(to, "yyyy-MM-dd") : undefined,
            });
          }}
        />

        {/* CA006 - Ordenar por fecha */}
        <Select
          value={filters.ordenar || "reciente"}
          onValueChange={(v) =>
            onChange({ ordenar: v as BitacoraFiltro["ordenar"] })
          }
        >
          <SelectTrigger className="w-[180px] h-9">
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

        <Button
          variant="destructive"
          disabled={selectedIds.length === 0}
          onClick={onMassExitClick}
        >
          Salida Masiva ({selectedIds.length})
        </Button>

        {/* Botón limpiar filtros */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DatePickerWithRange({
  date,
  onChangeDate,
}: {
  date?: DateRange;
  onChangeDate: (from: Date | null, to: Date | null) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start px-3 h-9 font-normal w-[280px]"
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
            <span>Seleccionar fechas</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(d) => {
            const from = (d as any)?.from ?? null;
            const to = (d as any)?.to ?? null;
            onChangeDate(from, to);
          }}
          numberOfMonths={2}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}
