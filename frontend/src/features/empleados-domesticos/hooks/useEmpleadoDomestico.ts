"use client";

import { useState, useCallback, useEffect } from "react";
import {
  obtenerEmpleadosDomesticos,
  eliminarEmpleadoDomestico,
  activarEmpleadoDomestico,
} from "@/features/empleados-domesticos/api/empleados";
import type {
  EmpleadoDomestico,
  FiltroEmpleado,
} from "@/features/empleados-domesticos/types";

/**
 * Hook para gestionar la lógica de empleados domésticos.
 * Centraliza el fetch, los filtros, la paginación y el estado del modal.
 */
export function useEmpleadoDomesticos(initialData: EmpleadoDomestico[] = []) {
  const [empleados, setEmpleados] = useState<EmpleadoDomestico[]>(
    initialData || [],
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] =
    useState<EmpleadoDomestico | null>(null);
  const [motivo, setMotivo] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    console.log("HOOK: Iniciando fetch...", { search, statusFilter, page });
    try {
      const filtro: FiltroEmpleado | undefined =
        statusFilter === "Activos"
          ? { filtro: "isActive", valor: true }
          : undefined;

      const response = await obtenerEmpleadosDomesticos(filtro, search, page);
      console.log("HOOK: Respuesta recibida", response);

      if (response && response.success) {
        const data = response.data || [];
        console.log(`HOOK: Actualizando estado con ${data.length} empleados`);
        setEmpleados([...data]); // Creamos una nueva referencia de array

        if (response.meta) {
          setTotalPages(
            response.meta.total_pages || response.meta.total_pages || 1,
          );
        }
      } else {
        console.warn("HOOK: La API falló o no devolvió éxito");
        setEmpleados([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("HOOK ERROR:", error);
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const handleActionClick = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setMotivo("");
    setDeleteError(null);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedEmpleado) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const isReactivating = selectedEmpleado.servicio?.activo === false;
      const res = isReactivating
        ? await activarEmpleadoDomestico(selectedEmpleado.id_visitante, motivo)
        : await eliminarEmpleadoDomestico(
            selectedEmpleado.id_visitante,
            motivo,
          );

      if (res.success) {
        setIsModalOpen(false);
        fetchEmpleados();
      } else {
        setDeleteError(res.message || "Error al procesar la solicitud");
      }
    } catch (e) {
      setDeleteError("Error inesperado en la operación");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    empleados,
    loading,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    statusFilter,
    setStatusFilter: (val: string) => {
      setStatusFilter(val);
      setPage(1);
    },
    page,
    setPage,
    totalPages,
    modal: {
      isOpen: isModalOpen,
      setIsOpen: setIsModalOpen,
      selectedEmpleado,
      motivo,
      setMotivo,
      isDeleting,
      deleteError,
      handleActionClick,
      confirmAction,
    },
  };
}
