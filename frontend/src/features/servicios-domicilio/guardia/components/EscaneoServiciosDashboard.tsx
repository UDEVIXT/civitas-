"use client";

import { useState } from "react";
import { Camera, Clock, XCircle, CheckCircle, UserRoundPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModalValidacionServicio } from "./ModalValidacionServicio";
import { ModalRegistroManualServicio } from "./ModalRegistroManualServicio";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accesosServiciosApi } from "../api/accesos-servicios.api";
import { QrScannerPlugin } from "./QrScannerPlugin";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";

// Componente principal para el dashboard del Guardia
export function EscaneoServiciosDashboard() {
  const [selectedAccessId, setSelectedAccessId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: actividades, isLoading } = useQuery({
    queryKey: ["actividadReciente"],
    queryFn: accesosServiciosApi.obtenerActividadReciente,
  });

  const onScanSuccess = async (decodedText: string) => {
    // Si ya hay un ID seleccionado, no volvemos a procesar hasta que se cierre el modal
    if (selectedAccessId || isVerifying) return;
    
    setIsVerifying(true);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["detalleServicio", decodedText],
        queryFn: () => accesosServiciosApi.obtenerDetalleServicio(decodedText),
      });

      if (data.estado !== "VALIDO") {
        toast({
          title: `QR Inválido: ${data.estado}`,
          description: data.motivo_invalido || "El código QR escaneado no es válido.",
          variant: "destructive",
        });
      } else {
        setSelectedAccessId(decodedText);
      }
    } catch (error: any) {
      toast({
        title: "Error de validación",
        description: error.response?.data?.message || "No se pudo verificar el código QR.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const onScanError = (errorMessage: string) => {
    // El escáner suele emitir muchos errores menores al enfocar
    // Normalmente se ignoran hasta que tiene un éxito.
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedAccessId || isVerifying) return;
    
    setIsVerifying(true);
    try {
      const html5QrCode = new Html5Qrcode("hidden-qr-canvas");
      const decodedText = await html5QrCode.scanFile(file, false);
      html5QrCode.clear();
      
      // Proceso similar a onScanSuccess
      const data = await queryClient.fetchQuery({
        queryKey: ["detalleServicio", decodedText],
        queryFn: () => accesosServiciosApi.obtenerDetalleServicio(decodedText),
      });

      if (data.estado !== "VALIDO") {
        toast({
          title: `QR Inválido: ${data.estado}`,
          description: data.motivo_invalido || "El código QR escaneado no es válido.",
          variant: "destructive",
        });
      } else {
        setSelectedAccessId(decodedText);
      }
    } catch (error: any) {
      toast({
        title: "Error al escanear archivo",
        description: error.response?.data?.message || "No se pudo detectar un código QR válido en la imagen.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      // Resetear el input para permitir escanear la misma imagen si es necesario
      e.target.value = '';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Escaneo de códigos QR</h1>
        <a href="/accesos-guardia">
          <Button
            //onClick={() => setIsManualModalOpen(true)}
            className="text-foreground cursor-pointer"
          >
            <UserRoundPlus /> Registrar sin QR
          </Button>
        </a>
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
                <div className="w-full h-full bg-zinc-200 flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 [&>div]:!border-none [&>div]:!shadow-none [&>div>video]:!object-cover [&_#html5qr-code-full-region_dashboard_section_swaplink]:hidden">
                    <QrScannerPlugin
                      fps={10}
                      qrbox={250}
                      disableFlip={false}
                      qrCodeSuccessCallback={onScanSuccess}
                      qrCodeErrorCallback={onScanError}
                    />
                  </div>
                  <div className="absolute bottom-4 z-20">
                    <input 
                      type="file" 
                      id="qr-image-upload" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('qr-image-upload')?.click()} 
                      className="bg-white shadow-md font-medium text-zinc-700 hover:bg-zinc-50"
                      disabled={isVerifying}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Escanee un archivo de imagen
                    </Button>
                  </div>
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
                        {act.estado === "AUTORIZADO" ? (
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
      <div id="hidden-qr-canvas" style={{ display: 'none' }}></div>
    </div>
  );
}
