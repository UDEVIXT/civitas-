"use client";

import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalConfirmarVinculacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ModalConfirmarVinculacion({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: ModalConfirmarVinculacionProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-0 shadow-2xl">
        <div className="relative px-6 pb-6 pt-8 text-center sm:px-8">
          <DialogHeader className="items-center gap-3 text-center">
            {/* Ícono representativo de "Enlace/Vinculación" */}
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
              <Link className="size-6" />
            </div>
            
            <DialogTitle className="text-2xl font-semibold text-zinc-900">
              Empleado ya registrado
            </DialogTitle>
            
            <DialogDescription className="max-w-sm text-sm leading-6 text-zinc-600">
              Ya existe un empleado con este RFC registrado en otra vivienda de la privada. ¿Deseas vincular su perfil también a tus accesos autorizados?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-8 flex-row gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-xl bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Vinculando..." : "Sí, vincular empleado"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}