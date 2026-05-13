"use client";

import * as React from "react";
// Importaciones a tu nueva carpeta (ya en minúsculas)
import { TablaMisEmpleados } from "@/features/residente_empleados/residente/components/TablaMisEmpleados";
import { ModalEditarEmpleado } from "@/features/residente_empleados/residente/components/ModalEditarEmpleado";
import type { EmpleadoDomestico } from "@/features/empleados-domesticos/types";

export default function MisEmpleadosPage() {
  // 1. Dejamos los estados de la UI
  const [selectedEmpleado, setSelectedEmpleado] = React.useState<EmpleadoDomestico | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // 2. Tus datos de prueba (Mock Data)
  // Nota: Les agregué campos extras que suelen venir del back para que TS no chille
  const datosDePrueba: EmpleadoDomestico[] = [
    { 
      id: "1", 
      nombre: "Juan Pérez", 
      estado: "Activo", 
      horarioAutorizado: "08:00 - 16:00", 
      telefono: "9711234567",
      activo: true 
    },
    { 
      id: "2", 
      nombre: "María Sosa", 
      estado: "Inactivo", 
      horarioAutorizado: "10:00 - 18:00", 
      telefono: "9719876543",
      activo: false 
    }
  ];

  const handleEditClick = (empleado: EmpleadoDomestico) => {
    setSelectedEmpleado(empleado);
    setIsModalOpen(true);
  };

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
            Gestión de personal para Residentes (Vista de Prueba)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mostramos directamente la tabla con los datos de prueba */}
        <TablaMisEmpleados
          items={datosDePrueba}
          isLoading={false} 
          onEditClick={handleEditClick}
        />
      </div>

      {/* El modal ahora recibirá los datos de Juan o María al hacer clic */}
      <ModalEditarEmpleado
        empleado={selectedEmpleado}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          console.log("¡Simulación de guardado exitosa!");
          handleCloseModal();
        }}
      />
    </div>
  );
}