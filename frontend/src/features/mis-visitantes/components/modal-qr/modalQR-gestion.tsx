"use client";

import { useRef, useState } from "react";
import { ReactQRCode } from "@lglab/react-qr-code";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { AccionQrVisitante, Visitante } from "../../types";

interface ModalQRGestionProps {
  isOpen: boolean;
  visitante: Visitante | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmAction: (
    visitante: Visitante,
    accion: AccionQrVisitante,
    motivo?: string,
  ) => Promise<void>;
}

export function ModalQRGestion({
  isOpen,
  visitante,
  isLoading = false,
  onClose,
  onConfirmAction,
}: ModalQRGestionProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [accionSeleccionada, setAccionSeleccionada] =
    useState<AccionQrVisitante | null>(null);
  const [motivo, setMotivo] = useState("");

  const qrValue = visitante?.codigo_acceso || "";
  const qrActivo = visitante?.estatus === "Activo";
  const qrExpirado = visitante?.estatus === "Expirado";
  const puedeHabilitar = visitante?.estatus === "Inactivo";
  const puedeDeshabilitar = qrActivo;

  const handleShare = async () => {
    try {
      const svgElement = qrContainerRef.current?.querySelector("svg");

      if (!svgElement) {
        toast.error("No se encontro el codigo QR para compartir.");
        return;
      }

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const blobUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 220;
        canvas.height = 220;
        const context = canvas.getContext("2d");

        if (!context) return;

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const file = new File([blob], "codigo-acceso.png", {
            type: "image/png",
          });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Codigo de acceso",
              text: "Codigo QR de acceso para la residencia.",
            });
          } else {
            const downloadLink = document.createElement("a");
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.download = "codigo-acceso.png";
            downloadLink.click();
            toast.warning("Se descargo el QR para compartirlo manualmente.");
          }
        }, "image/png");
      };

      image.src = blobUrl;
    } catch {
      toast.error("Error al compartir el codigo QR.");
    }
  };

  const resetModal = () => {
    setAccionSeleccionada(null);
    setMotivo("");
  };

  const handleConfirm = async () => {
    if (!visitante || !accionSeleccionada) return;

    if (accionSeleccionada === "deshabilitar" && !motivo.trim()) {
      toast.error("Escribe el motivo para deshabilitar el QR.");
      return;
    }

    await onConfirmAction(visitante, accionSeleccionada, motivo.trim());
    setAccionSeleccionada(null);
    setMotivo("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) {
          resetModal();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        {!accionSeleccionada ? (
          <>
            <DialogHeader className="items-center text-center">
              <DialogTitle className="text-base font-bold text-amber-500">
                Que deseas hacer?
              </DialogTitle>
              <DialogDescription className="sr-only">
                Gestionar estado del codigo QR del visitante frecuente.
              </DialogDescription>
            </DialogHeader>

            <div ref={qrContainerRef} className="flex justify-center py-2">
              {qrValue ? (
                <ReactQRCode value={qrValue} size={170} />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-gray-50 text-center text-sm text-gray-500">
                  Sin codigo QR
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-600"
                onClick={handleShare}
                disabled={!qrValue}
                title="Compartir QR"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {qrExpirado && (
              <p className="text-center text-sm text-amber-600">
                Este QR ya expiro. Genera un nuevo codigo para volver a usarlo.
              </p>
            )}

            <DialogFooter className="grid grid-cols-2 gap-3 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAccionSeleccionada("habilitar")}
                disabled={!puedeHabilitar || !qrValue}
                className="w-full"
              >
                Habilitar
              </Button>
              <Button
                type="button"
                onClick={() => setAccionSeleccionada("deshabilitar")}
                disabled={!puedeDeshabilitar || !qrValue}
                className="w-full bg-amber-500 text-white hover:bg-amber-600"
              >
                Deshabilitar
              </Button>
            </DialogFooter>

            {qrActivo && (
              <p className="text-center text-xs text-gray-500">
                El QR esta activo y listo para validacion de acceso.
              </p>
            )}
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="text-lg font-semibold">
                {accionSeleccionada === "habilitar"
                  ? "Habilitar QR"
                  : "Deshabilitar QR"}
              </DialogTitle>
              <DialogDescription>
                {accionSeleccionada === "habilitar"
                  ? `Se volvera a activar el QR de ${visitante?.nombre_completo}.`
                  : `Indica por que se dara de baja el QR de ${visitante?.nombre_completo}.`}
              </DialogDescription>
            </DialogHeader>

            {accionSeleccionada === "deshabilitar" && (
              <Textarea
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Ej. Ya no se autoriza el acceso de este visitante."
                className="min-h-24 resize-none"
                disabled={isLoading}
              />
            )}

            <DialogFooter className="grid grid-cols-2 gap-3 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetModal}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
