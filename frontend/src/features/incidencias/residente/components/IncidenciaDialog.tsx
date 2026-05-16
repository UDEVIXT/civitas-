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
  onLocationSelect?: (coords: { longitude: number; latitude: number }) => void;
  selectedCoords?: { longitude: number; latitude: number };
  onSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
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
  onLocationSelect,
  selectedCoords,
  onSubmit,
  onClose
}: IncidenciaDialogProps) {
  return (
    <Dialog>
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
        
        <form onSubmit={onSubmit}>
          <IncidenciaForm
            formData={formData}
            errors={errors}
            address={address}
            isAddressLoading={isAddressLoading}
            onFieldChange={onFieldChange}
            onFileChange={onFileChange}
            onMapClick={onMapClick}
            onLocationSelect={onLocationSelect}
            selectedCoords={selectedCoords}
          />
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="text-foreground"
              disabled={isSubmitting || isPending}
            >
              {isSubmitting || isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
