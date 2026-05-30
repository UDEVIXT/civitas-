/* Este archivo contiene los hooks personalizados para gestionar los empleados del rol residente */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

// APIs
import {
  actualizarEmpleadoResidente,
  obtenerMisEmpleados,
  toggleEmpleadoActivo
} from "../api/residente-api";

import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

type HorarioForm = {
  dia: string;
  activo: boolean;
  hora_entrada: string;
  hora_salida: string;
};

type UpdateEmpleadoValues = {
  nombre: string;
  telefono?: string;
  cargo?: string;
  foto?: any;
  notas_adicionales?: string;
  horarios?: HorarioForm[];
};

export function useResidenteEmpleados(idResidente: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // =========================
  // Estados UI
  // =========================

  const [search, setSearch] = useState("");

  const [selectedEmpleado, setSelectedEmpleado] =
    useState<EmpleadoDomestico | null>(null);

  // Modal edición
  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  // Modal horario
  const [isHorarioModalOpen, setIsHorarioModalOpen] =
    useState(false);

  // Modal baja/reactivación
  const [isBajaModalOpen, setIsBajaModalOpen] =
    useState(false);

  const [bajaMode, setBajaMode] = useState<
    "deactivate" | "reactivate"
  >("deactivate");

  const [motivoBaja, setMotivoBaja] =
    useState("");

  const [bajaError, setBajaError] =
    useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // =========================
  // Obtener empleados
  // =========================

  console.log(
    "🚀 [HOOK] El idResidente que llega al hook es:",
    idResidente,
  );

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "residente-empleados",
      idResidente,
      debouncedSearch,
    ],

    queryFn: () =>
      obtenerMisEmpleados(
        {
          byResidenteId: idResidente,
          isActive: undefined,
        },
        debouncedSearch,
      ),

    enabled: !!idResidente,
  });

  if (error) {
    console.error(
      "🚨 [HOOK] Error atrapado en React Query:",
      error,
    );
  }

  // =========================
  // Actualizar empleado
  // =========================

  const updateMutation = useMutation({
    mutationFn: (values: UpdateEmpleadoValues) => {
      if (!selectedEmpleado) {
        return Promise.reject("No hay empleado seleccionado");
      }

      // Días activos
      const diasAutorizados = (
        values.horarios || []
      )
        .filter((h) => h.activo)
        .map((h) => h.dia);

      // Tomamos primer horario activo
      const primerDiaActivo = (
        values.horarios || []
      ).find((h) => h.activo);

      const entradaLimpia =
        primerDiaActivo?.hora_entrada || "08:00";

      const salidaLimpia =
        primerDiaActivo?.hora_salida || "16:00";

const payloadBackend = {
  nombre: values.nombre,
  telefono: values.telefono || "",
  cargo: values.cargo || "",
  notas_adicionales: values.notas_adicionales || "",
  foto: "",
  dias_autorizados: diasAutorizados,
  hora_entrada: entradaLimpia,
  hora_salida: salidaLimpia,
};

console.log("🚀 [HOOK] Payload enviado al backend:", payloadBackend);

return actualizarEmpleadoResidente(
  selectedEmpleado.id_visitante,
  payloadBackend,
);
    },

    onSuccess: (res: any) => {
      if (
        res &&
        (res.success ||
          res.statusCode === 200 ||
          res.status === 200)
      ) {
        queryClient.invalidateQueries({
          queryKey: ["residente-empleados"],
        });

        setIsEditModalOpen(false);

        toast({
          title: "¡Todo listo!",
          description:
            "La información se actualizó correctamente.",
        });
      } else {
        toast({
          title: "No se pudo guardar",
          description:
            res?.message ||
            "Hubo un problema al procesar la información.",
          variant: "destructive",
        });
      }
    },

    onError: (error: any) => {
      const backendMessage =
        error.response?.data?.message;

      const mensajeFinal = Array.isArray(
        backendMessage,
      )
        ? backendMessage.join(". ")
        : backendMessage ||
          "Parece que hay un problema con el servidor.";

      toast({
        title: "Error en la solicitud",
        description: mensajeFinal,
        variant: "destructive",
      });
    },
  });

  // =========================
  // Baja / Reactivación
  // =========================

  const bajaMutation = useMutation({
    mutationFn: async ({
      empleado,
      motivo,
    }: {
      empleado: {
        id_visitante: string;
        servicio?: {
          activo?: boolean;
        };
      };
      motivo?: string;
    }) => {
      return toggleEmpleadoActivo(empleado, motivo);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["residente-empleados"],
      });

      setIsBajaModalOpen(false);

      toast({
        title: "Operación realizada",
        description: "El estado del empleado fue actualizado.",
      });
    },

    onError: (error: any) => {
      const backendMessage = error.response?.data?.message;

      const mensajeFinal = Array.isArray(backendMessage)
        ? backendMessage.join(". ")
        : backendMessage || "Ocurrió un error.";

      setBajaError(mensajeFinal);

      toast({
        title: "Error",
        description: mensajeFinal,
        variant: "destructive",
      });
    },
  });

  // =========================
  // Handlers
  // =========================

  const handleEditClick = (
    empleado: EmpleadoDomestico,
  ) => {
    setSelectedEmpleado(empleado);
    setIsEditModalOpen(true);
  };

  const handleVerHorario = (
    empleado: EmpleadoDomestico,
  ) => {
    setSelectedEmpleado(empleado);
    setIsHorarioModalOpen(true);
  };

  const handleBajaClick = (
    empleado: EmpleadoDomestico,
    mode:
      | "deactivate"
      | "reactivate" = "deactivate",
  ) => {
    setSelectedEmpleado(empleado);

    setBajaMode(mode);

    setMotivoBaja("");

    setBajaError(null);

    setIsBajaModalOpen(true);
  };

  const confirmBaja = () => {
    if (!selectedEmpleado) return;

    if (bajaMode === "deactivate" && !motivoBaja.trim()) {
      setBajaError("Debes escribir un motivo.");
      return;
    }

    bajaMutation.mutate({
      empleado: selectedEmpleado,
      motivo: motivoBaja,
    });
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
    modalBaja: {
      isOpen: isBajaModalOpen,
      setIsOpen: setIsBajaModalOpen,
      selectedEmpleado,
      mode: bajaMode,
      motivo: motivoBaja,
      setMotivo: setMotivoBaja,
      deleteError: bajaError,
      isDeleting: bajaMutation.isPending,
      handleBajaClick,
      confirm: confirmBaja,
    },
  };
}