"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";

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
            await bitacoraService.registrarSalida(registro.id.toString(), comentario);
            toast.success("Salida registrada", {
                description: `Se registró correctamente la salida de ${registro.nombre}.`
            });
            onSuccess();
        } catch (error) {
            toast.error("Error al registrar la salida", {
                description: "Ocurrió un error al registrar la salida. Por favor, intenta nuevamente.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-md rounded-lg p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Confirmar Salida</DialogTitle>
                    <DialogDescription className="sr-only">
                        Confirmar la salida de esta persona de la bitácora.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-3 space-y-3 text-sm">
                    <p className="text-muted-foreground">
                        ¿Estás seguro que deseas registrar la salida de esta persona?
                    </p>

                    <div className="p-3 border rounded-md bg-muted/30 space-y-1.5">
                        <p><span className="font-medium">Nombre:</span>{" "}
                            <span className="text-muted-foreground">{registro.nombre}</span>
                        </p>
                        <p><span className="font-medium">Tipo:</span>{" "}
                            <span className="text-muted-foreground">
                                {registro.tipo_persona?.replace("_", " ")}
                            </span>
                        </p>
                        {registro.residente_asociado?.nombre &&
                            registro.residente_asociado.nombre !== "-" && (
                                <p><span className="font-medium">Residente Asociado:</span>{" "}
                                    <span className="text-muted-foreground">
                                        {registro.residente_asociado.nombre}
                                    </span>
                                </p>
                            )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Motivo o nota del guardia
                        </label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Escribe un comentario sobre la salida (opcional)..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto cursor-pointer">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={isLoading} className="w-full sm:w-auto cursor-pointer">
                        {isLoading ? "Registrando..." : "Confirmar Salida"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}