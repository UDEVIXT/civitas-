import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TipoReporte, EstadoReporte, PrioridadReporte } from '@prisma/client';

export class CreateReporteDto {
  @IsString()
  @IsNotEmpty()
  id_usuario!: string;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsEnum(TipoReporte)
  tipo!: TipoReporte;

  @IsNumber()
  latitud!: number;

  @IsNumber()
  longitud!: number;

  @IsEnum(EstadoReporte)
  estado!: EstadoReporte;

  @IsEnum(PrioridadReporte)
  prioridad!: PrioridadReporte;

  @IsBoolean()
  es_anonimo!: boolean;

  @IsString()
  @IsOptional()
  resultado_esperado?: string;

  @IsString()
  @IsOptional()
  resultado_solucion?: string;
}