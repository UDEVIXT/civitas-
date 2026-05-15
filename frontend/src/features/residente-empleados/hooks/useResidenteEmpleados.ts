/* Este archivo contiene los hooks personalizados para gestionar los empleados del rol residente */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast"; // Quitamos el import de toast directo

// Importamos las funciones de la API
import { obtenerEmpleadosDomesticos } from "@/features/empleados-domesticos/api/empleados";
import { actualizarEmpleadoResidente } from "../api/residente-api";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

export function useResidenteEmpleados(idResidente: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast(); // <--- IMPORTANTE: Inicializamos el toast aquí
  
  // Estados para la UI
  const [search, setSearch] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoDomestico | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);

  // 1. OBTENER EMPLEADOS
  const { data, isLoading } = useQuery({
    queryKey: ["residente-empleados", idResidente, debouncedSearch],
    queryFn: () => obtenerEmpleadosDomesticos(
      { byResidenteId: idResidente, isActive: true },
      debouncedSearch
    ),
    enabled: !!idResidente,
  });

  // 2. ACTUALIZAR EMPLEADO
  const updateMutation = useMutation({
    mutationFn: (values: any) => {
      if (!selectedEmpleado) return Promise.reject("No hay empleado seleccionado");
      return actualizarEmpleadoResidente(selectedEmpleado.id_visitante, values);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
        setIsEditModalOpen(false);
        toast({
          title: "¡Todo listo!",
          description: "La información se actualizó correctamente.",
        });
      } else {
        // Traducción de errores técnicos a amigables
        const mensajeAmigable = (res.message?.length || 0) > 80 
          ? "Revisa que los datos sean correctos. Algunos campos adicionales podrían no estar habilitados aún en el servidor."
          : res.message;

        toast({
          title: "No se pudo guardar",
          description: mensajeAmigable || "Hubo un problema al procesar la información.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error de conexión",
        description: "Parece que hay un problema con el servidor. Verifica tu internet o intenta más tarde.",
        variant: "destructive",
      });
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