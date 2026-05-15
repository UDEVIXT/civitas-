"use client";

import React, { useEffect, useState } from "react";
import { FiltrosTablaAdmin } from "./FiltrosTablaAdmin";
import { TablaAccesosAdmin } from "./TablaAccesosAdmin";
import { bitacoraService } from "@/services/bitacora.service";
import { BitacoraRegistro } from "../../guardia/api/bitacora";
import { AlertCircle } from "lucide-react"; // NUEVO por drk
import { Button } from "@/components/ui/button"; // NUEVO por drk

export function BitacoraAdminPage() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // DATOS
  const [records, setRecords] = useState<BitacoraRegistro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // NUEVO ESTADO

  // PAGINACIÓN
  const [meta, setMeta] = useState({
    page: 1,
    total_pages: 1,
    total: 0,
  });

  // FILTROS
  const [nameFilter, setNameFilter] = useState<string>("");

  const [propertyFilter, setPropertyFilter] = useState<string>("");

  const [typeFilter, setTypeFilter] = useState<string>("todos");

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [fechaInicio, setFechaInicio] = useState<string>("");

  const [fechaFin, setFechaFin] = useState<string>("");

  const [page, setPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bitacoraService.obtenerBitacoraHistorica({
        search: nameFilter || undefined,

        residencia: propertyFilter || undefined,

        tipo: typeFilter !== "todos" ? typeFilter || undefined : undefined,

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
      console.log("Bitácora cargada:", response.data);
    } catch (err) {
      console.error("Error cargando bitácora:", err);
      // Capturamos el error para mostrarlo en la UI
      setError("No se pudo cargar el historial de accesos debido a un problema técnico. Verifica tu conexión o intenta más tarde."); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    nameFilter,
    propertyFilter,
    typeFilter,
    sortOrder,
    fechaInicio,
    fechaFin,
    page,
  ]);

  if (!isMounted) {
    return null; // Evita el error de hidratación con las fechas del administrador
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Historial de Accesos (Administrador)
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Supervisa todas las entradas y salidas de la residencia.
        </p>
      </div>

      <FiltrosTablaAdmin
        onSearchName={(val) => {
          setNameFilter(val);
          setPage(1);
        }}
        onSearchProperty={(val) => {
          setPropertyFilter(val);
          setPage(1);
        }}
        onTypeChange={(val) => {
          setTypeFilter(val);
          setPage(1);
        }}
        onSortChange={(val) => {
          setSortOrder(val);
          setPage(1);
        }}
        onDateChange={(inicio: string, fin: string) => {
          setFechaInicio(inicio);
          setFechaFin(fin);
          setPage(1);
        }}
        onClearFilters={() => {
          setNameFilter("");
          setPropertyFilter("");
          setTypeFilter("todos");
          setSortOrder("desc");
          setFechaInicio("");
          setFechaFin("");
          setPage(1);
        }}
      />

      {/* Renderizado Condicional: Error vs Tabla */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
          <AlertCircle className="h-10 w-10 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error de conexión</h3>
          <p className="text-center max-w-md text-sm mb-6">
            {error}
          </p>
          <Button onClick={loadData} variant="outline">
            Reintentar conexión
          </Button>
        </div>
      ) : (
        <TablaAccesosAdmin
          data={records}
          loading={loading}
          onRefresh={loadData}
          meta={meta}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}