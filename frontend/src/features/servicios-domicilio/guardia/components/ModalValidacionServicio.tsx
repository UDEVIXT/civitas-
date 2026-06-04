"use client";

import {
  Info,
  User,
  Clock,
  Building,
  Calendar,
  Briefcase,
  FileText,
  QrCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accesosServiciosApi } from "../api/accesos-servicios.api";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import QRCode from "react-qr-code";

interface ModalValidacionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedId: string | null;
}

export function ModalValidacionServicio({
  open,
  onOpenChange,
  scannedId,
}: ModalValidacionProps) {
  const queryClient = useQueryClient();
  const [isDenying, setIsDenying] = useState(false);
  const [denialReason, setDenialReason] = useState("");

  const {
    data: servicio,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["detalleServicio", scannedId],
    queryFn: () => accesosServiciosApi.obtenerDetalleServicio(scannedId!),
    enabled: !!scannedId && open,
    retry: 1, // Limitar reintentos para que el error de red se muestre más rápido
  });

  const validarMutation = useMutation({
    mutationFn: accesosServiciosApi.validarAcceso,
    onSuccess: () => {
      toast({
        title: "Acceso autorizado",
        description: "Entrada registrada exitosamente.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["actividadReciente"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo autorizar el acceso.",
        variant: "destructive",
      });
    },
  });

  const denegarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      accesosServiciosApi.denegarAcceso(id, motivo),
    onSuccess: (data) => {
      // El backend respondió con éxito (código 200/201)
      toast({
        title: "Desactivación exitosa",
        description: "El código QR ha sido desactivado correctamente.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["actividadReciente"] });
      setIsDenying(false);
      setDenialReason("");
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la incidencia.",
        variant: "destructive",
      });
    },
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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setIsDenying(false);
          setDenialReason("");
        }
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden bg-white">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-zinc-50 border-b border-zinc-100">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDenying ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}
          >
            <Info className="w-7 h-7" />
          </div>
          <DialogHeader className="text-center px-6">
            <DialogTitle className="text-xl font-bold text-zinc-900 text-center">
              {isDenying
                ? "¿Estás seguro de denegar el acceso?"
                : "Información del servicio"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 mt-1">
              {isDenying
                ? "Confirmación de rechazo de entrada"
                : "Detalles del servicio registrado"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className={`px-6 pt-6 ${isDenying ? "pb-2" : "pb-4"}`}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8 px-4 flex flex-col items-center gap-2">
              <span className="font-bold text-lg">Error de validación</span>
              <span className="text-sm">
                {(error as any)?.response?.data?.message ||
                  "No se pudo verificar el código QR. Por favor, intenta de nuevo o verifica manualmente."}
              </span>
            </div>
          ) : !servicio ? (
            <div className="text-center text-zinc-500 py-8">
              No se encontró información del servicio.
            </div>
          ) : isDenying ? (
            <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in zoom-in-95">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-zinc-100">
                <QRCode value={scannedId || ""} size={160} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-zinc-600 px-4 text-justify font-bold">
                  Al finalizar el acceso, se registrará la salida del visitante
                  y el código QR quedará desactivado por lo que no podrá volver
                  a utilizarse.
                </p>
              </div>
              <div className="w-full mt-2 space-y-2">
                <label className="text-xs font-semibold text-zinc-900 uppercase mb-0.5">
                  Motivo de finalización
                </label>
                <Textarea
                  placeholder="Ej. La identificación no coincide con la registrada"
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Nombre
                </span>
                <span className="font-semibold text-zinc-900">
                  {servicio.nombre_repartidor}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Empresa
                </span>
                <span className="font-semibold text-zinc-900">
                  {servicio.empresa}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3 h-3" /> Residente vinculado
                </span>
                <span className="font-semibold text-zinc-900">
                  {servicio.residente_vinculado} (Vivienda {servicio.vivienda})
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha Expiración
                </span>
                <span className="font-semibold text-zinc-900">
                  {servicio.fecha_expiracion
                    ? new Date(servicio.fecha_expiracion).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 mt-2">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Tipo de servicio
                </span>
                <span className="font-semibold text-zinc-900">
                  {servicio.tipo_servicio}
                </span>
              </div>
              {servicio.detalles_adicionales?.motivo && (
                <div className="col-span-2 flex flex-col gap-1 mt-2">
                  <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3 h-3" /> Motivo de visita
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {servicio.detalles_adicionales.motivo}
                  </span>
                </div>
              )}

              {servicio.estado !== "VALIDO" && (
                <div className="col-span-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-1">
                  <span className="font-bold text-red-700 text-sm">
                    QR Inválido: {servicio.estado}
                  </span>
                  <span className="text-red-600 text-sm">
                    {servicio.motivo_invalido}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter
          className={`grid grid-cols-2 gap-3 p-6 pt-0 border-t border-zinc-100 bg-zinc-50/50 ${isDenying ? "mt-0" : "mt-2"}`}
        >
          <Button
            variant="outline"
            onClick={() => (isDenying ? setIsDenying(false) : handleDenegar())}
            className="w-full bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-red-600 rounded-xl"
            disabled={
              validarMutation.isPending ||
              (isDenying && denialReason.trim().length < 5)
            }
          >
            {isDenying ? "Cancelar" : "Denegar acceso"}
          </Button>
          <Button
            onClick={isDenying ? handleDenegar : handleValidar}
            className={`w-full font-bold shadow-sm rounded-xl text-white ${
              isDenying
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
            disabled={
              isLoading ||
              !servicio ||
              validarMutation.isPending ||
              denegarMutation.isPending ||
              (!isDenying && servicio?.estado !== "VALIDO")
            }
          >
            {isDenying ? "Confirmar Rechazo" : "Aceptar acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
