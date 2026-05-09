import { PartialType } from '@nestjs/mapped-types';
import { CreateEvidenciaIncidenciaDto } from './create-evidencia-incidencia.dto';

export class UpdateEvidenciaIncidenciaDto extends PartialType(CreateEvidenciaIncidenciaDto) {}