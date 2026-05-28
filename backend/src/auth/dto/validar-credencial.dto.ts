import { IsEnum } from 'class-validator';

enum RolPermitido {
  Administrador = 'Administrador',
  Guardia = 'Guardia',
  Residente = 'Residente',
}

export class ValidarCredencialDto {
  @IsEnum(RolPermitido)
  rol: RolPermitido;
}
