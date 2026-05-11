"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  obtenerBitacoraAdmin,
  obtenerDetalleRegistroAdmin,
  BitacoraFiltroAdmin,
  BitacoraResponseAdmin,
  BitacoraDetalleResponseAdmin,
} from "../api/bitacora";

export function useBitacoraAdmin(filtros: BitacoraFiltroAdmin = {}) {
  return useQuery<BitacoraResponseAdmin>({
    queryKey: ["bitacora-admin", filtros],
    queryFn: () => obtenerBitacoraAdmin(filtros),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

export function useBitacoraAdminInfinite(filtros: BitacoraFiltroAdmin = {}) {
  return useInfiniteQuery<BitacoraResponseAdmin>({
    queryKey: ["bitacora-admin-infinite", filtros],
    queryFn: ({ pageParam = 1 }) =>
      obtenerBitacoraAdmin({ ...filtros, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

// ESTE ES EL HOOK PARA TU MODAL DE DETALLE
export function useBitacoraDetalleAdmin(id: string | null) {
  return useQuery<BitacoraDetalleResponseAdmin>({
    queryKey: ["bitacora-detalle-admin", id],
    queryFn: () => obtenerDetalleRegistroAdmin(id!),
    enabled: !!id, // Evita errores: Solo hace la petición si le pasas un ID válido (cuando el modal se abre)
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
