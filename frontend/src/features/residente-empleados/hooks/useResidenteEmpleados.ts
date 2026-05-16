/* Este archivo contiene los hooks personalizados para gestionar los empleados del rol residente */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast"; 

// Importamos las funciones de la API
import { actualizarEmpleadoResidente, obtenerMisEmpleados } from "../api/residente-api";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

export function useResidenteEmpleados(idResidente: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast(); //
  
  // Estados para la UI
  const [search, setSearch] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoDomestico | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  
  const debouncedSearch = useDebounce(search, 300);

  // 1. OBTENER EMPLEADOS
  const { data, isLoading } = useQuery({
    queryKey: ["residente-empleados", idResidente, debouncedSearch],
    queryFn: () => obtenerMisEmpleados(
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
      // Si la función de la API respondió success: true
      if (res && res.success) {
        queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
        setIsEditModalOpen(false);
        toast({
          title: "¡Todo listo!",
          description: "La información se actualizó correctamente.",
        });
      } else {
        // En caso de que se retorne success: false de manera explícita
        toast({
          title: "No se pudo guardar",
          description: res.message || "Hubo un problema al procesar la información.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      // 🚀 CAPTURA INTELIGENTE DEL ERROR DEL BACKEND:
      // Si NestJS mandó un mensaje (sea string o un arreglo del ValidationPipe), lo extraemos
      const backendMessage = error.response?.data?.message;
      
      const mensajeFinal = Array.isArray(backendMessage)
        ? backendMessage.join(". ") // Si es un arreglo de validaciones, los junta
        : backendMessage || "Parece que hay un problema con el servidor. Verifica tu internet o intenta más tarde.";

      toast({
        title: "Error en la solicitud",
        description: mensajeFinal,
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