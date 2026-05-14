export interface EmpleadoEditRequest {
  accion?: 'baja' | 'reactivacion' | 'edicion';
  data: {
    nombre?: string;
    horarios?: any[];
    activo?: boolean;
    motivo?: string;
  };
}
