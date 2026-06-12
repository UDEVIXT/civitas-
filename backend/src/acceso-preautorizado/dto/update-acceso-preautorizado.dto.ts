import { PartialType } from '@nestjs/swagger';
import { CreateAccesoPreautorizadoDto } from './create-acceso-preautorizado.dto';

export class UpdateAccesoPreautorizadoDto extends PartialType(CreateAccesoPreautorizadoDto) {}
