"use client";

import React, { useEffect, useState } from "react";
import { FiltrosTablaAdmin } from "./FiltrosTablaAdmin";
import { TablaAccesosAdmin } from "./TablaAccesosAdmin";
import {
  bitacoraService,
  BitacoraRegistro,
} from "@/services/bitacora.service";

export function BitacoraAdminPage() {
  // DATOS
  const [records, setRecords] = useState<BitacoraRegistro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // PAGINACIÓN
  const [meta, setMeta] = useState({
    page: 1,
    total_pages: 1,
    total: 0,
  });

  // FILTROS
  const [propertyFilter, setPropertyFilter] = useState<string>("");

  const [typeFilter, setTypeFilter] = useState<string>("");

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [fechaInicio, setFechaInicio] = useState<string>("");

  const [fechaFin, setFechaFin] = useState<string>("");

  const [page, setPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);

      const response = await bitacoraService.obtenerBitacoraHistorica({
        search: propertyFilter || undefined,

        tipo: typeFilter || undefined,

        fecha_inicio: fechaInicio || undefined,

        fecha_fin: fechaFin || undefined,

        ordenar: sortOrder === "asc" ? "antiguo" : "reciente",

        page: String(page),

        limit: "10",
      });

      setRecords(response.data);

      setMeta({
        page: response.meta.page,
        total_pages: response.meta.total_pages,
        total: response.meta.total,
      });
    } catch (error) {
      console.error("Error cargando bitácora:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    propertyFilter,
    typeFilter,
    sortOrder,
    fechaInicio,
    fechaFin,
    page,
  ]);

  return (
    <div className="container mx-auto p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Historial de Accesos (Administrador)
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Supervisa todas las entradas y salidas de la residencia.
        </p>
      </div>

      <FiltrosTablaAdmin
        onSearchProperty={setPropertyFilter}
        onTypeChange={setTypeFilter}
        onSortChange={setSortOrder}
        onDateChange={(inicio: string, fin: string) => {
          setFechaInicio(inicio);
          setFechaFin(fin);
        }}
        onClearFilters={() => {
          setPropertyFilter("");
          setTypeFilter("");
          setSortOrder("desc");
          setFechaInicio("");
          setFechaFin("");
          setPage(1);
        }}
      />

      <TablaAccesosAdmin
        data={records}
        loading={loading}
        onRefresh={loadData}
        meta={meta}
        onPageChange={setPage}
      />
    </div>
  );
}