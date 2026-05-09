"use client";

import * as React from "react";
import { TablaAccesosGuardia } from "./TablaAccesosGuardia";
import { FiltrosTabla } from "./FiltrosTabla";
import { BitacoraFiltro } from "../api/bitacora";

export function BitacoraGuardiaPage() {
  const [filters, setFilters] = React.useState<BitacoraFiltro>({
    page: "1",
    limit: "10",
    ordenar: "reciente",
  });

  // Limpiar filtros que no deben enviarse al backend
  const cleanFilters = React.useMemo(() => {
    const cleaned: BitacoraFiltro = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "todos") {
        cleaned[key as keyof BitacoraFiltro] = value;
      }
    });

    return cleaned;
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<BitacoraFiltro>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: "1", // Reset page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: "1",
      limit: "10",
      ordenar: "reciente",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: page.toString(),
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Bitacora de Accesos</h1>
      <FiltrosTabla
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />
      <TablaAccesosGuardia
        filtros={cleanFilters}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
