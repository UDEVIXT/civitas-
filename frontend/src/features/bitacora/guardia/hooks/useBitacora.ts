"use client";

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  obtenerBitacoraHistorica, 
  obtenerDetalleRegistro,
  BitacoraFiltro, 
  BitacoraResponse,
  BitacoraRegistro,
  BitacoraDetalleResponse
} from '../api/bitacora';

// Hook para obtener bitácora histórica con filtros
export function useBitacoraHistorica(filtros: BitacoraFiltro = {}) {
  return useQuery<BitacoraResponse>({
    queryKey: ['bitacora-historica', filtros],
    queryFn: () => obtenerBitacoraHistorica(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

// Hook para infinite scroll (paginación progresiva)
export function useBitacoraInfinite(filtros: BitacoraFiltro = {}) {
  return useInfiniteQuery<BitacoraResponse>({
    queryKey: ['bitacora-infinite', filtros],
    queryFn: ({ pageParam = 1 }) => 
      obtenerBitacoraHistorica({ ...filtros, page: (pageParam as number).toString() }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

// Hook para obtener detalle de un registro
export function useBitacoraDetalle(id: string) {
  return useQuery<BitacoraDetalleResponse>({
    queryKey: ['bitacora-detalle', id],
    queryFn: () => obtenerDetalleRegistro(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
