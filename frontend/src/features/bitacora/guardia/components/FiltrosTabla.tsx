"use client";

import * as React from "react";
import { format } from "date-fns";
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
  const dateRange = React.useMemo(() => {
    if (!filters.fecha_inicio) return undefined;
    return {
      from: new Date(`${filters.fecha_inicio}T12:00:00`),
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

  const [searchValue, setSearchValue] = React.useState(filters.search || "");
  const [residenciaValue, setResidenciaValue] = React.useState(filters.residencia || "");

  React.useEffect(() => { setSearchValue(filters.search || ""); }, [filters.search]);
  React.useEffect(() => { setResidenciaValue(filters.residencia || ""); }, [filters.residencia]);

  React.useEffect(() => {
    const timer = setTimeout(() => onChange({ search: searchValue.trim() }), 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  React.useEffect(() => {
    const timer = setTimeout(() => onChange({ residencia: residenciaValue.trim() }), 500);
    return () => clearTimeout(timer);
  }, [residenciaValue]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Fila 1 — búsquedas + salida masiva + limpiar */}
      <div className="flex flex-col lg:flex-row gap-3">

        {/* Búsquedas: apiladas en móvil, lado a lado en sm+ */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por residencia..."
              value={residenciaValue}
              onChange={(e) => setResidenciaValue(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Selects + fecha + acciones */}
        <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center">
          <Select
            value={filters.tipo || "todos"}
            onValueChange={(v) => onChange({ tipo: v as BitacoraFiltro["tipo"] })}
          >
            <SelectTrigger className="h-9 w-full sm:w-[160px]">
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

          <DatePickerWithRange
            date={dateRange}
            onChangeDate={(from, to) => {
              onChange({
                fecha_inicio: from ? format(from, "yyyy-MM-dd") : undefined,
                fecha_fin: to ? format(to, "yyyy-MM-dd") : undefined,
              });
            }}
          />

          <Select
            value={filters.ordenar || "reciente"}
            onValueChange={(v) => onChange({ ordenar: v as BitacoraFiltro["ordenar"] })}
          >
            <SelectTrigger className="h-9 w-full sm:w-[190px]">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
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

          {/* Salida masiva + limpiar juntos */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="destructive"
              disabled={selectedIds.length === 0}
              onClick={onMassExitClick}
              className="h-9 flex-1 sm:flex-none whitespace-nowrap cursor-pointer"
            >
              <span className="hidden sm:inline">Salida Masiva</span>
              <span className="sm:hidden">Salida</span>
              <span className="ml-1">({selectedIds.length})</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 cursor-pointer"
              onClick={onClear}
              title="Borrar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
          className={`cursor-pointer justify-start px-3 h-9 font-normal w-full sm:w-[220px] ${!date ? "text-muted-foreground" : ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yy", { locale: es })} -{" "}
                  {format(date.to, "dd/MM/yy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              "Seleccionar fechas"
            )}
          </span>
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
          className="hidden sm:block"
        />
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(d) => {
            const from = (d as any)?.from ?? null;
            const to = (d as any)?.to ?? null;
            onChangeDate(from, to);
          }}
          numberOfMonths={1}
          locale={es}
          className="sm:hidden"
        />
      </PopoverContent>
    </Popover>
  );
}