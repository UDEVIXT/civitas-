"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { obtenerMisServicios } from "../api/servicios.api"; 
import type { ServicioDomicilio } from "../types/index"; // Usamos solo el tipo real

export function useResidenteServicios() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery<ServicioDomicilio[]>({
    queryKey: ["residente-servicios", debouncedSearch],
    queryFn: () => obtenerMisServicios(), 
  });
  
  return {
    servicios: data || [], // Mandamos el arreglo crudo y real de tu Postgres
    isLoading,
    search,
    setSearch,
  };
}