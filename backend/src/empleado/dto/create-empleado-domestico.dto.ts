import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';

import { Transform, Type, plainToInstance } from 'class-transformer';
import { DiaSemana } from '@prisma/client';

export class HorarioDto {
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

  @IsString()
  @IsNotEmpty()
  id_tipo_servicio: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  confirmar_reuso_rfc?: boolean;

  // 1. Añadimos el campo de la foto para que el validador no lo rechace si llega en el body
  @IsOptional()
  foto_empleado?: any;

  // 2. Mantenemos el campo url_imagen para cuando asignamos la ruta de R2
  @IsOptional()
  @IsString()
  url_imagen?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // CRÍTICO: Convertir los objetos planos a instancias de la clase HorarioDto
        return plainToInstance(HorarioDto, parsed);
      } catch {
        return [];
      }
    }
    return value;
  })
  horarios: HorarioDto[];
}