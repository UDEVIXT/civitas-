import { useQuery } from "@tanstack/react-query";
import {
  obtenerIncidencias,
  IncidenciasFiltros,
  ReporteIncidencia,
} from "../api/incidencias";

export function useIncidencias(filtros: IncidenciasFiltros = {}) {
  return useQuery<ReporteIncidencia[]>({
    queryKey: ["incidencias", filtros],
    queryFn: () => obtenerIncidencias(filtros),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}