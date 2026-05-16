/*Este archivo contiene los hooks personalizados para gestionar los empleados del rol residente */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast"; // Asegúrate de usar useToast() si es el hook de shadcn

// Importamos las funciones de la API
import { obtenerEmpleadosDomesticos } from "@/features/empleados-domesticos/api/empleados";
import { actualizarEmpleadoResidente } from "../api/residente-api";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

export function useResidenteEmpleados(idResidente: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast(); // Instanciamos el toast correctamente
  
  // Estados para la UI
  const [search, setSearch] = useState("");
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoDomestico | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  
  // Nuevos estados para el Modal de Baja/Suspensión
  const [isBajaModalOpen, setIsBajaModalOpen] = useState(false);
  const [bajaMode, setBajaMode] = useState<"deactivate" | "reactivate">("deactivate");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [bajaError, setBajaError] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(search, 300);

  // 1. OBTENER EMPLEADOS (Quitamos isActive: true para poder ver y reactivar a los suspendidos)
  const { data, isLoading } = useQuery({
    queryKey: ["residente-empleados", idResidente, debouncedSearch],
    queryFn: () => obtenerEmpleadosDomesticos(
      { byResidenteId: idResidente }, // Removido isActive fijo para listar suspendidos también
      debouncedSearch
    ),
    enabled: !!idResidente,
  });

  // 2. MUTACIÓN PARA ACTUALIZAR DATOS GENERALES
  const updateMutation = useMutation({
    mutationFn: (values: any) => {
      if (!selectedEmpleado) return Promise.reject();
      return actualizarEmpleadoResidente(selectedEmpleado.id_visitante, values);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
        setIsEditModalOpen(false);
        toast({
          title: "Éxito",
          description: "Información actualizada correctamente",
        });
      }
    }
  });

  // 3. NUEVA MUTACIÓN PARA SUSPENDER O REACTIVAR (Cambio de Estado)
  const bajaMutation = useMutation({
    mutationFn: (values: { activo: boolean; motivo?: string }) => {
      if (!selectedEmpleado) return Promise.reject();
      // Reutiliza la API de actualización enviando el nuevo estado de actividad
      return actualizarEmpleadoResidente(selectedEmpleado.id_visitante, values);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
        setIsBajaModalOpen(false);
        setMotivoBaja("");
        setBajaError(null);
        
        toast({
          title: bajaMode === "deactivate" ? "Acceso Suspendido" : "Acceso Reactivado",
          description: bajaMode === "deactivate" 
            ? "El empleado ha sido suspendido temporalmente." 
            : "Los permisos del empleado han sido restaurados.",
        });
      } else {
        setBajaError(res.message || "Ocurrió un error al procesar el cambio de estado.");
      }
    },
    onError: () => {
      setBajaError("Error de conexión con el servidor. Inténtalo de nuevo.");
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


  const handleBajaClick = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setMotivoBaja("");
    setBajaError(null);
    
    // Si 'activo' es false, significa que está suspendido, por lo que el modo será "reactivate"
    const esInactivo = empleado.servicio?.activo === false;
    setBajaMode(esInactivo ? "reactivate" : "deactivate");
    
    setIsBajaModalOpen(true);
  };

  // Función encargada de confirmar la acción del modal
  const handleConfirmBaja = () => {
    if (bajaMode === "deactivate") {
      bajaMutation.mutate({ activo: false, motivo: motivoBaja.trim() });
    } else {
      bajaMutation.mutate({ activo: true });
    }
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
    // Retornamos el nuevo objeto estructurado para el ModalBajaEmpleado
    modalBaja: {
      isOpen: isBajaModalOpen,
      setIsOpen: setIsBajaModalOpen,
      selectedEmpleado,
      mode: bajaMode,
      motivo: motivoBaja,
      setMotivo: setMotivoBaja,
      isDeleting: bajaMutation.isPending,
      deleteError: bajaError,
      handleBajaClick,
      confirm: handleConfirmBaja,
    }
  };
}