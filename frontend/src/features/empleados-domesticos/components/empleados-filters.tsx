import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EmpleadosFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: readonly string[];
  statusFilter: string;
  onStatusChange: (value: string) => void;
};

export function EmpleadosFilters({
  search,
  onSearchChange,
  statusOptions,
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
        {statusOptions.map((status) => (
          <Button
            key={status}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(status)}
            className={cn(
              "rounded-full",
              statusFilter === status &&
                "border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            {status}
          </Button>
        ))}
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
