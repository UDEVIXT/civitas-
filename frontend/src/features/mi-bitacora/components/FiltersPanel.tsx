"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PersonaBitacora } from "../types";

type SortDirection = "asc" | "desc";

const focusRingClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const personTypeOptions: Array<{ label: string; value: "all" | PersonaBitacora }> = [
  { label: "Todos", value: "all" },
  { label: "Visitantes", value: "visitante" },
  { label: "Empleados", value: "empleado" },
  { label: "Proveedores", value: "proveedor" },
];

const sortOptions: Array<{ label: string; value: SortDirection }> = [
  { label: "Más reciente", value: "desc" },
  { label: "Más antiguo", value: "asc" },
];

interface Props {
  personType: "all" | PersonaBitacora;
  setPersonType: (v: "all" | PersonaBitacora) => void;
  sort: SortDirection;
  setSort: (s: SortDirection) => void;
  dateFrom: string;
  setDateFrom: (s: string) => void;
  dateTo: string;
  setDateTo: (s: string) => void;
  searchInput: string;
  setSearchInput: (s: string) => void;
  setSearch: (s: string) => void;
  setPage: (n: number) => void;
  fetchList: (isRefresh?: boolean) => Promise<void>;
  groupBy: 'metodo' | 'nombre' | 'tipo' | 'guardia' | null;
  setGroupBy: (g: 'metodo' | 'nombre' | 'tipo' | 'guardia' | null) => void;
  setSortField: (f: 'fecha_hora_entrada' | 'fecha_hora_salida' | 'metodo' | null) => void;
  onClose: () => void;
}

export function FiltersPanel({
  personType,
  setPersonType,
  sort,
  setSort,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchInput,
  setSearchInput,
  setSearch,
  setPage,
  fetchList,
  groupBy,
  setGroupBy,
  setSortField,
  onClose,
}: Props) {
  return (
    <div className="absolute right-0 top-9 z-20 w-72 rounded border border-[#e6e6e6] bg-white p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Filtros</p>
        <button type="button" onClick={onClose} className={`text-sm text-[#666666] ${focusRingClass}`}>Cerrar</button>
      </div>

      <div className="mb-2">
        <label className="mb-1 flex items-center justify-between text-xs text-[#666666]">
          <span>Agrupar por método</span>
          <input
            type="checkbox"
            checked={groupBy === 'metodo'}
            onChange={() => setGroupBy(groupBy === 'metodo' ? null : 'metodo')}
            className={`h-4 w-4 rounded border-[#c7c7c7] ${focusRingClass}`}
          />
        </label>

        <label className="mb-1 block text-xs text-[#666666]">Tipo</label>
        <select
          value={personType}
          onChange={(e) => setPersonType(e.target.value as "all" | PersonaBitacora)}
          className={`w-full rounded border px-2 py-1 text-sm ${focusRingClass}`}
        >
          {personTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="mb-1 block text-xs text-[#666666]">Orden</label>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortDirection)} className={`w-full rounded border px-2 py-1 text-sm ${focusRingClass}`}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-[#666666]">Desde</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`w-full ${focusRingClass}`} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#666666]">Hasta</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`w-full ${focusRingClass}`} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setSearchInput('');
            setSearch('');
            setPersonType('all');
            setDateFrom('');
            setDateTo('');
            setSort('desc');
            setSortField('fecha_hora_entrada');
            setGroupBy(null);
            setPage(1);
            void Promise.resolve().then(() => fetchList(true));
            onClose();
          }}
          className={`rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 ${focusRingClass}`}
        >
          Limpiar filtros
        </button>

        <Button
          type="button"
          onClick={() => {
            setSearch(searchInput.trim());
            setPage(1);
            void Promise.resolve().then(() => fetchList(true));
            onClose();
          }}
          className={focusRingClass}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
}

export default FiltersPanel;
