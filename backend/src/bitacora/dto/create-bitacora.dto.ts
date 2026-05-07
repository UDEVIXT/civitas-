import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBitacoraDto {
  @IsNotEmpty({
    message: 'El ID del guardia es obligatorio para registrar la salida.',
  })
  @IsUUID('4', { message: 'El ID del guardia debe ser un UUID válido.' })
  id_guardia: string;

  @IsOptional()
  comentario_salida?: string;
}
