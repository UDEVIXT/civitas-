"use client";

import { Info, User, Clock, Building, Calendar, Briefcase, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accesosServiciosApi } from "../api/accesos-servicios.api";
import { toast } from "@/components/ui/toast/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ModalValidacionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedId: string | null;
}

export function ModalValidacionServicio({ open, onOpenChange, scannedId }: ModalValidacionProps) {
  const queryClient = useQueryClient();
  const [isDenying, setIsDenying] = useState(false);
  const [denialReason, setDenialReason] = useState("");

  const { data: servicio, isLoading } = useQuery({
    queryKey: ["detalleServicio", scannedId],
    queryFn: () => accesosServiciosApi.obtenerDetalleServicio(scannedId!),
    enabled: !!scannedId && open,
  });

  const validarMutation = useMutation({
    mutationFn: accesosServiciosApi.validarAcceso,
    onSuccess: () => {
      toast({ title: "Acceso autorizado", description: "Entrada registrada exitosamente.", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["actividadReciente"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo autorizar el acceso.", variant: "destructive" });
    }
  });

  const denegarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string, motivo: string }) => accesosServiciosApi.denegarAcceso(id, motivo),
    onSuccess: () => {
      toast({ title: "Acceso denegado", description: "Incidencia registrada: Datos no coinciden.", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["actividadReciente"] });
      setIsDenying(false);
      setDenialReason("");
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo registrar la incidencia.", variant: "destructive" });
    }
  });

  const handleValidar = () => {
    if (scannedId) validarMutation.mutate(scannedId);
  };

  const handleDenegar = () => {
    if (!isDenying) {
      setIsDenying(true);
      return;
    }
    if (scannedId && denialReason.trim().length >= 5) {
      denegarMutation.mutate({ id: scannedId, motivo: denialReason });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        setIsDenying(false);
        setDenialReason("");
      }
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden bg-white">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-zinc-50 border-b border-zinc-100">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Info className="w-7 h-7" />
          </div>
          <DialogHeader className="text-center px-6">
            <DialogTitle className="text-xl font-bold text-zinc-900 text-center">Información del servicio</DialogTitle>
            <DialogDescription className="text-zinc-500 mt-1">
              Detalles del servicio registrado
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : !servicio ? (
            <div className="text-center text-zinc-500 py-8">No se encontró información del servicio.</div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" /> Nombre</span>
                <span className="font-semibold text-zinc-900">{servicio.nombre_repartidor}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Briefcase className="w-3 h-3" /> Empresa</span>
                <span className="font-semibold text-zinc-900">{servicio.empresa}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Building className="w-3 h-3" /> Residente vinculado</span>
                <span className="font-semibold text-zinc-900">{servicio.residente_vinculado} (Vivienda {servicio.vivienda})</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</span>
                <span className="font-semibold text-zinc-900">{servicio.fecha_programada}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1 mt-2">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1"><FileText className="w-3 h-3" /> Tipo de servicio</span>
                <span className="font-semibold text-zinc-900">{servicio.tipo_servicio}</span>
              </div>
              
              {isDenying && (
                <div className="col-span-2 mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-semibold text-zinc-900 uppercase">Motivo del rechazo</label>
                  <Textarea 
                    placeholder="Ej. La identificación no coincide con la registrada"
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3 p-6 pt-0 border-t border-zinc-100 bg-zinc-50/50 mt-2">
          <Button 
            variant="outline" 
            onClick={() => isDenying ? setIsDenying(false) : handleDenegar()}
            className="w-full bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-red-600 rounded-xl"
            disabled={validarMutation.isPending || (isDenying && denialReason.trim().length < 5)}
          >
            {isDenying ? "Cancelar" : "Denegar acceso"}
          </Button>
          <Button 
            onClick={isDenying ? handleDenegar : handleValidar}
            className={`w-full font-bold shadow-sm rounded-xl text-white ${
              isDenying ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
            }`}
            disabled={isLoading || !servicio || validarMutation.isPending || denegarMutation.isPending}
          >
            {isDenying ? "Confirmar Rechazo" : "Aceptar acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
