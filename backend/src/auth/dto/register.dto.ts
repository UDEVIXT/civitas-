import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum RolRegistro {
  Residente = 'Residente',
  Guardia = 'Guardia',
  Administrador = 'Administrador',
}

// CA002 — Acentos, diéresis y ñ
// CA003 — Campos requeridos
// CA005 — Password segura
// CA007 — Formato email inválido
// CA008 — Roles inválidos

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  genero: string;

  @IsNotEmpty()
  fecha_nacimiento: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  nombre_usuario: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  correo: string;

  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message:
      'La contraseña debe contener al menos una letra y un número.',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsEnum(RolRegistro, {
    message:
      'El rol seleccionado no es válido. Solo se permite Residente, Guardia o Administrador.',
  })
  rol: RolRegistro;

  @IsString()
  @IsNotEmpty({
    message:
      'Debes validar tu credencial antes de completar el registro.',
  })
  verificationAccessToken: string;
}
