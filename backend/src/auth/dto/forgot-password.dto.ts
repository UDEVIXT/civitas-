import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString({ message: 'El identificador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El correo electrónico o teléfono es obligatorio' })
  identificador: string;
}