import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsBoolean,
  MinLength,
  ValidateIf,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Data
class DetalleEmpleadoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsArray()
  @IsOptional()
  horarios?: any[];

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsString({ message: 'El motivo debe ser texto' })
  @IsOptional()
  motivo?: string;
}

// DTO principal
export class UpdateEmpleadoDto {
  @IsEnum(['baja', 'reactivacion', 'edicion'])
  @IsNotEmpty()
  accion!: 'baja' | 'reactivacion' | 'edicion';

  @ValidateNested()
  @Type(() => DetalleEmpleadoDto)
  @IsNotEmpty()
  data!: DetalleEmpleadoDto;

  // Si se quiere dar de baja, el motivo es obligatorio en data
  @ValidateIf((o: UpdateEmpleadoDto) => o.accion === 'baja')
  @IsNotEmpty({ message: 'El motivo es obligatorio para dar de baja' })
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres' })
  private get motivoValidator() {
    return this.data?.motivo;
  }
}
