"use client";

import { useRef, useState } from "react";
import { ReactQRCode } from "@lglab/react-qr-code";
import { Download, Loader2, Share2, Copy, Check, Mail } from "lucide-react";
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
  const [mostrarCopiaEnlace, setMostrarCopiaEnlace] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const qrValue = visitante?.codigo_acceso || "";
  const publicLink = `${window.location.origin}/bitacora/guardia?code=${qrValue}`;
  const qrActivo = visitante?.estatus === "Activo";
  const qrExpirado = visitante?.estatus === "Expirado";
  const puedeHabilitar = visitante?.estatus === "Inactivo";
  const puedeDeshabilitar = qrActivo;

  const getPngData = async (): Promise<{
    blob: Blob;
    dataUrl: string;
  } | null> => {
    const svgElement = qrContainerRef.current?.querySelector("svg");
    if (!svgElement) {
      toast.error("No se encontró el código QR.");
      return null;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const blobUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 220;
        canvas.height = 220;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
          } else {
            resolve({ blob, dataUrl: canvas.toDataURL("image/png") });
          }
          URL.revokeObjectURL(blobUrl);
        }, "image/png");
      };
      image.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      };
      image.src = blobUrl;
    });
  };

  const handleDownload = async () => {
    try {
      const data = await getPngData();
      if (!data) return;

      const downloadLink = document.createElement("a");
      downloadLink.href = data.dataUrl;
      downloadLink.download = `qr-acceso-${visitante?.nombre_completo || "visitante"}.png`;
      downloadLink.click();
      toast.success("Código QR descargado con éxito.");
    } catch {
      toast.error("Error al descargar el código QR.");
    }
  };

  const handleShare = async (isActive: boolean) => {
    try {
      if (!isActive) {
        toast.error(
          "Solo puedes compartir un QR activo. Habilita el QR para compartirlo.",
        );
        return;
      }

      const shareText = `Código de acceso para ${visitante?.nombre_completo}: ${publicLink}`;
      const data = await getPngData();

      // Verificar si el navegador soporta compartir archivos (Modo Mobile Nativo)
      if (
        data &&
        navigator.share &&
        (navigator as any).canShare &&
        (navigator as any).canShare({
          files: [
            new File([data.blob], "qr-acceso.png", { type: "image/png" }),
          ],
        })
      ) {
        const file = new File([data.blob], "qr-acceso.png", {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: "Código de acceso",
          text: shareText,
        });
        toast.success("Abriendo menú de compartir...");
        return;
      }

      // Si no soporta archivos (Escritorio o Navegadores Limitados), usamos WhatsApp Web/App con Link
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      const win = window.open(whatsappUrl, "_blank");

      if (!win || win.closed || typeof win.closed === "undefined") {
        setMostrarCopiaEnlace(true);
        toast.warning(
          "El navegador bloqueó la apertura de WhatsApp. Puedes copiar el enlace manualmente.",
        );
      } else {
        toast.success("Abriendo WhatsApp...");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      setMostrarCopiaEnlace(true);
      toast.error("Error al intentar compartir. Usa el enlace manual.");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiado(true);
      toast.success("Enlace copiado al portapapeles.");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace.");
    }
  };

  const handleEmailShare = () => {
    if (!qrActivo) {
      toast.error(
        "Solo puedes compartir un QR activo. Habilitá el QR para enviarlo.",
      );
      return;
    }

    const subject = encodeURIComponent("Código de Acceso Residencia");
    const body = encodeURIComponent(
      `Hola! Aquí tienes el código de acceso para ${visitante?.nombre_completo}: ${publicLink}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Abriendo tu aplicación de correo...");
  };

  const resetModal = () => {
    setAccionSeleccionada(null);
    setMotivo("");
    setMostrarCopiaEnlace(false);
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

            <div className="flex justify-center gap-4 py-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!qrValue}
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-amber-500 disabled:opacity-50 transition-colors"
                title="Descargar QR"
              >
                <div className="p-2 rounded-full bg-gray-100 hover:bg-amber-50">
                  <Download className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Descargar
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(qrActivo)}
                disabled={!qrValue}
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-amber-500 disabled:opacity-50 transition-colors"
                title="Compartir QR"
              >
                <div className="p-2 rounded-full bg-gray-100 hover:bg-amber-50">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Compartir
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!qrValue}
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-amber-500 disabled:opacity-50 transition-colors"
                title="Copiar link"
              >
                <div className="p-2 rounded-full bg-gray-100 hover:bg-amber-50">
                  {copiado ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {copiado ? "Copiado" : "Copiar"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleEmailShare}
                disabled={!qrValue}
                className="flex flex-col items-center gap-1 text-gray-500 hover:text-amber-500 disabled:opacity-50 transition-colors"
                title="Enviar por correo"
              >
                <div className="p-2 rounded-full bg-gray-100 hover:bg-amber-50">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Correo
                </span>
              </button>
            </div>

            {mostrarCopiaEnlace && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  Enlace de acceso manual:
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 truncate flex items-center">
                    {publicLink}
                  </div>
                  <Button
                    size="sm"
                    variant={copiado ? "default" : "outline"}
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={handleCopy}
                  >
                    {copiado ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

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
