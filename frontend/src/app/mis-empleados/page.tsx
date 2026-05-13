"use client";

import * as React from "react";
import { TablaMisEmpleados } from "@/features/empleados-domesticos/residente/components/TablaMisEmpleados";
import { ModalEditarEmpleado } from "@/features/empleados-domesticos/residente/components/ModalEditarEmpleado";
import { useEmpleadoDomesticos } from "@/features/empleados-domesticos/hooks/useEmpleadoDomestico";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

export default function MisEmpleadosPage() {
  // Usamos nuestro nuevo hook centralizado
  const { empleados, loading } = useEmpleadoDomesticos();

  // Estados locales solo para la UI del modal
  const [selectedEmpleado, setSelectedEmpleado] =
    React.useState<EmpleadoDomestico | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  

  // Función para cargar los datos del backend
/*  const fetchEmpleados = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await obtenerEmpleadosDomesticos();
      setEmpleados(response.data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
*/
const fetchEmpleados = React.useCallback(async () => {
  try {
    setIsLoading(true);
    
    // 1. Ejecutamos tu función tal cual la tienes
    const response = await obtenerEmpleadosDomesticos();
    
    console.log("Lo que llega del back:", response.data); // <--- Agrega esto
    // 2. IMPORTANTE: Tu función devuelve { data, meta }
    // Guardamos solo 'data' en el estado de empleados
    setEmpleados(response.data); 

    

    
  } catch (error) {
    console.error("Error al cargar empleados:", error);
  } finally {
    setIsLoading(false);
  }
}, []);
  // Cargar datos al entrar a la página
  React.useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // Manejador para cuando se hace clic en editar
  const handleEditClick = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setIsModalOpen(true);
  };

  // Manejador para cerrar el modal y limpiar el seleccionado
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmpleado(null);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Mis Empleados Domésticos
          </h2>
          <p className="text-muted-foreground">
            Gestiona y actualiza los permisos de acceso de tu personal de apoyo.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600/30 border-t-amber-600" />
              <p className="text-sm text-muted-foreground">
                Cargando tu personal...
              </p>
            </div>
          </div>
        ) : (
          <TablaMisEmpleados
            items={empleados}
            isLoading={loading}
            onEditClick={handleEditClick}
          />
        )}
      </div>

      <ModalEditarEmpleado
        empleado={selectedEmpleado}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
