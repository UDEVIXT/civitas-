import { useQuery } from "@tanstack/react-query";
import {
  obtenerIncidencias,
  obtenerDetalleIncidencia,
  IncidenciasFiltros,
  IncidenciasResponse,
  IncidenciaDetalleResponse,
} from "../api/incidencias";

export function useIncidencias(filtros: IncidenciasFiltros = {}) {
  return useQuery<IncidenciasResponse>({
    queryKey: ["incidencias", filtros],
    queryFn: () => obtenerIncidencias(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

export function useDetalleIncidencia(id: string | null) {
  return useQuery<IncidenciaDetalleResponse>({
    queryKey: ["incidencia-detalle", id],
    queryFn: () => obtenerDetalleIncidencia(id!),
    enabled: !!id, // Solo hace la petición si hay un ID válido
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}