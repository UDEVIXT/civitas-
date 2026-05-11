//Components UI
import { Map, MapControls } from "@/components/ui/map";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { FieldError as CustomFieldError } from '@/components/ui/field-error';

interface LocationPickerProps {
  address?: string;
  isAddressLoading?: boolean;
  error?: string;
  onMapClick: (lng: number, lat: number) => void;
}

export function LocationPicker({ address, isAddressLoading, error, onMapClick }: LocationPickerProps) {
  return (
    <Field>
      <FieldLabel>Ubicación de tu reporte</FieldLabel>
      <Card className="h-52 p-0 overflow-hidden">
        <Map 
          center={[-0.1276, 51.5074]} 
          zoom={11}
          onClick={onMapClick}
        >
          <MapControls />
        </Map>
      </Card>
      <p className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {isAddressLoading ? "Cargando dirección..." : "Ubicación seleccionada: " + (address || "Sin dirección")}
      </p>
      <CustomFieldError className="text-xs mt-0" error={error} />
    </Field>
  );
}
