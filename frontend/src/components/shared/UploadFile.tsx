"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

// Icons
import { Upload, X, ImageIcon, AlertCircle, File as FileIcon, FileText, Camera, Image as ImageIcon2, RefreshCw } from "lucide-react";

// Components UI
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MAX_ITEMS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const uploadConfig = {
    image: {
        accept: "image/png, image/jpeg",
        types: ["image/jpeg", "image/png"],
        label: "imagen",
        icon: <ImageIcon className="h-5 w-5" />,
    },
    file: {
        accept: ".pdf, .doc, .docx",
        types: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        label: "archivo",
        icon: <FileIcon className="h-5 w-5" />,
    },
    both: {
        accept: "image/png, image/jpeg, .pdf, .doc, .docx",
        types: [
            "image/jpeg", "image/png", 
            "application/pdf", "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],
        label: "multimedia",
        icon: <Upload className="h-5 w-5" />,
    }
};

interface UploadedItem {
    id: string;
    file: File;
    preview?: string;
    isImage: boolean;
}

export interface ImageUploadProps {
    type: "image" | "file" | "both";
    onDataChange?: (files: File[]) => void;
    label?: string;
}

export function ImageUpload({ type, onDataChange, label }: ImageUploadProps) {
    const [items, setItems] = useState<UploadedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showCameraDialog, setShowCameraDialog] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const config = uploadConfig[type];

    const handleProcessFile = useCallback((file: File) => {
        if (items.length >= MAX_ITEMS) {
            setError(`Límite alcanzado (${MAX_ITEMS} ítems)`);
            return;
        }

        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const isValid = config.types.includes(file.type) || config.accept.includes(fileExtension);

        if (!isValid) {
            setError(`Formato no válido.`);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(`El archivo excede el tamaño máximo de 10MB.`);
            return;
        }

        setError(null);
        const isImage = file.type.startsWith("image/");

        if (isImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newItem: UploadedItem = {
                    id: crypto.randomUUID(),
                    file: file,
                    preview: reader.result as string,
                    isImage: true
                };
                setItems(prev => {
                    const updated = [...prev, newItem];
                    if (onDataChange) onDataChange(updated.map(i => i.file));
                    return updated;
                });
            };
            reader.readAsDataURL(file);
        } else {
            const newItem: UploadedItem = { id: crypto.randomUUID(), file: file, isImage: false };
            setItems(prev => {
                const updated = [...prev, newItem];
                if (onDataChange) onDataChange(updated.map(i => i.file));
                return updated;
            });
        }
    }, [items.length, config, onDataChange]);

    const removeItem = (id: string) => {
        const updated = items.filter((i) => i.id !== id);
        setItems(updated);
        if (onDataChange) onDataChange(updated.map(i => i.file));
    };

    const handleOpenGallery = () => {
        setShowDialog(false);
        galleryInputRef.current?.click();
    };

    const handleOpenCamera = async () => {
        setShowDialog(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            setCameraStream(stream);
            setShowCameraDialog(true);
            
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(err => {
                            console.error('Error al reproducir video:', err);
                        });
                    };
                }
            }, 300);
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            setError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const switchCamera = async () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        
        const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newFacingMode);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: newFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            setCameraStream(stream);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(err => {
                        console.error('Error al reproducir video:', err);
                    });
                };
            }
        } catch (error) {
            console.error('Error al cambiar de cámara:', error);
        }
    };

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    useEffect(() => {
        if (!showCameraDialog && cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    }, [showCameraDialog, cameraStream]);

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCameraDialog(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
                            type: 'image/jpeg'
                        });
                        handleProcessFile(file);
                        stopCamera();
                    }
                }, 'image/jpeg', 0.95);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    return (
        <div className="space-y-3 w-full pb-2">
            <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">{label || `Subir ${config.label}`}</Label>
                <span className="text-xs text-muted-foreground font-medium">
                    {items.length} / {MAX_ITEMS}
                </span>
            </div>

            {items.length < MAX_ITEMS && (
                <Card 
                    className={`relative transition-all hover:bg-accent/50 border-dashed cursor-pointer
                    ${error ? "border-destructive" : "border-muted-foreground/20"}`}
                    onClick={() => setShowDialog(true)}
                >
                    <div className="px-6 py-4 flex flex-col gap-2 items-center justify-center text-center">
                        <div className="p-2 border-4 border-neutral-100 bg-neutral-200 bg-clip-padding rounded-full flex items-center justify-center text-neutral-800">
                            {config.icon}
                        </div>
                        <p className="text-xs font-medium">Haz clic para subir o arrastra y suelta tu {config.label}</p>
                        
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            {config.accept
                              .split(',')
                              .map(t => t.trim().replace('.', '').replace('image/', ''))
                              .join(' o ')
                            }
                        </p>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-3 gap-3 mt-2">
                {items.map((item) => (
                    <div key={item.id} className="relative group aspect-square rounded-xl border bg-card overflow-hidden shadow-sm">
                        <div className="absolute top-1 right-1 z-20">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-5 w-5 rounded-full"
                              onClick={() => removeItem(item.id)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>

                        {item.isImage ? (
                            <img
                              src={item.preview}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-2 bg-muted/20">
                                <div className="p-2 border-4 border-primary/10 bg-primary/20 bg-clip-padding rounded-full flex items-center justify-center text-primary mb-1">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] font-medium truncate w-full text-center px-1">
                                    {item.file.name}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>¿Cómo quieres subir tu {config.label}?</DialogTitle>
                        <DialogDescription>
                            Elige entre tomar una foto con la cámara o seleccionar un archivo de tu galería
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Button
                            variant="outline"
                            className="flex flex-col gap-2 h-32 hover:bg-accent cursor-pointer"
                            onClick={handleOpenCamera}
                            disabled={type === "file"}
                        >
                            <Camera />
                            <span className="text-sm font-medium">Cámara</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex flex-col gap-2 h-32 hover:bg-accent cursor-pointer"
                            onClick={handleOpenGallery}
                        >
                            <ImageIcon2 />
                            <span className="text-sm font-medium">Galería/Archivos</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <input
                ref={galleryInputRef}
                type="file"
                className="hidden"
                accept={config.accept}
                multiple={type === "image" || type === "both" || type === "file"}
                onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    if (items.length + selectedFiles.length > MAX_ITEMS) {
                        setError(`No puedes subir más de ${MAX_ITEMS} imágenes en total.`);
                        return;
                    }
                    selectedFiles.forEach(file => handleProcessFile(file));
                    e.target.value = "";
                }}
            />

            <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tomar foto</DialogTitle>
                        <DialogDescription>
                            Usa la cámara para capturar una foto. Puedes cambiar entre cámara frontal y trasera
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="relative bg-black rounded-lg overflow-hidden min-h-75">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70"
                                onClick={switchCamera}
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={stopCamera}>
                                Cancelar
                            </Button>
                            <Button onClick={capturePhoto}>
                                <Camera className="h-4 w-4" />
                                Capturar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}