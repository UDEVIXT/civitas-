"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, ArrowUpDown, X, CalendarIcon } from "lucide-react";
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

interface FiltrosTablaAdminProps {
  onSearchProperty: (propertyId: string) => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: 'desc' | 'asc') => void;
  onDateChange: (inicio: string, fin: string) => void;
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

export function FiltrosTablaAdmin({ onSearchProperty, onTypeChange, onSortChange, onDateChange, onClearFilters }: FiltrosTablaAdminProps) {
  // Convertimos los filtros a un estado controlado para poder limpiarlos visualmente
  const [searchValue, setSearchValue] = React.useState("");
  const [typeValue, setTypeValue] = React.useState("todos");
  const [sortValue, setSortValue] = React.useState<'desc' | 'asc'>("desc");
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);

  const handleClear = () => {
    setSearchValue("");
    setTypeValue("todos");
    setSortValue("desc");
    setDate(undefined);
    onClearFilters(); // Notificamos a la página padre
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por propiedad (ej. 101)..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearchProperty(e.target.value);
            }}
            className="flex h-9 w-[240px] rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={typeValue} onValueChange={(val) => { setTypeValue(val); onTypeChange(val); }}>
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

        {/* Selector Rango de Fechas (CA003) estilo Guardia */}
        <DatePickerWithRange
          date={date}
          setDate={(newDate) => {
            setDate(newDate);
            const from = newDate?.from ? format(newDate.from, "yyyy-MM-dd") : "";
            const to = newDate?.to ? format(newDate.to, "yyyy-MM-dd") : "";
            onDateChange(from, to);
          }}
        />

        <Select value={sortValue} onValueChange={(val: 'desc' | 'asc') => { setSortValue(val); onSortChange(val); }}>
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

        {/* Botón limpiar filtros */}
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleClear} title="Limpiar filtros">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function DatePickerWithRange({
  date,
  setDate,
}: {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start px-3 h-9 font-normal w-[280px] ${!date ? "text-muted-foreground" : ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
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