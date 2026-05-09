export type EmpleadoEstado = "Activo" | "Inactivo";

export interface EmpleadoDomestico {
  id: string;
  nombre: string;
  telefono: string;
  estado: EmpleadoEstado;
  destino: string;
  horarioAutorizado: string;
}
