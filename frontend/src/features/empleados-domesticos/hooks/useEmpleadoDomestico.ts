import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import {
  obtenerEmpleadosDomesticos,
  activarEmpleadoDomestico,
  eliminarEmpleadoDomestico,
} from "@/features/empleados-domesticos/api/empleados";
import {
  EmpleadoDomestico,
  EmpleadoDomesticoResponse,
  FiltroEmpleado,
} from "@/features/empleados-domesticos/types";

export function useEmpleadoDomesticos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filtros locales
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(
    undefined,
  ); //por defecto empleados activos
  const [residenciaFilter, setResidenciaFilter] = useState<string>("");
  const [viviendaFilter, setViviendaFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const debouncedSearch = useDebounce(search, 300);

  // UI State para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] =
    useState<EmpleadoDomestico | null>(null);
  const [motivo, setMotivo] = useState("");

  const [error, setError] = useState<string | null>(null);

  // 1. QUERY: Obtener datos
  const {
    data: response,
    isLoading: loading,
    isPlaceholderData,
  } = useQuery<EmpleadoDomesticoResponse>({
    queryKey: [
      "empleados-domesticos",
      debouncedSearch,
      statusFilter,
      residenciaFilter,
      viviendaFilter,
      page,
    ],
    queryFn: () => {
      // Mapeo dinámico de filtros para la API
      const filtros: FiltroEmpleado = {};
      if (statusFilter !== undefined) filtros.isActive = statusFilter;
      if (residenciaFilter !== undefined)
        filtros.byResidenteId = residenciaFilter;
      if (viviendaFilter !== undefined) filtros.byViviendaId = viviendaFilter;

      return obtenerEmpleadosDomesticos(filtros, debouncedSearch, page);
    },
    placeholderData: (prev) => prev,
  });

  // 2. MUTATION: Ejecutar acciones (Activar/Eliminar)
  const { mutate: executeAction, isPending: isDeleting } = useMutation({
    mutationFn: ({
      id,
      motivo,
      isReactivating,
    }: {
      id: string;
      motivo: string;
      isReactivating: boolean;
    }) =>
      isReactivating
        ? activarEmpleadoDomestico(id, motivo)
        : eliminarEmpleadoDomestico(id, motivo),
    onSuccess: (res, variables) => {
      if (res.success) {
        setError(null);
        queryClient.invalidateQueries({ queryKey: ["empleados-domesticos"] });
        setIsModalOpen(false);
        toast({
          title: variables.isReactivating
            ? "Empleado activado"
            : "Empleado dado de baja",
          description: variables.isReactivating
            ? "El empleado ha sido activado correctamente"
            : "El empleado ha sido dado de baja correctamente",
        });
      } else {
        const errorMsg = res.message || "Error al procesar la solicitud";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.message || "Error de red o del servidor";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleActionClick = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setMotivo("");
    setIsModalOpen(true);
  };

  const confirmAction = () => {
    if (!selectedEmpleado) return;
    executeAction({
      id: selectedEmpleado.id_visitante,
      motivo,
      isReactivating: selectedEmpleado.servicio?.activo === false,
    });
  };

  return {
    empleados: response?.data || [],
    loading: loading || isPlaceholderData,
    search,
    setSearch: (v: string) => {
      setSearch(v);
      setPage(1);
    },
    statusFilter,
    setStatusFilter: (v: boolean | undefined) => {
      setStatusFilter(v);
      setPage(1);
    },
    residenciaFilter,
    setResidenciaFilter: (v: string) => {
      setResidenciaFilter(v);
      setPage(1);
    },
    viviendaFilter,
    setViviendaFilter: (v: string) => {
      setViviendaFilter(v);
      setPage(1);
    },
    page,
    setPage,
    totalPages: response?.meta?.total_pages || 1,
    modal: {
      isOpen: isModalOpen,
      setIsOpen: setIsModalOpen,
      selectedEmpleado,
      motivo,
      setMotivo,
      isDeleting,
      deleteError: error,
      handleActionClick,
      confirmAction,
    },
  };
}

// Estos hooks individuales son útiles si quieres usarlos por separado en otros componentes
export function useActivarEmpleadoDomestico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo?: string }) => {
      return activarEmpleadoDomestico(id, motivo);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["empleados-domesticos"] });
      }
    },
  });
}

export function useEliminarEmpleadoDomestico() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo?: string }) => {
      return eliminarEmpleadoDomestico(id, motivo);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["empleados-domesticos"] });
      }
    },
  });
}
