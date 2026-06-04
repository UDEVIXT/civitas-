import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateEstadoQrDto {
  @IsIn(['habilitar', 'deshabilitar'])
  accion: 'habilitar' | 'deshabilitar';

  @IsOptional()
  @IsString()
  motivo?: string;
}
