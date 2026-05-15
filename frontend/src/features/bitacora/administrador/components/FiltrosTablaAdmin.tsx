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
  onSearchName: (name: string) => void;
  onSearchProperty: (propertyId: string) => void;
  onTypeChange: (type: string) => void;
  onSortChange: (sort: "desc" | "asc") => void;
  onDateChange: (inicio: string, fin: string) => void;
  onClearFilters: () => void;
}

const tipos = [
  { value: "todos", label: "Todos los tipos" },
  { value: "visitante", label: "Visitante" },
  { value: "residente", label: "Residente" },
  { value: "empleado_domestico", label: "Empleado doméstico" },
  { value: "proveedor", label: "Proveedor" },
];

const ordenamientos = [
  { value: "desc", label: "Más reciente primero" },
  { value: "asc", label: "Más antiguo primero" },
];

export function FiltrosTablaAdmin({
  onSearchName,
  onSearchProperty,
  onTypeChange,
  onSortChange,
  onDateChange,
  onClearFilters,
}: FiltrosTablaAdminProps) {
  const [searchNameValue, setSearchNameValue] = React.useState("");
  const [searchPropertyValue, setSearchPropertyValue] = React.useState("");
  const [typeValue, setTypeValue] = React.useState("todos");
  const [sortValue, setSortValue] = React.useState<"desc" | "asc">("desc");
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    const timer = setTimeout(() => onSearchName(searchNameValue.trim()), 500);
    return () => clearTimeout(timer);
  }, [searchNameValue]);

  React.useEffect(() => {
    const timer = setTimeout(() => onSearchProperty(searchPropertyValue.trim()), 500);
    return () => clearTimeout(timer);
  }, [searchPropertyValue]);

  const handleClear = () => {
    setSearchNameValue("");
    setSearchPropertyValue("");
    setTypeValue("todos");
    setSortValue("desc");
    setDate(undefined);
    onClearFilters();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Búsquedas de texto */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por nombre..."
            value={searchNameValue}
            onChange={(e) => setSearchNameValue(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por propiedad..."
            value={searchPropertyValue}
            onChange={(e) => setSearchPropertyValue(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Selects + fecha + limpiar */}
      <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center">
        <Select
          value={typeValue}
          onValueChange={(val) => { setTypeValue(val); onTypeChange(val); }}
        >
          <SelectTrigger className="h-9 w-full sm:w-[180px] lg:w-[160px]">
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
          date={date}
          setDate={(newDate) => {
            setDate(newDate);
            const from = newDate?.from
              ? format(newDate.from, "yyyy-MM-dd'T00:00:00-06:00'")
              : "";
            const to = newDate?.to
              ? format(newDate.to, "yyyy-MM-dd'T23:59:59-06:00'")
              : "";
            onDateChange(from, to);
          }}
        />

        <Select
          value={sortValue}
          onValueChange={(val: "desc" | "asc") => { setSortValue(val); onSortChange(val); }}
        >
          <SelectTrigger className="h-9 w-full sm:w-[200px] lg:w-[190px]">
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
          variant="outline"
          className="h-9 px-3 ml-auto lg:ml-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline text-sm">Borrar filtros</span>
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
          className={`justify-start px-3 h-9 font-normal w-full sm:w-[240px] lg:w-[220px] ${
            !date ? "text-muted-foreground" : ""
          }`}
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
        {/* En móvil: 1 mes; en sm+: 2 meses */}
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
          locale={es}
          className="hidden sm:block"
        />
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
          locale={es}
          className="sm:hidden"
        />
      </PopoverContent>
    </Popover>
  );
}