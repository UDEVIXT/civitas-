import {
  Search,
  SlidersHorizontal,
  Users,
  UserCheck,
  UserMinus,
  Home,
  User,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxValue,
} from "@/components/ui/combobox";

import type { ResidenteData, ViviendaData } from "../types";

type EmpleadosFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: boolean | undefined;
  onStatusChange: (value: boolean | undefined) => void;
  residentes: ResidenteData[];
  residenciaId: string;
  onResidenciaChange: (residenciaId: string) => void;
  viviendas: ViviendaData[];
  viviendaId: string;
  onViviendaChange: (viviendaId: string) => void;
};

export function EmpleadosFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  residentes,
  residenciaId,
  onResidenciaChange,
  viviendas,
  viviendaId,
  onViviendaChange,
}: EmpleadosFiltersProps) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Empleados Domésticos
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          key="Todos"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onStatusChange(undefined)}
          className={cn(
            "h-8 rounded-full px-4 transition-all",
            statusFilter === undefined
              ? "border-primary bg-primary/10 font-medium text-primary shadow-sm"
              : "hover:bg-muted",
          )}
        >
          <Users className="mr-2 size-3.5" />
          Todos
        </Button>
        <Button
          key="Activos"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onStatusChange(true)}
          className={cn(
            "h-8 rounded-full px-4 transition-all",
            statusFilter === true
              ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-700 shadow-sm dark:bg-emerald-950/30 dark:text-emerald-400"
              : "hover:bg-muted",
          )}
        >
          <UserCheck className="mr-2 size-3.5" />
          Activos
        </Button>
        <Button
          key="Inactivos"
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onStatusChange(false)}
          className={cn(
            "h-8 rounded-full px-4 transition-all",
            statusFilter === false
              ? "border-rose-500 bg-rose-50 font-medium text-rose-700 shadow-sm dark:bg-rose-950/30 dark:text-rose-400"
              : "hover:bg-muted",
          )}
        >
          <UserMinus className="mr-2 size-3.5" />
          Inactivos
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nombre o identificación..."
              className="h-10 border-muted-foreground/20 pl-9 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 rounded-full",
                  (residenciaId || viviendaId) &&
                    "border-primary bg-primary/5 text-primary shadow-sm justify-center",
                )}
              >
                <Filter className="size-3.5" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 shadow-xl" align="end">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b pb-2">
                  <p className="font-semibold tracking-tight text-foreground">
                    Filtros adicionales
                  </p>
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                </div>

                {/* Filtro por residente */}
                <div className="space-y-2">
                  <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <User className="mr-2 size-3" />
                    Residente Titular
                  </label>
                  <Combobox
                    value={residenciaId}
                    onValueChange={(val) => onResidenciaChange(val || "")}
                  >
                    <ComboboxInput
                      placeholder="Buscar residente..."
                      className="h-9"
                    >
                      <ComboboxValue>
                        {(value) => {
                          const residente = residentes.find(
                            (r) => r.id_residente === value,
                          );
                          return (
                            residente?.usuario?.persona?.nombre ||
                            "Seleccionar residente"
                          );
                        }}
                      </ComboboxValue>
                    </ComboboxInput>
                    <ComboboxContent>
                      <ComboboxList>
                        {residentes.map((r) => (
                          <ComboboxItem
                            key={`residente-${r.id_residente}`}
                            value={r.id_residente}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {r.usuario?.persona?.nombre}
                              </span>
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                      <ComboboxEmpty>
                        No se encontraron resultados
                      </ComboboxEmpty>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro por vivienda */}
                <div className="space-y-2">
                  <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Home className="mr-2 size-3" />
                    Vivienda / Unidad
                  </label>
                  <Combobox
                    value={viviendaId}
                    onValueChange={(val) => onViviendaChange(val || "")}
                  >
                    <ComboboxInput
                      placeholder="Seleccionar vivienda"
                      className="h-9"
                    >
                      <ComboboxValue>
                        {(value) => {
                          const vivienda = viviendas.find(
                            (v) => v.id_vivienda === value,
                          );
                          return vivienda
                            ? `Vivienda ${vivienda.numero_vivienda}`
                            : "Seleccionar vivienda";
                        }}
                      </ComboboxValue>
                    </ComboboxInput>
                    <ComboboxContent>
                      <ComboboxList>
                        {viviendas.map((v) => (
                          <ComboboxItem
                            key={`vivienda-${v.id_vivienda}`}
                            value={v.id_vivienda}
                          >
                            <div className="flex items-center gap-2">
                              <Home className="size-3.5 text-muted-foreground" />
                              <span>Vivienda {v.numero_vivienda}</span>
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                      <ComboboxEmpty>
                        No se encontraron resultados
                      </ComboboxEmpty>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      onResidenciaChange("");
                      onViviendaChange("");
                    }}
                  >
                    Restablecer
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 text-xs bg-primary"
                    onClick={() => {
                      // Solo cerrar el popover (asumido por UX)
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
