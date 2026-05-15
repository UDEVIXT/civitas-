import { obtenerResidentes } from "@/features/empleados-domesticos/api/residente";
import { useQuery } from "@tanstack/react-query";

export default function useResidente() {
  return useQuery({
    queryKey: ["residente"],
    queryFn: obtenerResidentes,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
