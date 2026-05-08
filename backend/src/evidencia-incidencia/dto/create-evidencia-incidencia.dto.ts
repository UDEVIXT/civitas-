import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateEvidenciaIncidenciaDto {
  @IsUUID()
  @IsNotEmpty()
  id_reporte!: string;

  @IsString()
  @IsNotEmpty()
  url_archivo!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  nombre_archivo!: string;
}