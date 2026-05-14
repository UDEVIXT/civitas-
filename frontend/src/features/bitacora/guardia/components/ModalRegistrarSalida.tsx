//ModalRegistrarSalida.tsx

"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BitacoraRegistro } from "../api/bitacora";
import { bitacoraService } from "@/services/bitacora.service";

interface ModalRegistrarSalidaProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    registro: BitacoraRegistro;
}

export function ModalRegistrarSalida({
    isOpen,
    onClose,
    onSuccess,
    registro,
}: ModalRegistrarSalidaProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [comentario, setComentario] = useState("");

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            // Llamada real al backend para registrar la salida
            await bitacoraService.registrarSalida(registro.id.toString(), comentario);

            onSuccess(); // Esto cerrará el modal y refrescará la tabla en la página principal
        } catch (error) {
            console.error("Error al registrar salida:", error);
            alert("Ocurrió un error al registrar la salida");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirmar Salida</DialogTitle>
                    <DialogDescription className="sr-only">
                        Confirmar la salida de esta persona de la bitácora.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3 text-sm">
                    <p className="text-muted-foreground mb-4">
                        ¿Estás seguro que deseas registrar la salida de esta persona?
                    </p>

                    <div className="p-3 border rounded-md bg-muted/30 grid grid-cols-1 gap-2 text-left">
                        <p><span className="font-medium">Nombre:</span> {registro.nombre}</p>
                        <p><span className="font-medium">Tipo:</span> {registro.tipo_persona?.replace("_", " ")}</p>
                        {registro.residente_asociado?.nombre && registro.residente_asociado.nombre !== "-" && (
                            <p><span className="font-medium">Residente Asociado:</span> {registro.residente_asociado.nombre}</p>
                        )}
                    </div>

                    <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium">Motivo o nota del guardia</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Escribe un comentario sobre la salida (opcional)..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Registrando..." : "Confirmar Salida"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}