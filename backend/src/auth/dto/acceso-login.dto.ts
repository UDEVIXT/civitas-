import {
  IsOptional,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class AccesoLoginDto {
  @IsString({
    message: 'El nombre de usuario debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre de usuario es obligatorio',
  })
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'El nombre de usuario no puede exceder 50 caracteres',
  })
  usuario: string;

  @IsOptional()
  @IsString({
    message: 'La contraseña debe ser texto',
  })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  password?: string;

  @IsOptional()
  @IsBoolean()
  recordarme?: boolean;
}
