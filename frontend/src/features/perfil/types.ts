export interface PerfilData {
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: string;
  fechaRegistro: string;
}

export interface UpdatePerfilPayload {
  nombre: string;
  apellidos: string;
  telefono: string;
}

export interface ChangePasswordPayload {
  passwordActual: string;
  passwordNuevo: string;
}

export interface ChangeEmailPayload {
  nuevoCorreo: string;
}
