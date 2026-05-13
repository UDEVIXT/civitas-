import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EmpleadosFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: boolean;
  onStatusChange: (value: boolean | undefined) => void;
};

export function EmpleadosFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: EmpleadosFiltersProps) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">UDEV</p>
          <h1 className="text-2xl font-semibold">Empleados domesticos</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {
          <Button
            key="Todos"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(undefined)}
            className={cn(
              "rounded-full",
              statusFilter == undefined &&
                "border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            Todos
          </Button>
        }
        {
          <Button
            key="Activos"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(true)}
            className={cn(
              "rounded-full",
              statusFilter === true &&
                "border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            Activos
          </Button>
        }
        {
          <Button
            key="Inactivos"
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(false)}
            className={cn(
              "rounded-full",
              statusFilter === false &&
                "border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            Inactivos
          </Button>
        }
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          <SlidersHorizontal className="size-4" />
          Mas filtros
        </Button>
      </div>
    </header>
  );
}
