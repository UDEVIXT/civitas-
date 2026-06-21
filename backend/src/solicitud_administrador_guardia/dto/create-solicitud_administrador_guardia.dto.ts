import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsUrl, IsNotEmpty, IsDateString } from 'class-validator';
import { Rol, Estatus_Solicitud } from '@prisma/client';

export class CreateSolicitudAdministradorGuardiaDto {
  @IsUUID()
  @IsNotEmpty()
  id_usuario: string;

  @IsEnum(Rol)
  @IsNotEmpty()
  rol_solicitado: Rol;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  genero: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @IsString()
  @IsOptional()
  telefono?: string;
  
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsEnum(Estatus_Solicitud)
  @IsOptional()
  estatus_solicitud?: Estatus_Solicitud;

  @IsString()
  @IsOptional()
  credencial_frente_key?: string;

  @IsString()
  @IsOptional()
  credencial_reverso_key?: string;
}