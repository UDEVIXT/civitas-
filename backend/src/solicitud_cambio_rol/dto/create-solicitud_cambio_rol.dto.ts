import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSolicitudCambioRolDto {
  @IsString()
  @IsNotEmpty()
  id_usuario!: string;

  @IsString()
  @IsNotEmpty()
  rol_solicitado!: string;

  @IsString()
  @IsNotEmpty()
  razon!: string;

  @IsString()
  @IsNotEmpty()
  estatus_solicitud: string;
}