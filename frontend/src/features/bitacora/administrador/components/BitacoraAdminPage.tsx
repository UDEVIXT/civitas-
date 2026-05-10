"use client";

import React, { useEffect, useState } from "react";
import { FiltrosTablaAdmin } from "./FiltrosTablaAdmin";
import { TablaAccesosAdmin } from "./TablaAccesosAdmin";
import { bitacoraService, Bitacora } from "@/services/bitacora.service";

export function BitacoraAdminPage() {
  // Estados de datos
  const [records, setRecords] = useState<Bitacora[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de filtros
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>("desc");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await bitacoraService.getAll({
        propertyId: propertyFilter || undefined,
        visitorType: typeFilter !== "todos" ? typeFilter : undefined,
        sort: sortOrder,
      });
      setRecords(data);
    } catch (error) {
      console.error("Error al cargar accesos de bitácora", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar y cuando cambian los filtros
  useEffect(() => {
    // Podrías agregar un "debounce" aquí para el propertyFilter si quisieras
    loadData();
  }, [propertyFilter, typeFilter, sortOrder]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bitácora de Accesos (Administrador)</h1>
        <p className="text-muted-foreground text-sm mt-1">Supervisa todas las entradas y salidas del recinto.</p>
      </div>
      
      <FiltrosTablaAdmin 
        onSearchProperty={setPropertyFilter}
        onTypeChange={setTypeFilter}
        onSortChange={setSortOrder}
        onClearFilters={() => { setPropertyFilter(""); setTypeFilter("todos"); setSortOrder("desc"); }}
      />
      
      <TablaAccesosAdmin data={records} loading={loading} onRefresh={loadData} />
    </div>
  );
}