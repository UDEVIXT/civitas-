"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { obtenerMisServicios } from "../api/servicios-api"; 
import type { ServicioMock } from "../components/tabla-servicios";

export function useResidenteServicios() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useQuery<ServicioMock[]>({
    queryKey: ["residente-servicios", debouncedSearch],
    queryFn: () => obtenerMisServicios(),
  });

  return {
    servicios: data || [],
    isLoading,
    isError,
    error,
    search,
    setSearch,
    refetch,
  };
}