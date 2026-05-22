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

  @IsString()
  @IsNotEmpty()
  rfc: string;

  @IsUUID()
  id_tipo_servicio: string;

  @IsOptional()
  @IsBoolean()
  confirmar_reuso_rfc?: boolean;

  @IsOptional()
  @IsString()
  cargo?: string;

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
