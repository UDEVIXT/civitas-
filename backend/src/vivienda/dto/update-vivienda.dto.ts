import { PartialType } from '@nestjs/swagger';
import { CreateViviendaDto } from './create-vivienda.dto';

export class UpdateViviendaDto extends PartialType(CreateViviendaDto) {}
