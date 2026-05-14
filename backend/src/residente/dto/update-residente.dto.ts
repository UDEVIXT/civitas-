import { PartialType } from '@nestjs/swagger';
import { CreateResidenteDto } from './create-residente.dto';

export class UpdateResidenteDto extends PartialType(CreateResidenteDto) {}
