import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateEstadoQrDto {
  @IsIn(['habilitar', 'deshabilitar'])
  accion: 'habilitar' | 'deshabilitar';

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class UpdateEstadoQrMasivoDto extends UpdateEstadoQrDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids_visitante: string[];
}
