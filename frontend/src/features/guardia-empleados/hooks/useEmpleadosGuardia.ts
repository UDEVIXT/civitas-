import { useState, useEffect, useCallback } from "react";
import { obtenerEmpleadosGuardia, EmpleadoGuardia } from "../api/empleados-guardia";
import { FiltrosEmpleadosValues } from "../components/FiltrosEmpleados";

const PAGE_SIZE = 8;

export function useEmpleadosGuardia() {
  const [empleados, setEmpleados] = useState<EmpleadoGuardia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [filtros, setFiltrosState] = useState<FiltrosEmpleadosValues>({});

  const fetchEmpleados = useCallback(async (page: number, search?: string, idVivienda?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await obtenerEmpleadosGuardia({
        page,
        limit: PAGE_SIZE,
        search: search?.trim() || undefined,
        idVivienda: idVivienda || undefined,
      });
      setEmpleados(result.data);
      setTotalPages(result.meta.total_pages || 1);
      setTotalEmpleados(result.meta.total);
    } catch {
      setError(
        "No se pudo cargar la lista de empleados domésticos. Intenta de nuevo."
      );
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmpleados(currentPage, filtros.busqueda, filtros.idVivienda);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, filtros.busqueda, filtros.idVivienda, fetchEmpleados]);

  const setFiltros = (newFiltros: FiltrosEmpleadosValues) => {
    if (
      newFiltros.busqueda !== filtros.busqueda ||
      newFiltros.idVivienda !== filtros.idVivienda
    ) {
      setCurrentPage(1);
    }
    setFiltrosState(newFiltros);
  };

  return {
    empleados,
    loading,
    error,
    currentPage,
    totalPages,
    totalEmpleados,
    filtros,
    setFiltros,
    setCurrentPage,
    refetch: () => fetchEmpleados(currentPage, filtros.busqueda, filtros.idVivienda),
  };
}
