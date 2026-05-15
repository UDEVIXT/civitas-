import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  identificador: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de verificación es obligatorio' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 caracteres' })
  codigo: string;
}