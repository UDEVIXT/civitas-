export interface PersonaSolicitud {
  id: string;
  nombre: string;
  rol: string;
  correo: string;
  telefono: string | null;
  genero: string;
  fechaNacimiento: string;
  fechaSolicitud: string;
  estado: string;
  numeroEmpleado: string | null;
  tieneCredencialFrente: boolean;
  tieneCredencialReverso: boolean;
}
