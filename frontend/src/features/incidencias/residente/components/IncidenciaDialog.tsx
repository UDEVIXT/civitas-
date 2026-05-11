// Icons
import { ClipboardList } from "lucide-react";

// Components UI
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// My Components
import { IncidenciaForm } from "./IncidenciaForm";

interface IncidenciaDialogProps {
  formData: any;
  errors: any;
  address?: string;
  isAddressLoading?: boolean;
  isSubmitting: boolean;
  isPending: boolean;
  onFieldChange: (field: string, value: any) => void;
  onFileChange: (files: File[]) => void;
  onMapClick: (lng: number, lat: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function IncidenciaDialog({
  formData,
  errors,
  address,
  isAddressLoading,
  isSubmitting,
  isPending,
  onFieldChange,
  onFileChange,
  onMapClick,
  onSubmit
}: IncidenciaDialogProps) {
  return (
    <Dialog>
      <form onSubmit={onSubmit}>
        <DialogTrigger asChild>
          <Button variant="outline">Agregar reporte</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center">
            <div className="p-2 border-6 border-primary/10 bg-primary/20 bg-clip-padding rounded-full flex items-center justify-center text-primary">
              <ClipboardList />
            </div>
            <DialogTitle className="text-center">Registrar tu queja, sugerencia o incidencia</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Comparte los detalles para agilizar tu solicitud.
            </DialogDescription>
          </DialogHeader>
          
          <IncidenciaForm
            formData={formData}
            errors={errors}
            address={address}
            isAddressLoading={isAddressLoading}
            onFieldChange={onFieldChange}
            onFileChange={onFileChange}
            onMapClick={onMapClick}
          />
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="text-foreground"
              disabled={isSubmitting || isPending}
              onClick={(e) => {
                e.preventDefault();
                onSubmit(e as any);
              }}
            >
              {isSubmitting || isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
