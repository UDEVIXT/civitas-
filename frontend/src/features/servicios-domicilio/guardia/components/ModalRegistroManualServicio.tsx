"use client";

import { FileText, Building, User, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accesosServiciosApi } from "../api/accesos-servicios.api";
import { useToast } from "@/hooks/use-toast";

interface ModalRegistroManualProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalRegistroManualServicio({ open, onOpenChange }: ModalRegistroManualProps) {
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [motivo, setMotivo] = useState("");
  const [vivienda, setVivienda] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registroMutation = useMutation({
    mutationFn: accesosServiciosApi.registrarIngresoManual,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actividadReciente"] });
      toast({
        title: "Registro exitoso",
        description: "El servicio a domicilio manual ha sido registrado correctamente.",
      });
      setNombre("");
      setEmpresa("");
      setMotivo("");
      setVivienda("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al registrar",
        description: error.response?.data?.message || error.message || "Ocurrió un error inesperado al intentar registrar.",
        variant: "destructive",
      });
    }
  });

  const handleRegister = () => {
    registroMutation.mutate({
      nombre,
      empresa,
      motivo,
      vivienda
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !registroMutation.isPending && onOpenChange(isOpen)}>
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
              <Input 
                className="pl-9 bg-zinc-50/50" 
                placeholder="Ej. Casa 42" 
                value={vivienda}
                onChange={(e) => setVivienda(e.target.value)}
              />
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
            <label className="text-xs font-semibold text-zinc-900 uppercase">Motivo o Descripción (Opcional)</label>
            <Textarea
              className="bg-zinc-50/50 resize-none"
              placeholder="Ej. Confirmado verbalmente con residente"
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
            disabled={registroMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRegister}
            className="w-full font-bold shadow-sm rounded-xl text-white bg-amber-500 hover:bg-amber-600"
            disabled={!nombre || !empresa || !vivienda || registroMutation.isPending}
          >
            {registroMutation.isPending ? "Registrando..." : "Registrar Ingreso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
