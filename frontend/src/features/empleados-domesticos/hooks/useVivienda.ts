import { obtenerViviendas } from "@/features/empleados-domesticos/api/vivienda";
import { useQuery } from "@tanstack/react-query";

export default function useVivienda() {
  return useQuery({
    queryKey: ["vivienda"],
    queryFn: obtenerViviendas,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
