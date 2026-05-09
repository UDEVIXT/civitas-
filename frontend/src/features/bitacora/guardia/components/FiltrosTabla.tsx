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

// tipos, residencias y ordenamientos se definen dentro del componente

type Filters = {
  search?: string;
  tipo?: string;
  residencia?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  ordenar?: string;
  page?: string;
  limit?: string;
};

export function FiltrosTabla({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}) {
  const [localDate, setLocalDate] = React.useState<any>(null);

  const tipos = [
    { value: "todos", label: "Todos los tipos" },
    { value: "visitante", label: "Visitante" },
    { value: "residente", label: "Residente" },
    { value: "empleado_domestico", label: "Empleado doméstico" },
    { value: "proveedor", label: "Proveedor" },
  ];

  const residencias = [
    { value: "todas", label: "Todas las residencias" },
    { value: "Apartamento 101", label: "Apartamento 101" },
    { value: "Apartamento 205", label: "Apartamento 205" },
    { value: "Apartamento 305", label: "Apartamento 305" },
    { value: "Administración", label: "Administración" },
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
        <Select value={filters.tipo || "todos"} onValueChange={(v) => onChange({ tipo: v })}>
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
        <Select value={filters.residencia || "todas"} onValueChange={(v) => onChange({ residencia: v })}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Residencia" />
          </SelectTrigger>
          <SelectContent>
            {residencias.map((res) => (
              <SelectItem key={res.value} value={res.value}>
                {res.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* CA003 - Filtro por rango de fechas */}
        <DatePickerWithRange
          onChangeDate={(from, to) => {
            setLocalDate({ from, to });
            onChange({ fecha_inicio: from ? from.toISOString().split("T")[0] : undefined, fecha_fin: to ? to.toISOString().split("T")[0] : undefined });
          }}
        />

        {/* CA006 - Ordenar por fecha */}
        <Select value={filters.ordenar || "reciente"} onValueChange={(v) => onChange({ ordenar: v })}>
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

        {/* Botón limpiar filtros */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => onChange({ search: "", tipo: "todos", residencia: "todas", fecha_inicio: undefined, fecha_fin: undefined })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DatePickerWithRange({ onChangeDate }: { onChangeDate: (from: Date | null, to: Date | null) => void }) {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);

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
            setDate(d);
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
