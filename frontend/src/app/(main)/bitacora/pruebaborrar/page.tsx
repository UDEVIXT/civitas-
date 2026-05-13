"use client";

import React, { useState } from "react";
import { ModalSalidaProveedor } from "../../../components/layout/modals/guardia/registrosalida";
import { Button } from "@/components/ui/button"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface RegistroAcceso {
    id: number;
    empresa: string;
    tecnico: string;
    tipoServicio: string;
    propiedad: string;
    horaEntrada: string;
    metodoAcceso: string;
    estado: "dentro" | "fuera";
    horaSalida: string | null;
    guardiaSalida: string | null;
    tiempoExcedido: boolean;
}

export default function TestRegistroSalida() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAcceso, setSelectedAcceso] = useState<RegistroAcceso | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isMassModalOpen, setIsMassModalOpen] = useState(false);
    const [isMassLoading, setIsMassLoading] = useState(false);

    const GUARDIA_ACTUAL = "Guardia Turno 1 (Simulado)";

    // Datos simulados (Mocks) para llenar la tabla
    const [registros, setRegistros] = useState<RegistroAcceso[]>([
        { id: 1, empresa: "Amazon", tecnico: "Juan Pérez", tipoServicio: "Paquetería", propiedad: "Casa 12", horaEntrada: "11:30 AM", metodoAcceso: "QR", estado: "dentro", horaSalida: null, guardiaSalida: null, tiempoExcedido: false },
        { id: 2, empresa: "Telmex", tecnico: "María Gómez", tipoServicio: "Instalación", propiedad: "Casa 45", horaEntrada: "06:15 AM", metodoAcceso: "Manual", estado: "dentro", horaSalida: null, guardiaSalida: null, tiempoExcedido: true }, // Marcado como excedido
        { id: 3, empresa: "Mantenimiento Local", tecnico: "Carlos Ruiz", tipoServicio: "Plomería", propiedad: "Área Común", horaEntrada: "07:00 AM", metodoAcceso: "Lista", estado: "fuera", horaSalida: "08:00 AM", guardiaSalida: "Pedro Guardia", tiempoExcedido: false },
    ]);

    const openModal = (registro: RegistroAcceso) => {
        setSelectedAcceso(registro);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        // Si la petición (bitacoraService) fue exitosa, actualizamos visualmente la tabla
        if (selectedAcceso) {
            setRegistros(prev => prev.map(reg =>
                reg.id === selectedAcceso.id
                    ? { ...reg, estado: "fuera", horaSalida: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), guardiaSalida: GUARDIA_ACTUAL, tiempoExcedido: false }
                    : reg
            ));
        }
        setIsModalOpen(false);
        setSelectedAcceso(null);
        alert("¡Salida registrada con éxito!");
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const confirmMassExit = async () => {
        if (selectedIds.length === 0) return;
        
        setIsMassLoading(true);
        // Simulamos retardo de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const horaActual = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setRegistros(prev => prev.map(reg => 
            selectedIds.includes(reg.id) ? { ...reg, estado: "fuera", horaSalida: horaActual, guardiaSalida: GUARDIA_ACTUAL, tiempoExcedido: false } : reg
        ));
        setSelectedIds([]);
        setIsMassLoading(false);
        setIsMassModalOpen(false);
        alert(`¡Se registraron ${selectedIds.length} salidas exitosamente!`);
    };

    // Obtenemos los datos completos de los registros que fueron seleccionados
    const selectedRecordsData = registros.filter(r => selectedIds.includes(r.id));

    return (
        <div className="p-6 space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Tabla de Prueba - Bitácora</h2>
                <Button 
                    variant="destructive" 
                    disabled={selectedIds.length === 0} 
                    onClick={() => setIsMassModalOpen(true)}
                >
                    Salida Masiva ({selectedIds.length})
                </Button>
            </div>
            <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground bg-gray-100">
                        <tr>
                            <th className="p-3 border-b text-center">✓</th>
                            <th className="p-3 border-b">ID Acceso</th>
                            <th className="p-3 border-b">Empresa / Técnico</th>
                            <th className="p-3 border-b">Detalles</th>
                            <th className="p-3 border-b">Hora Entrada</th>
                            <th className="p-3 border-b">Hora Salida</th>
                            <th className="p-3 border-b">Estado</th>
                            <th className="p-3 border-b">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.map((reg) => (
                            <tr key={reg.id} className={`border-b hover:bg-gray-50 ${reg.tiempoExcedido ? 'bg-red-50' : 'bg-white'}`}>
                                <td className="p-3 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 cursor-pointer"
                                        disabled={reg.estado === "fuera"}
                                        checked={selectedIds.includes(reg.id)}
                                        onChange={() => toggleSelection(reg.id)}
                                    />
                                </td>
                                <td className="p-3">#{reg.id}</td>
                                <td className="p-3">
                                    <div className="font-semibold text-gray-900">{reg.empresa}</div>
                                    <div className="text-gray-500">{reg.tecnico}</div>
                                </td>
                                <td className="p-3">
                                    <div><span className="font-medium">Servicio:</span> {reg.tipoServicio}</div>
                                    <div><span className="font-medium">Lugar:</span> {reg.propiedad}</div>
                                    <div className="text-xs text-gray-500 mt-1">Acceso: {reg.metodoAcceso}</div>
                                </td>
                                <td className="p-3">{reg.horaEntrada}</td>
                                <td className="p-3">
                                    {reg.horaSalida ? (
                                        <div>
                                            <div>{reg.horaSalida}</div>
                                            <div className="text-xs text-gray-500 mt-1" title="Guardia en turno">👤 {reg.guardiaSalida}</div>
                                        </div>
                                    ) : "---"}
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-col gap-1 items-start">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.estado === 'dentro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {reg.estado.toUpperCase()}
                                    </span>
                                        {reg.tiempoExcedido && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                TIEMPO EXCEDIDO
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={reg.estado === "fuera"}
                                        onClick={() => openModal(reg)}
                                    >
                                        Registrar Salida
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Instancia del Modal Original */}
            <ModalSalidaProveedor
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedAcceso(null); }}
                onSuccess={handleSuccess}
                accesoId={selectedAcceso?.id}
                visitorName={selectedAcceso ? `${selectedAcceso.empresa} (${selectedAcceso.tecnico})` : undefined}
                accesoDetails={selectedAcceso}
            />

            {/* Modal para Confirmar Salida Masiva */}
            <Dialog open={isMassModalOpen} onOpenChange={(open) => !isMassLoading && setIsMassModalOpen(open)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Confirmar Salida Masiva</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Verifica que estos sean los proveedores correctos antes de registrar sus salidas.
                        </p>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                            {selectedRecordsData.map(reg => (
                                <div key={reg.id} className="p-3 border rounded-md text-sm grid grid-cols-2 gap-2 text-left bg-muted/30">
                                    <p><span className="font-medium">Empresa:</span> {reg.empresa}</p>
                                    <p><span className="font-medium">Técnico:</span> {reg.tecnico}</p>
                                    <p><span className="font-medium">Servicio:</span> {reg.tipoServicio}</p>
                                    <p><span className="font-medium">Propiedad:</span> {reg.propiedad}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsMassModalOpen(false)} disabled={isMassLoading}>Cancelar</Button>
                        <Button onClick={confirmMassExit} disabled={isMassLoading}>
                            {isMassLoading ? "Registrando salidas..." : "Confirmar Salidas"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}