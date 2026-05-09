import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FindHistoryDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  nombreVisitante?: string;

  @IsOptional()
  @IsString()
  numeroVivienda?: string;

}