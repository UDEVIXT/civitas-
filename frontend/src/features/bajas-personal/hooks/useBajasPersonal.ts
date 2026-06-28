import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { obtenerEmpleadosDomesticos, obtenerDetalleBaja } from "@/features/empleados-domesticos/api/empleados";
import { EmpleadoDomesticoResponse } from "@/features/empleados-domesticos/types";

export function useBajasPersonal() {
  const currentUser = useAuth((state) => state.user);

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const debouncedSearch = useDebounce(search, 300);

  // Fetch the list of dismissed employees (isActive: false)
  const {
    data: listResponse,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useQuery<EmpleadoDomesticoResponse>({
    queryKey: [
      "bajas-personal-list",
      currentUser?.id ?? "anonymous",
      debouncedSearch,
      page,
    ],
    queryFn: () => {
      return obtenerEmpleadosDomesticos({ isActive: false }, debouncedSearch, page);
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch details of selected dismissed employee
  const {
    data: detailResponse,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["baja-detalle", selectedId],
    queryFn: () => {
      if (!selectedId) return null;
      return obtenerDetalleBaja(selectedId);
    },
    enabled: !!selectedId && isOpen,
    staleTime: 0,
  });

  const handleOpenDetails = (id: string) => {
    setSelectedId(id);
    setIsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsOpen(false);
  };

  return {
    empleados: listResponse?.data || [],
    totalPages: listResponse?.meta?.total_pages || 1,
    page,
    setPage,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    isListLoading,
    isListError,
    listError,
    refetchList,

    // Modal
    modal: {
      isOpen,
      handleOpenDetails,
      handleCloseDetails,
      isLoading: isDetailLoading,
      isError: isDetailError,
      refetch: refetchDetail,
      data: detailResponse?.data,
    },
  };
}
