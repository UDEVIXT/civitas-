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

  // Estados para el Modal de Baja/Suspensión
  const [isBajaModalOpen, setIsBajaModalOpen] = useState(false);
  const [bajaMode, setBajaMode] = useState<"deactivate" | "reactivate">("deactivate");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [bajaError, setBajaError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // 1. OBTENER EMPLEADOS
  // 1. OBTENER EMPLEADOS

  console.log("🚀 [HOOK] El idResidente que llega al hook es:", idResidente);

  const { data, isLoading, error } = useQuery({
    queryKey: ["residente-empleados", idResidente, debouncedSearch],
    queryFn: () => obtenerMisEmpleados(
      { byResidenteId: idResidente },
      debouncedSearch
    ),
    enabled: !!idResidente,
  });

  if (error) {
    console.error("🚨 [HOOK] Error atrapado en React Query:", error);
  }
  // 2. ACTUALIZAR EMPLEADO
  // 2. ACTUALIZAR EMPLEADO
  // 2. ACTUALIZAR EMPLEADO
  const updateMutation = useMutation({
    mutationFn: (values: any) => {
      if (!selectedEmpleado) return Promise.reject("No hay empleado seleccionado");

      // 1. Mapeamos los días activos del modal a un arreglo simple de strings: ["Lunes", "Martes", ...]
      const diasAutorizados = (values.horarios || [])
        .filter((h: any) => h.activo)
        .map((h: any) => h.dia);

      // 2. Extraemos el horario de entrada y salida del primer día activo como el global de la petición
      const primerDiaActivo = (values.horarios || []).find((h: any) => h.activo);
      const entradaLimpia = primerDiaActivo?.hora_entrada || "08:00";
      const salidaLimpia = primerDiaActivo?.hora_salida || "16:00";

      // 3. Estructuramos el objeto PLANO que tu backend (EmpleadoService) sabe leer perfectamente
      const payloadBackend = {
        nombre: values.nombre,
        telefono: values.telefono,
        cargo: values.cargo,
        foto: values.foto || "",
        notas: values.notas || "",
        dias_autorizados: diasAutorizados, // Esto va para la línea 245 de tu backend
        hora_entrada: entradaLimpia,       // Esto va para el data.hora_entrada de tu backend
        hora_salida: salidaLimpia,         // Esto va para el data.hora_salida de tu backend
      };

      console.log("🚀 [HOOK] Payload plano adaptado enviado al servicio:", payloadBackend);

      return actualizarEmpleadoResidente(selectedEmpleado.id_visitante, payloadBackend);
    },
    onSuccess: (res: any) => { // 💡 Le ponemos ': any' temporalmente para que ignore el estricto de TS en la respuesta
      // Validamos si viene success en true, o si el código de estado es 200 de forma segura
      if (res && (res.success || res.statusCode === 200 || res.status === 200)) {
        queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
        setIsEditModalOpen(false);
        toast({
          title: "¡Todo listo!",
          description: "La información se actualizó correctamente.",
        });
      } else {
        toast({
          title: "No se pudo guardar",
          description: res?.message || "Hubo un problema al procesar la información.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      const backendMessage = error.response?.data?.message;
      const mensajeFinal = Array.isArray(backendMessage)
        ? backendMessage.join(". ")
        : backendMessage || "Parece que hay un problema con el servidor. Verifica tu internet o intenta más tarde.";

      toast({
        title: "Error en la solicitud",
        description: mensajeFinal,
        variant: "destructive",
      });
    }
  });


  /* const updateMutation = useMutation({
     mutationFn: (values: any) => {
       if (!selectedEmpleado) return Promise.reject("No hay empleado seleccionado");
 
       // Diccionario para traducir de la UI al formato estricto de la BD
       const mapeoDiasUIABd: Record<string, string> = {
         'Lunes': 'LUNES', 'Martes': 'MARTES', 'Miércoles': 'MIERCOLES',
         'Jueves': 'JUEVES', 'Viernes': 'VIERNES', 'Sábado': 'SABADO', 'Domingo': 'DOMINGO'
       };
 
       // 💡 FORMATEO DE HORARIOS: Convertimos lo que viene del modal al DTO del backend
       const horariosFormateados = (values.horarios || [])
         .filter((h: any) => h.activo) // Solo mandamos los días autorizados
         .map((h: any) => {
           // Si el back espera un formato DateTime completo de ISO, construimos una fecha base
           const hoy = new Date().toISOString().split('T')[0]; // Ejemplo: "2026-05-16"
           
           return {
             dia_semana: mapeoDiasUIABd[h.dia],
             activo: true,
             // Si Joan te pide solo "HH:MM", usa h.hora_entrada. Si pide ISO string, usa el new Date:
             hora_inicio: h.hora_entrada.includes('T') ? h.hora_entrada : `${hoy}T${h.hora_entrada}:00.000Z`,
             hora_fin: h.hora_salida.includes('T') ? h.hora_salida : `${hoy}T${h.hora_salida}:00.000Z`,
           };
         });
 
       // Estructuramos el payload exactamente como lo pide el controlador de NestJS
       const payloadFormateado = {
         nombre: values.nombre,
         telefono: values.telefono,
         cargo: values.cargo,
         notas: values.notas || "",
         horarios: horariosFormateados, // Tu arreglo limpio y traducido
       };
 
       console.log("🚀 [HOOK] Enviando payload formateado al backend:", payloadFormateado);
 
       return actualizarEmpleadoResidente(selectedEmpleado.id_visitante, payloadFormateado);
     },
     onSuccess: (res) => {
       if (res && res.success) {
         // Forzamos a que la tabla se vuelva a traer los datos del back de inmediato
         queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
         setIsEditModalOpen(false);
         toast({
           title: "¡Todo listo!",
           description: "La información se actualizó correctamente.",
         });
       } else {
         toast({
           title: "No se pudo guardar",
           description: res.message || "Hubo un problema al procesar la información.",
           variant: "destructive",
         });
       }
     },
     onError: (error: any) => {
       const backendMessage = error.response?.data?.message;
       const mensajeFinal = Array.isArray(backendMessage)
         ? backendMessage.join(". ")
         : backendMessage || "Parece que hay un problema con el servidor. Verifica tu internet o intenta más tarde.";
 
       toast({
         title: "Error en la solicitud",
         description: mensajeFinal,
         variant: "destructive",
       });
     }
   });*/

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
    setBajaMode(empleado.servicio?.activo ? "deactivate" : "reactivate");
    setMotivoBaja("");
    setBajaError(null);
    setIsBajaModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmpleado) return Promise.reject("No hay empleado seleccionado");
      const { default: apiClient } = await import("@/api/axios");

      const endpoint = `/mi-empleado/${selectedEmpleado.id_visitante}`;

      if (bajaMode === "deactivate") {
        const response = await apiClient.put(endpoint, {
          accion: "baja",
          data: { motivo: motivoBaja, activo: false, id_residente: idResidente }
        });
        return response.data;
      } else {
        const response = await apiClient.put(endpoint, {
          accion: "reactivacion",
          data: { motivo: motivoBaja, activo: true, id_residente: idResidente }
        });
        return response.data;
      }
    },
    onSuccess: (res: any) => {
      if (res && (res.success || res.statusCode === 200 || res.status === 200)) {
        queryClient.invalidateQueries({ queryKey: ["residente-empleados"] });
        setIsBajaModalOpen(false);
        toast({
          title: "Operación exitosa",
          description: bajaMode === "deactivate" ? "Acceso suspendido correctamente." : "Acceso reactivado.",
        });
      } else {
        setBajaError(res?.message || "Hubo un problema al procesar la solicitud.");
      }
    },
    onError: (error: any) => {
      const backendMessage = error.response?.data?.message;
      const finalMessage = Array.isArray(backendMessage) ? backendMessage.join(". ") : backendMessage;
      setBajaError(finalMessage || "Error al procesar la solicitud.");
      toast({
        title: "Error",
        description: finalMessage || "Error al procesar la solicitud.",
        variant: "destructive",
      });
    }
  });

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
      isDeleting: deleteMutation.isPending,
      deleteError: bajaError,
      handleBajaClick,
      confirm: () => deleteMutation.mutate(),
    },
  };
}