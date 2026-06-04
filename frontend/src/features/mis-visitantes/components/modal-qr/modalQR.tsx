"use client";

// Dependencies
import { useRef, useState } from "react";
import { ReactQRCode } from "@lglab/react-qr-code";

// Icons
import { Check, Share2, Download, Copy, Mail } from "lucide-react";

// Components UI
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
interface ModalQRProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue?: string;
  nombreVisitante?: string;
}

export function ModalQR({
  isOpen,
  onClose,
  qrValue = "",
  nombreVisitante = "visitante",
}: ModalQRProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [copiado, setCopiado] = useState(false);
  const [mostrarCopiaEnlace, setMostrarCopiaEnlace] = useState(false);

  const publicLink = `${window.location.origin}/bitacora/guardia?code=${qrValue}`;

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
      downloadLink.download = `qr-acceso-${nombreVisitante}.png`;
      downloadLink.click();
      toast.success("Código QR descargado con éxito.");
    } catch {
      toast.error("Error al descargar el código QR.");
    }
  };

  const handleShare = async () => {
    if (!qrValue) return;

    try {
      const shareText = `Código de acceso para el visitante: ${publicLink}`;
      const data = await getPngData();

      // Mobile Native Share
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
        return;
      }

      // Desktop WhatsApp / Manual Fallback
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
    const subject = encodeURIComponent("Código de Acceso Residencia");
    const body = encodeURIComponent(
      `Hola! Aquí tienes tu código de acceso: ${publicLink}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Abriendo tu aplicación de correo...");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="items-center">
          <div className="p-2 border-6 border-primary/10 bg-primary/20 bg-clip-padding rounded-full flex items-center justify-center text-primary">
            <Check />
          </div>
          <DialogTitle className="text-center">
            ¡Visitante guardado con éxito!
          </DialogTitle>
          <DialogDescription className="text-center max-w-80">
            El siguiente código es único para permitir el acceso de tu visitante
            a la residencia.
          </DialogDescription>
        </DialogHeader>

        <div ref={qrContainerRef} className="w-full flex justify-center py-2">
          {qrValue ? (
            <ReactQRCode value={qrValue} size={200} />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-500">
              Generando...
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 py-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrValue}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary disabled:opacity-50 transition-colors"
            title="Descargar QR"
          >
            <div className="p-2 rounded-full bg-gray-100 hover:bg-primary/10">
              <Download className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Descargar
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={!qrValue}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary disabled:opacity-50 transition-colors"
            title="Compartir QR"
          >
            <div className="p-2 rounded-full bg-gray-100 hover:bg-primary/10">
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
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary disabled:opacity-50 transition-colors"
            title="Copiar link"
          >
            <div className="p-2 rounded-full bg-gray-100 hover:bg-primary/10">
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
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary disabled:opacity-50 transition-colors"
            title="Enviar por correo"
          >
            <div className="p-2 rounded-full bg-gray-100 hover:bg-primary/10">
              <Mail className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Correo
            </span>
          </button>
        </div>

        {mostrarCopiaEnlace && (
          <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
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

        <DialogFooter>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={onClose}
          >
            Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
