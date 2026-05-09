import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum TipoPersona {
  VISITANTE = 'visitante',
  RESIDENTE = 'residente',
  EMPLEADO_DOMESTICO = 'empleado_domestico',
  PROVEEDOR = 'proveedor',
}

export enum Ordenamiento {
  RECIENTE = 'reciente',
  ANTIGUO = 'antiguo',
}

export class BitacoraFiltroDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TipoPersona)
  tipo?: TipoPersona;

  @IsOptional()
  @IsString()
  residencia?: string;

  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsEnum(Ordenamiento)
  ordenar?: Ordenamiento;

  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '10';
}
