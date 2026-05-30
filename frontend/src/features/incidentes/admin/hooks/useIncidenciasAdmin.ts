import { useState, useEffect, useMemo } from "react";
import { obtenerIncidenciasAdmin, IncidenteAdmin, IncidenciasAdminFiltros } from "../api/incidencias-admin";

interface UseIncidenciasAdminReturn {
  incidentes: IncidenteAdmin[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalIncidentes: number;
  filtros: IncidenciasAdminFiltros;
  setFiltros: (filtros: Partial<IncidenciasAdminFiltros>) => void;
  setCurrentPage: (page: number) => void;
  refetch: () => Promise<void>;
}

const PAGE_SIZE = 8;

export function useIncidenciasAdmin(): UseIncidenciasAdminReturn {
  const [incidentes, setIncidentes] = useState<IncidenteAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltrosState] = useState<IncidenciasAdminFiltros>({});

  const fetchIncidentes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await obtenerIncidenciasAdmin({
        ...filtros,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      setIncidentes(response.incidentes);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error al obtener incidencias:", err);
      setError("No se pudieron cargar las incidencias. Por favor, inténtalo de nuevo.");
      setIncidentes([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch cuando cambia la página o los filtros del servidor (estado, prioridad)
  useEffect(() => {
    fetchIncidentes();
  }, [currentPage, filtros.estado, filtros.prioridad]);

  // Filtrado local por búsqueda (no requiere ir al servidor)
  const filteredIncidentes = useMemo(() => {
    const q = filtros.busqueda?.trim().toLowerCase();
    if (!q) return incidentes;
    return incidentes.filter(
      (i) =>
        i.titulo.toLowerCase().includes(q) ||
        i.descripcion.toLowerCase().includes(q) ||
        (i.nombre_residente && i.nombre_residente.toLowerCase().includes(q)) ||
        (i.ubicacion && i.ubicacion.toLowerCase().includes(q))
    );
  }, [incidentes, filtros.busqueda]);

  const handleSetFiltros = (nuevosFiltros: Partial<IncidenciasAdminFiltros>) => {
    setFiltrosState(prev => ({ ...prev, ...nuevosFiltros }));
    setCurrentPage(1);
  };

  const handleSetCurrentPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return {
    incidentes: filteredIncidentes,
    loading,
    error,
    currentPage,
    totalPages,
    totalIncidentes: filteredIncidentes.length,
    filtros,
    setFiltros: handleSetFiltros,
    setCurrentPage: handleSetCurrentPage,
    refetch: fetchIncidentes,
  };
}
