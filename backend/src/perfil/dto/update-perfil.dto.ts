import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdatePerfilDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  nombre!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, {
    message: 'Los apellidos no pueden superar los 100 caracteres.',
  })
  apellidos?: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio.' })
@Matches(/^(?=(?:\D*\d){10}\D*$)[0-9+\-\s()]+$/, {
  message: 'El teléfono debe tener exactamente 10 dígitos.',
})
telefono!: string;
}