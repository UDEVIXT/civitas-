import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
  IsUUID,
  IsEnum,
  IsBoolean,
} from 'class-validator';

import { Transform } from 'class-transformer';
export class CreateVisitanteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  fecha_inicio: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value !== undefined) return new Date(value);
  })
  fecha_fin: Date | undefined;

  @IsNotEmpty()
  tipo_visitante: string;

  @IsNotEmpty()
  @IsPhoneNumber('MX')
  telefono: string;

  @IsNotEmpty()
  @IsString()
  tipo_vehiculo: string;

  @IsOptional()
  @IsString()
  motivo: string;

  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  es_frecuente: boolean;

  @IsOptional()
  foto_visitante?: any;
}
