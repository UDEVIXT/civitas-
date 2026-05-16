import { PartialType } from '@nestjs/mapped-types';
import { CreateEvidenciaReporteDto } from './create-evidencia-reporte.dto';

export class UpdateEvidenciaReporteDto extends PartialType(CreateEvidenciaReporteDto) {}