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

const tipos = [
  { value: "todos", label: "Todos los tipos" },
  { value: "visitante", label: "Visitante" },
  { value: "residente", label: "Residente" },
  { value: "empleado doméstico", label: "Empleado doméstico" },
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

export function FiltrosTabla() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* CA005 - Buscador por nombre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nombre..."
            className="flex h-9 w-[240px] rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* CA004 - Filtro por tipo */}
        <Select defaultValue="todos">
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
        <Select defaultValue="todas">
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
        <DatePickerWithRange />

        {/* CA006 - Ordenar por fecha */}
        <Select defaultValue="reciente">
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
        <Button variant="outline" size="icon" className="h-9 w-9">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DatePickerWithRange() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 20),
    to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
  });

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
          onSelect={setDate}
          numberOfMonths={2}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}
