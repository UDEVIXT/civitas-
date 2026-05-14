/*Este archivo contiene los hooks personalizados para gestionar los empleados del rol residente */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { toast, useToast } from "@/hooks/use-toast";

// Importamos las funciones de la API
import { obtenerEmpleadosDomesticos, eliminarEmpleadoDomestico } from "@/features/empleados-domesticos/api/empleados";
import { actualizarEmpleadoResidente } from "../api/residente-api";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

export function useResidenteEmpleados(idResidente: string) {
  const queryClient = useQueryClient();
  
  // Estados para la UI
  const [search, setSearch] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoDomestico | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);

  // 1. OBTENER EMPLEADOS (Solo los del residente actual)
  const { data, isLoading } = useQuery({
    queryKey: ["residente-empleados", idResidente, debouncedSearch],
    queryFn: () => obtenerEmpleadosDomesticos(
      { byResidenteId: idResidente, isActive: true }, // Filtro forzado para residentes
      debouncedSearch
    ),
    enabled: !!idResidente, // Solo se ejecuta si hay un ID de residente
  });

  //  ACTUALIZAR MODAL
  const updateMutation = useMutation({
    mutationFn: (values: any) => {
      if (!selectedEmpleado) return Promise.reject();
      return actualizarEmpleadoResidente(selectedEmpleado.id_visitante, values);
    },
   onSuccess: (res) => 
    {
    if (res.success) 
        {
            queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
            setIsEditModalOpen(false);
            toast({
            title: "Éxito",
            description: "Información actualizada correctamente",
            });
        }
    }
  });

  // Manejadores de eventos
  const handleEditClick = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setIsEditModalOpen(true);
  };

  const handleVerHorario = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setIsHorarioModalOpen(true);
  };

 return {
  empleados: data?.data || [],
  isLoading,
  search,
  setSearch,
  modalEdit: {
    isOpen: isEditModalOpen,
    setIsOpen: setIsEditModalOpen,
    selectedEmpleado,
    handleEditClick,
    isSaving: updateMutation.isPending,
    save: updateMutation.mutate,
  },
  modalHorario: {
    isOpen: isHorarioModalOpen,
    setIsOpen: setIsHorarioModalOpen,
    selectedEmpleado,
    handleVerHorario,
  },
};
}