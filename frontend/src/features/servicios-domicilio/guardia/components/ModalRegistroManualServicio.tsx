"use client";

import { FileText, Building, User, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ModalRegistroManualProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalRegistroManualServicio({ open, onOpenChange }: ModalRegistroManualProps) {
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleRegister = () => {
    // Aquí iría la lógica para enviar al API un registro manual si no existe.
    // CA007 menciona que si no está registrado, se debe indicar que el servicio no está autorizado,
    // o el guardia puede requerir autorización verbal del residente.
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden bg-white">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-zinc-50 border-b border-zinc-100">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <DialogHeader className="text-center px-6">
            <DialogTitle className="text-xl font-bold text-zinc-900 text-center">Registrar servicio</DialogTitle>
            <DialogDescription className="text-zinc-500 mt-1">
              Registro manual de acceso a proveedores o servicios.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-900 uppercase">Residencia a visitar</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input className="pl-9 bg-zinc-50/50" placeholder="Buscar vivienda o residente..." />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-900 uppercase">Nombre del proveedor/repartidor</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input 
                className="pl-9 bg-zinc-50/50" 
                placeholder="Ej. Juan Pérez" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-900 uppercase">Empresa / Plataforma</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input 
                className="pl-9 bg-zinc-50/50" 
                placeholder="Ej. Amazon, Uber Eats..." 
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-900 uppercase">Motivo o Descripción</label>
            <Textarea 
              className="bg-zinc-50/50 resize-none" 
              placeholder="Ej. Entrega de paquete" 
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3 p-6 pt-0 border-t border-zinc-100 bg-zinc-50/50 mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 rounded-xl"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRegister}
            className="w-full font-bold shadow-sm rounded-xl text-white bg-amber-500 hover:bg-amber-600"
            disabled={!nombre || !empresa}
          >
            Registrar Ingreso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
