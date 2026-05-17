"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// Importamos tu modal desde la ruta real que mostraste
import { ModalSalidaProveedor } from "@/components/modals/guardia/registrosalida";

export function BotonRegistrarSalida() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRegistroExitoso = () => {
        setIsModalOpen(false);
        // Opcional: Aquí podrías agregar lógica para recargar la tabla
        // Si usas un gestor de estado global (Zustand) o React Query/SWR, aquí harías el refetch.
    };

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)} variant="default" className="cursor-pointer">
                Registrar Salida
            </Button>

            <ModalSalidaProveedor
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegistroExitoso}
            />
        </>
    );
}
