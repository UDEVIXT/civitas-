import { PartialType } from '@nestjs/swagger';
import { CreateSolicitudCambioRolDto } from './create-solicitud_cambio_rol.dto';

export class UpdateSolicitudCambioRolDto extends PartialType(CreateSolicitudCambioRolDto) {}
