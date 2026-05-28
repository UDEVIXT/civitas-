import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegistroManualDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  empresa: string;

  @IsString()
  @IsNotEmpty()
  vivienda: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}
