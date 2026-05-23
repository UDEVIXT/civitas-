"use client";

// Dependencies
import { useRef } from "react";
import { ReactQRCode } from "@lglab/react-qr-code";

// Icons
import { Check, Share2 } from 'lucide-react';

// Components UI
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
interface ModalQRProps {
    isOpen: boolean;
    onClose: () => void;
    qrValue?: string; 
}

export function ModalQR({ isOpen, onClose, qrValue = "hola" }: ModalQRProps) {
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        try {
            const svgElement = qrContainerRef.current?.querySelector("svg");

            if (!svgElement) {
                toast.error("No se encontró el código QR para compartir.");
                return;
            }

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const URL = window.URL || window.webkitURL || window;
            const blobURL = URL.createObjectURL(svgBlob);

            const image = new Image();
            image.onload = async () => {
                const canvas = document.createElement("canvas");
                canvas.width = 220;
                canvas.height = 220;
                const context = canvas.getContext("2d");
                
                if (context) {
                    context.fillStyle = "#ffffff";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0);

                    canvas.toBlob(async (blob) => {
                        if (!blob) return;

                        const file = new File([blob], "codigo-acceso.png", { type: "image/png" });

                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'Código de Acceso',
                                text: 'Aquí tienes tu código QR de acceso. Usalo para que te permitan el acceso a la residencia.',
                            });
                        } else {
                            const downloadLink = document.createElement("a");
                            
                            downloadLink.href = canvas.toDataURL("image/png");
                            downloadLink.download = "codigo-acceso.png";
                            downloadLink.click();

                            toast.warning(
                                "Tu navegador no soporta compartir directamente. Se ha descargado la imagen para que la envíes manualmente."
                            );
                        }
                    }, "image/png");
                }
            };
            
            image.src = blobURL;

        } catch (error) {
            toast.error("Error al compartir el código QR. Inténtalo nuevamente.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader className="items-center">
                    <div className="p-2 border-6 border-primary/10 bg-primary/20 bg-clip-padding rounded-full flex items-center justify-center text-primary">
                        <Check />
                    </div>
                    <DialogTitle className="text-center">¡Visitante guardado con éxito!</DialogTitle>
                    <DialogDescription className="text-center max-w-80">
                        El siguiente código es único para permitir el acceso de tu visitante a la residencia.
                    </DialogDescription>
                </DialogHeader>
                
                <div ref={qrContainerRef} className="w-full flex justify-center">
                    <ReactQRCode value={qrValue} size={220} />
                </div>
                
                <DialogFooter>
                    <Button variant="outline" className="cursor-pointer" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button onClick={handleShare} className="text-foreground cursor-pointer">
                        <Share2 /> Compartir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}