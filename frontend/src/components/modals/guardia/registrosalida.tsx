//ModalSalidaProveedor.tsx
import React, { useState } from "react";
import { bitacoraService } from "@/services/bitacora.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    accesoId?: number | null;
    visitorName?: string;
    accesoDetails?: Record<string, any> | null;
}

export function ModalSalidaProveedor({ isOpen, onClose, onSuccess, accesoId, visitorName, accesoDetails }: Props) {
    // Asumiendo que el guardia ingresa el ID del acceso o escanea el QR
    const [inputId, setInputId] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSalida = async () => {
        const targetId = accesoId || Number(inputId);
        if (!targetId) {
            toast.error("Por favor, proporciona un ID de acceso válido.", {
                description: "Debes proporcionar un ID de acceso válido para registrar la salida.",
            });
            return;
        }

        setLoading(true);
        setError("");
        try {
            // SIMULACIÓN LOCAL: Comentamos la llamada real temporalmente
            // await bitacoraService.registerExit(targetId, notes);
            
            // Simulamos un retraso de 1 segundo para ver el estado "Registrando..."
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            onSuccess(); // Cerramos el modal y actualizamos tabla
            setInputId("");
            setNotes("");
        } catch (err: any) {
            const status = err.response?.status;
            const apiMessage = err.response?.data?.message || err.response?.data?.error;
            
            // CA007: Ya tiene salida registrada
            if (status === 400 && typeof apiMessage === "string" && apiMessage.toLowerCase().includes("salida")) {
                toast.error("El proveedor ya tiene una salida registrada previamente.", {
                    description: "No se puede registrar la salida porque ya existe una salida registrada para este proveedor.",
                });
            } 
            // CA06: Problema técnico (falla de red o de carga)
            else if (!err.response) {
                toast.error("Problema técnico: Fallo de red. Verifica tu conexión e intenta nuevamente.", {
                    description: "No se pudo registrar la salida debido a un problema técnico. Verifica tu conexión o intenta más tarde.",
                });
            } 
            // CA06: Datos incompletos o falla genérica
            else {
                toast.error(apiMessage || "Datos incompletos o error técnico al registrar la salida.", {
                    description: apiMessage || "No se pudo registrar la salida debido a datos incompletos o un error técnico. Verifica la información e intenta nuevamente.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setError("");
                setNotes("");
                setInputId("");
                onClose();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar salida de proveedor</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">Verifica la información antes de confirmar la salida.</p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {accesoId ? (
                        <div className="p-3 bg-muted rounded-md border">
                            <p className="text-sm text-muted-foreground">Se registrará la salida para:</p>
                            <p className="font-semibold text-lg">{visitorName || `Registro #${accesoId}`}</p>
                            {accesoDetails && (
                                <div className="mt-2 text-sm grid grid-cols-2 gap-2 text-left bg-white p-2 rounded border">
                                    <p><span className="font-medium">Empresa:</span> {accesoDetails.empresa}</p>
                                    <p><span className="font-medium">Técnico:</span> {accesoDetails.tecnico}</p>
                                    <p><span className="font-medium">Servicio:</span> {accesoDetails.tipoServicio}</p>
                                    <p><span className="font-medium">Propiedad:</span> {accesoDetails.propiedad}</p>
                                    <p><span className="font-medium">Hora Entrada:</span> {accesoDetails.horaEntrada}</p>
                                    <p><span className="font-medium">Método:</span> {accesoDetails.metodoAcceso}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ID de acceso o código QR</label>
                            <Input
                                placeholder="Ej. 1024..."
                                value={inputId}
                                onChange={(e) => setInputId(e.target.value)}
                                type="number"
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notas del guardia (Opcional)</label>
                        <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ej. El proveedor entregó los paquetes a tiempo..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSalida} disabled={loading || (!accesoId && !inputId)}>
                        {loading ? "Registrando..." : "Confirmar Salida"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
