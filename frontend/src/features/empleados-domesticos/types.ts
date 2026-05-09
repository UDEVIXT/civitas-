export type EmpleadoEstado = "Activo" | "Inactivo";

export interface EmpleadoDomestico {
  id: string;
  nombre: string;
  email: string;
  estado: EmpleadoEstado;
  destino: string;
  horarioAutorizado: string;
}
