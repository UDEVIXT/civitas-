"use client";

import { useState } from "react";
import { Camera, Clock, XCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModalValidacionServicio } from "./ModalValidacionServicio";
import { ModalRegistroManualServicio } from "./ModalRegistroManualServicio";
import { useQuery } from "@tanstack/react-query";
import { accesosServiciosApi } from "../api/accesos-servicios.api";

// Componente principal para el dashboard del Guardia
export function EscaneoServiciosDashboard() {
  const [selectedAccessId, setSelectedAccessId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(true);

  const { data: actividades, isLoading } = useQuery({
    queryKey: ["actividadReciente"],
    queryFn: accesosServiciosApi.obtenerActividadReciente,
  });


  const handleSimulateScan = () => {
    setSelectedAccessId("mock-scan-id");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Escaneo de códigos QR</h1>
        <Button
          onClick={() => setIsManualModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
        >
          Registrar sin QR
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Central/Izquierdo - Escáner */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="overflow-hidden border-zinc-200 shadow-sm flex flex-col h-[600px] bg-zinc-50 relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-zinc-900/80 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Escáner - Entrada 1
            </div>

            <CardContent className="p-0 flex-1 flex items-center justify-center relative">
              {isScannerActive ? (
                <div className="w-full h-full bg-zinc-200 flex flex-col items-center justify-center border-4 border-dashed border-zinc-300">
                  <Camera className="w-16 h-16 text-zinc-400 mb-4" />
                  <p className="text-zinc-500 font-medium mb-4">Esperando código QR o Identificación...</p>
                  <Button variant="outline" onClick={handleSimulateScan}>
                    Simular Escaneo Exitoso
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <p className="text-zinc-400">Escáner Desactivado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        { }
        <div className="flex flex-col gap-4">
          <Card className="border-zinc-200 shadow-sm h-full flex flex-col">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <Clock className="w-5 h-5 text-amber-500" />
                Actividad reciente
              </div>
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 font-medium">
                ÚLTIMOS 5
              </Badge>
            </div>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="flex flex-col divide-y divide-zinc-100">
                {isLoading ? (
                  <div className="p-8 text-center text-zinc-500">Cargando...</div>
                ) : (actividades || []).length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">No hay actividad reciente</div>
                ) : (
                  actividades?.map((act) => (
                    <div key={act.id} className="p-4 hover:bg-zinc-50 transition-colors flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {act.nombre_repartidor}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          Hospedado por: {act.residente_vinculado}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {act.tiempo_transcurrido}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {act.estado === "ENTRADA" ? (
                          <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 rounded-full text-[11px] font-bold">
                            AUTORIZADO
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 hover:bg-red-100 text-red-700 border-none px-2 py-0.5 rounded-full text-[11px] font-bold gap-1 flex items-center">
                            <XCircle className="w-3 h-3" />
                            RECHAZADO
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ModalValidacionServicio
        open={!!selectedAccessId}
        onOpenChange={(isOpen) => !isOpen && setSelectedAccessId(null)}
        scannedId={selectedAccessId}
      />

      <ModalRegistroManualServicio
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
      />
    </div>
  );
}
