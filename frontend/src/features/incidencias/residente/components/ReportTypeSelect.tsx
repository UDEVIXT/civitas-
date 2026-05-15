//Components UI
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError as CustomFieldError } from '@/components/ui/field-error';

interface ReportTypeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ReportTypeSelect({ value, onChange, error }: ReportTypeSelectProps) {
  return (
    <Field>
      <FieldLabel>Tipo de reporte</FieldLabel>
      <Select 
        value={value || ''}
        onValueChange={onChange}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder="Selecciona el tipo de reporte" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tipo de reporte</SelectLabel>
            <SelectItem value="QUEJA" className="cursor-pointer">
              Queja
            </SelectItem>
            <SelectItem value="SUGERENCIA" className="cursor-pointer">
              Sugerencia
            </SelectItem>
            <SelectItem value="INCIDENCIA" className="cursor-pointer">
              Incidente
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <CustomFieldError className="text-xs mt-0" error={error} />
    </Field>
  );
}
