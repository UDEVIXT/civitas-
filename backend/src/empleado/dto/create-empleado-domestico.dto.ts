import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';

import { Type } from 'class-transformer';
import { DiaSemana } from '@prisma/client';

class HorarioDto {
  @IsEnum(DiaSemana)
  dia_semana: DiaSemana;

  @IsString()
  hora_inicio: string;

  @IsString()
  hora_fin: string;
}

export class CreateEmpleadoDomesticoDto {
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @IsUUID()
  id_tipo_servicio: string;

  @IsString()
  @IsNotEmpty()
  cargo: string;

  @IsOptional()
  @IsPhoneNumber('MX')
  telefono?: string;

  @IsOptional()
  @IsString()
  url_imagen?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  horarios: HorarioDto[];
}