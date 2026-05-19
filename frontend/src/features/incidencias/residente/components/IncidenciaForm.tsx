
//Components UI
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/UploadFile";
import { FieldError as CustomFieldError } from '@/components/ui/field-error';

//My Components
import { UserSelect } from "./UserSelect";
import { ReportTypeSelect } from "./ReportTypeSelect";
import { LocationPicker } from "./LocationPicker";

interface IncidenciaFormProps {
  formData: any;
  errors: any;
  address?: string;
  isAddressLoading?: boolean;
  onFieldChange: (field: string, value: any) => void;
  onFileChange: (files: File[]) => void;
  onMapClick: (lng: number, lat: number) => void;
  onLocationSelect?: (coords: { longitude: number; latitude: number }) => void;
  selectedCoords?: { longitude: number; latitude: number };
  reset?: boolean;
}

export function IncidenciaForm({
  formData,
  errors,
  address,
  isAddressLoading,
  onFieldChange,
  onFileChange,
  onMapClick,
  onLocationSelect,
  selectedCoords,
  reset
}: IncidenciaFormProps) {
  return (
    <FieldGroup className="no-scrollbar max-h-[60vh] overflow-y-auto px-2">
      <UserSelect
        value={formData.usuario}
        onChange={(value) => onFieldChange('usuario', value)}
        error={errors.usuario}
      />

      <ReportTypeSelect
        value={formData.tipoReporte}
        onChange={(value) => onFieldChange('tipoReporte', value)}
        error={errors.tipoReporte}
      />

      <Field>
        <FieldLabel>Motivo</FieldLabel>
        <Input 
          id="motivo" 
          placeholder="ej. Ruidos molestos" 
          value={formData.motivo || ''}
          onChange={(e) => onFieldChange('motivo', e.target.value)}
          className={errors.motivo ? 'border-destructive' : ''}
        />
        <CustomFieldError className="text-xs mt-0" error={errors.motivo} />
      </Field>

      <Field>
        <FieldLabel>Descripción</FieldLabel>
        <Textarea 
          className={`max-h-16 ${errors.descripcion ? 'border-destructive' : ''}`}
          placeholder="Cuéntanos qué sucedio o tu idea de mejora..." 
          value={formData.descripcion || ''}
          onChange={(e) => onFieldChange('descripcion', e.target.value)}
        />
        <CustomFieldError className="text-xs mt-0" error={errors.descripcion} />
      </Field>

      <LocationPicker
        address={address}
        isAddressLoading={isAddressLoading}
        error={errors.ubicacion}
        onMapClick={onMapClick}
        onLocationSelect={onLocationSelect}
        selectedCoords={selectedCoords}
        reset={reset}
      />

      <Field>
        <FieldLabel>Solución esperada</FieldLabel>
        <Textarea 
          className={`max-h-16 ${errors.solucionEsperada ? 'border-destructive' : ''}`}
          placeholder="¿Qué solución te gustaría recibir?" 
          value={formData.solucionEsperada || ''}
          onChange={(e) => onFieldChange('solucionEsperada', e.target.value)}
        />
        <CustomFieldError className="text-xs mt-0" error={errors.solucionEsperada} />
      </Field>

      <ImageUpload
        type="image"
        label="Sube imágenes o evidencia de tu reporte"
        onDataChange={onFileChange}
      />
    </FieldGroup>
  );
}

