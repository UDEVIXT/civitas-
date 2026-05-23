// Roles disponibles en el sistema
export enum ROLES {
  ADMINISTRADOR = "Administrador",
  GUARDIA = "Guardia",
  RESIDENTE = "Residente",
}

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleType, string> = {
  [ROLES.ADMINISTRADOR]: "Administrador",
  [ROLES.GUARDIA]: "Guardia",
  [ROLES.RESIDENTE]: "Residente",
};
