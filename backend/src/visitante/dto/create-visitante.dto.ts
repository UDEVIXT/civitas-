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

export class CreateVisitanteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNotEmpty()
  fecha_inicio: Date;

  @IsOptional()
  fecha_fin: Date | undefined;

  @IsNotEmpty()
  tipo_visitante: string;

  @IsNotEmpty()
  @IsPhoneNumber('MX')
  telefono: string;

  @IsNotEmpty()
  @IsString()
  tipo_vehiculo: string;

  @IsBoolean()
  es_frecuente: boolean;

  @IsOptional()
  foto_visitante?: any;
}
