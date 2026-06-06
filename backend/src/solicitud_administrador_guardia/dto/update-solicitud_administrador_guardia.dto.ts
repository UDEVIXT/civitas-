import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudAdministradorGuardiaDto } from './create-solicitud_administrador_guardia.dto';

export class UpdateSolicitudAdministradorGuardiaDto extends PartialType(CreateSolicitudAdministradorGuardiaDto) {}