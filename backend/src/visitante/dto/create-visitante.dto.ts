import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsBoolean,
} from 'class-validator';

import { Transform } from 'class-transformer';
export class CreateVisitanteDto {
  @IsString()
  @IsNotEmpty()
    nombre!: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(String(value)))
    fecha_inicio?: Date;

  // Frontend may send separate date + time fields instead of a combined fecha_inicio
  @IsOptional()
  @IsString()
    fecha_visita?: string;

  @IsOptional()
  @IsString()
    hora_estimada?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value !== undefined) return new Date(String(value));
    return undefined;
  })
    fecha_fin?: Date;

  @IsNotEmpty()
    tipo_visitante!: string;

  @IsNotEmpty()
  @IsPhoneNumber('MX')
    telefono!: string;

  @IsNotEmpty()
  @IsString()
    tipo_vehiculo!: string;

  @IsOptional()
  @IsString()
    motivo?: string;

  @IsOptional()
  @IsString()
    notas_adicionales?: string;

  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
    es_frecuente!: boolean;

  @IsOptional()
    foto_visitante?: any;
}
