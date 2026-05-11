"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, ImageIcon, AlertCircle, File as FileIcon, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_ITEMS = 3;

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
    
    const config = uploadConfig[type];

    const handleProcessFile = useCallback((file: File) => {
        if (items.length >= MAX_ITEMS) {
            setError(`Límite alcanzado (${MAX_ITEMS} ítems)`);
            return;
        }

        // Validación de tipo mejorada
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const isValid = config.types.includes(file.type) || config.accept.includes(fileExtension);

        if (!isValid) {
            setError(`Formato no válido.`);
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

    return (
        <div className="space-y-3 w-full pb-2">
            <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">{label || `Subir ${config.label}`}</Label>
                <span className="text-xs text-muted-foreground font-medium">
                    {items.length} / {MAX_ITEMS}
                </span>
            </div>

            {items.length < MAX_ITEMS && (
                <Card className={`relative transition-all hover:bg-accent/50 border-dashed
                    ${error ? "border-destructive" : "border-muted-foreground/20"}`}>
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

                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          accept={config.accept}
                          multiple={type === "both"}
                          onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => handleProcessFile(file));
                              e.target.value = "";
                          }}
                        />
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
        </div>
    );
}